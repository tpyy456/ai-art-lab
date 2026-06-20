import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PORT = Number(process.env.PORT || 3001);
const MAX_JD_LENGTH = 6000;
const DEFAULT_API_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-chat';

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const splitAt = trimmed.indexOf('=');
    if (splitAt <= 0) continue;
    const key = trimmed.slice(0, splitAt).trim();
    const rawValue = trimmed.slice(splitAt + 1).trim();
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

loadEnvFile();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_JD_LENGTH + 2048) {
        rejectBody(new Error('REQUEST_TOO_LARGE'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolveBody(body ? JSON.parse(body) : {});
      } catch {
        rejectBody(new Error('INVALID_JSON'));
      }
    });
    request.on('error', rejectBody);
  });
}

function normalizeMatchResult(raw) {
  const fallbackArray = (value) => (Array.isArray(value) ? value.map(String).filter(Boolean).slice(0, 5) : []);
  const score = Number(raw?.score);

  return {
    summary: String(raw?.summary || '已完成岗位匹配分析。'),
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 70,
    strengths: fallbackArray(raw?.strengths),
    gaps: fallbackArray(raw?.gaps),
    suggestions: fallbackArray(raw?.suggestions),
  };
}

function extractJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function callModel(jd) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    const error = new Error('AI_API_KEY_MISSING');
    error.statusCode = 503;
    throw error;
  }

  const baseUrl = (process.env.AI_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const model = process.env.AI_MODEL || DEFAULT_MODEL;
  const endpoint = `${baseUrl}/chat/completions`;

  const modelResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            '你是一个求职岗位匹配分析助手。只返回 JSON，不要输出 Markdown。JSON 字段必须包含 summary, score, strengths, gaps, suggestions。',
        },
        {
          role: 'user',
          content: `请基于候选人的 AI 训练师、文本标注、数据质检、艺术背景和 AI Agent 项目经验，分析下面岗位 JD 的匹配度。JD：\n${jd}`,
        },
      ],
    }),
  });

  if (!modelResponse.ok) {
    const error = new Error('MODEL_REQUEST_FAILED');
    error.statusCode = 502;
    throw error;
  }

  const payload = await modelResponse.json();
  const content = payload?.choices?.[0]?.message?.content;
  const parsed = extractJson(content);
  if (!parsed) {
    const error = new Error('MODEL_RESPONSE_INVALID');
    error.statusCode = 502;
    throw error;
  }

  return normalizeMatchResult(parsed);
}

async function handleResumeMatch(request, response) {
  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    if (error.message === 'REQUEST_TOO_LARGE') {
      sendJson(response, 413, { error: 'JD 内容过长，请缩短后再试。' });
      return;
    }
    sendJson(response, 400, { error: '请求格式不是有效 JSON。' });
    return;
  }

  const jd = String(body.jd || '').trim();
  if (!jd) {
    sendJson(response, 400, { error: '请先粘贴岗位 JD。' });
    return;
  }
  if (jd.length > MAX_JD_LENGTH) {
    sendJson(response, 413, { error: 'JD 内容过长，请控制在 6000 字以内。' });
    return;
  }

  try {
    const result = await callModel(jd);
    sendJson(response, 200, result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message =
      error.message === 'AI_API_KEY_MISSING'
        ? '后端 AI_API_KEY 未配置。'
        : '岗位匹配服务暂时不可用，请稍后重试。';
    sendJson(response, statusCode, { error: message });
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`);

  if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
    response.writeHead(204, {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': '600',
    });
    response.end();
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/resume-match') {
    await handleResumeMatch(request, response);
    return;
  }

  sendJson(response, 404, { error: 'Not found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`ai-art-lab-api listening on 127.0.0.1:${PORT}`);
});
