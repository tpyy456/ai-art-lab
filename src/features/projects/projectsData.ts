import React from 'react';

export interface ProjectData {
  id: string;
  number: string;
  titleEn: string;
  titleZh: string;
  type: string;
  role: string;
  actions: string;
  capabilities: string;
  status: 'CASE READY / 可展示' | 'IN PROGRESS / 进行中';
  details: {
    background: string;
    workflow: string;
    qualityRules: string;
    output: string;
  };
}

export const professionalProjects: ProjectData[] = [
  {
    id: 'p1',
    number: 'PROJECT-01',
    titleEn: 'Art-domain Text Annotation',
    titleZh: '艺术垂类文本标注项目',
    type: 'SFT 数据构造 / 艺术内容评测 / 文本标注',
    role: '判断回答准确性、专业性、完整性；对不严谨回答进行改写。',
    actions: '内容质量判断、问答改写、规则执行、艺术知识校验',
    capabilities: '内容质量判断、规则执行、专业知识校验、文本改写',
    status: 'CASE READY / 可展示',
    details: {
      background: '围绕艺术学、美术史内容进行文本标注、问答评估与改写。',
      workflow: '读取问题与模型回答 → 对照参考答案 → 判断问题类型 → 标记质量 → 改写回答 → 复查表达。',
      qualityRules: '事实准确、术语一致、参考依据清晰、表达适合作为训练数据。',
      output: '艺术垂类知识库、改写规则、效率提升。'
    }
  },
  {
    id: 'p2',
    number: 'PROJECT-02',
    titleEn: 'AI Customer Service Annotation',
    titleZh: 'AI 客服多模态标注项目',
    type: '语音转写 / 多轮对话 / 客服意图识别 / 模型回复评估',
    role: 'ASR 纠错、意图判断、模型回复质量判断、转人工边界识别。',
    actions: '规则理解、意图判断、多轮评估、语音质检',
    capabilities: '多轮理解、用户意图判断、客服场景评估、质量控制',
    status: 'CASE READY / 可展示',
    details: {
      background: '面向会员充值、售后等客服场景，对语音/文本多轮对话进行标注与评估。',
      workflow: '核对语音转写 → 判断用户意图 → 检查上下文 → 评估回复是否解决问题 → 标记或改写。',
      qualityRules: '上下文一致、解决路径明确、语气合规、必要时转人工。',
      output: '场景模板、规则补充、质检标准。'
    }
  }
];

export const agentProjects: ProjectData[] = [
  {
    id: 'a1',
    number: 'PROJECT-03',
    titleEn: 'Interactive AI Art Lab',
    titleZh: 'AI ART LAB 个人网站',
    type: '个人网站 / AI Agent 协作 / 交互实验',
    role: '提出需求、拆分任务、审查视觉、生成 Agent 指令、验收效果、控制版本。',
    actions: '多 Agent 协作、Git 版本管理、页面模块化、转场统一、性能控制。',
    capabilities: '需求拆解、Agent 协作、结果验收、项目统筹、审美判断',
    status: 'IN PROGRESS / 进行中',
    details: {
      background: '通过 AI Agent 协作完成一个高交互个人网站，用于展示个人能力与 AI 实践。',
      workflow: '需求描述 → Agent 执行 → 视觉审查 → bug 反馈 → 回退备份 → 重新迭代。',
      qualityRules: '视觉克制、交互流畅、无缝扫描转场、组件解耦与逻辑清晰。',
      output: 'Intro、神性大卫、AI LAB、Text Collapse、About、Projects 等页面。'
    }
  },
  {
    id: 'a2',
    number: 'PROJECT-04',
    titleEn: 'Text Collapse Experiment',
    titleZh: 'TEXT COLLAPSE 文字坍塌实验',
    type: 'Canvas 交互 / 数字艺术实验 / 文字重构',
    role: '确定视觉方向、定义坍塌逻辑、审查动画手感、提出修复需求。',
    actions: '状态机设计、Canvas 动画审查、节奏调优、视觉叙事控制。',
    capabilities: '复杂需求表达、交互验收、视觉叙事、AI Agent 协作',
    status: 'CASE READY / 可展示',
    details: {
      background: '将中文文本和田字格系统设计成可坍塌、可重塑的交互实验。',
      workflow: '文字矩阵 → 田字格坍塌 → 废墟堆积 → 向日葵重塑 → 光束完成。',
      qualityRules: '物理表现自然、交互边界清晰、文字碎片连贯、动画性能达标。',
      output: '文字坍塌、网格碎裂、废墟堆积、数字向日葵重塑。'
    }
  }
];
