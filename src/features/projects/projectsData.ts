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
  status: 'CASE READY / 可展示' | 'IN PROGRESS / 进行中' | 'PLACEHOLDER / 待补充';
}

export const professionalProjects: ProjectData[] = [
  {
    id: 'p1',
    number: 'PROJECT-01',
    titleEn: 'Art-domain Text Annotation',
    titleZh: '艺术垂类文本标注项目',
    type: 'SFT 数据构造 / 艺术内容评测 / 文本标注',
    role: '内容质量判断、问答改写、规则执行、艺术知识校验',
    actions: '规则理解、质量判断、问答改写、数据严谨性',
    capabilities: '规则理解、专业内容判断、数据严谨性、文本改写',
    status: 'PLACEHOLDER / 待补充'
  },
  {
    id: 'p2',
    number: 'PROJECT-02',
    titleEn: 'AI Customer Service Annotation',
    titleZh: 'AI 客服多模态标注项目',
    type: '语音转写 / 多轮对话 / 客服意图识别 / 模型回复评估',
    role: 'ASR 纠错、用户意图判断、转人工边界、语气规范',
    actions: '规则理解、意图判断、多轮评估、语音质检',
    capabilities: '多轮上下文理解、质量评估、规则执行、场景判断',
    status: 'PLACEHOLDER / 待补充'
  }
];

export const agentProjects: ProjectData[] = [
  {
    id: 'a1',
    number: 'PROJECT-03',
    titleEn: 'Interactive AI Art Lab',
    titleZh: 'AI ART LAB 个人网站',
    type: '个人网站 / AI Agent 协作 / 交互实验',
    role: '需求拆解、Agent 指令编写、设计审查、版本回退、构建验证',
    actions: '架构规划、Framer Motion 交互、提示词编写、代码审查',
    capabilities: 'AI 工具协作、需求表达、结果验收、项目迭代、审美判断',
    status: 'IN PROGRESS / 进行中'
  },
  {
    id: 'a2',
    number: 'PROJECT-04',
    titleEn: 'Text Collapse Experiment',
    titleZh: 'TEXT COLLAPSE 文字坍塌实验',
    type: 'Canvas 交互 / 数字艺术实验 / 文字重构',
    role: '交互需求设计、动画逻辑审查、视觉方向把控、验收反馈',
    actions: '粒子物理系统设计、鼠标斥力实现、RAF 性能优化',
    capabilities: '复杂需求拆解、状态机理解、视觉叙事、Agent 协作',
    status: 'CASE READY / 可展示'
  }
];
