# 草诀歌个人说明书<img width="1146" height="709" alt="image" src="https://github.com/user-attachments/assets/394c23da-5a40-4b61-996a-86a00f6fdd51" />


一个用于生成 `Personal OS` 的 Codex skill。

它把一个人的已有材料、补充回答和可选采访，整理成两份资产：

1. `persona-agent.md`：给 AI agent 使用，帮助它理解这个人的事实、判断、风格、边界和协作方式。
2. `personal-homepage.html`：给人使用，帮助合作方快速知道这个人是谁、能提供什么、正在寻找什么合作。

## 适合什么场景

- 想做一份个人说明书或个人主页
- 想把已有文章、简历、播客、笔记蒸馏成 AI persona
- 想让合作方更快理解“我是谁 / 我能提供什么 / 我在找什么”
- 想把深度访谈沉淀成可复用的身份资产

## 工作流

1. 先读取已有材料
2. 只补最关键的信息缺口
3. 按需做一轮采访，不强制
4. 输出两份核心资产

## 文件结构

```text
caojuege-personal-manual/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── assets/
│   └── personal-homepage-template.html
└── references/
    ├── intake-and-interview.md
    └── output-spec.md
```

## 使用方式

在 Codex 中调用：

```text
$caojuege-personal-manual
```

示例：

```text
用 $caojuege-personal-manual 根据这些材料帮我生成个人说明书。
```

## 设计原则

- 低摩擦：先吃已有材料，不默认发长问卷
- 可选采访：只有在语料不足或需要更深版本时才追问
- 双重输出：同时服务人和 AI
- 具体优先：少写空泛人格词，多写能力、合作、边界
- 克制表达：不把个人说明书做成营销包装或完整传记

## Made by

[草诀歌 AI Labs](https://www.caojuege.com/)

