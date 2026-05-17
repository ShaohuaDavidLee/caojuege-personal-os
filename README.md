<img width="1583" height="822" alt="image" src="https://github.com/user-attachments/assets/fe912f74-d6b7-4a4e-9fd8-4349165cab9e" />


# 草诀歌个人说明书_V0.1.4

一个用于生成 `Personal OS` 的 Agent Skill。

它把一个人的已有材料、补充回答和可选采访，整理成两份资产：

1. `persona-agent.md`：给 AI agent 使用，帮助它理解这个人的事实、判断、风格、边界和协作方式。
2. `personal-homepage.html`：给人使用，帮助合作方快速知道这个人是谁、能提供什么、正在寻找什么合作。

## 适合什么场景

- 想做一份个人说明书或个人主页
- 想把已有文章、简历、播客、笔记蒸馏成 AI persona
- 想让合作方更快理解"我是谁 / 我能提供什么 / 我在找什么"
- 想把深度访谈沉淀成可复用的身份资产

## 工作流

1. 先读取已有材料
2. 只补最关键的信息缺口
3. 按需做一轮采访，不强制
4. 输出两份核心资产

## 文件结构

```text
caojuege-personal-os/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── assets/
│   └── personal-homepage-template.html
└── references/
    ├── intake-and-interview.md
    └── output-spec.md
```

## 安装与使用

### Codex

把整个仓库目录放进本地 skills 目录，例如：

```bash
git clone https://github.com/ShaohuaDavidLee/caojuege-personal-os.git \
  ~/.codex/skills/caojuege-personal-os
```

然后在 Codex 中调用：

```text
$caojuege-personal-os
```

### Claude Code

Claude Code 支持基于 `SKILL.md` 的 skills。个人级安装可放在：

```bash
git clone https://github.com/ShaohuaDavidLee/caojuege-personal-os.git \
  ~/.claude/skills/caojuege-personal-os
```

在 Claude Code 中可以直接调用：

```text
/caojuege-personal-os
```

如果只想让某个项目使用，也可以把仓库放在：

```text
.claude/skills/caojuege-personal-os/
```

### OpenClaw

OpenClaw 也支持 `SKILL.md`。个人级安装可放在：

```bash
git clone https://github.com/ShaohuaDavidLee/caojuege-personal-os.git \
  ~/.agents/skills/caojuege-personal-os
```

项目级或 workspace 级也可以分别放在：

```text
<project>/.agents/skills/caojuege-personal-os/
<workspace>/skills/caojuege-personal-os/
```

### 其他支持 Agent Skills 的工具

如果你的 agent 支持 `SKILL.md` / Agent Skills 约定，直接导入或复制整个仓库目录即可。

## 调用示例

```text
用 $caojuege-personal-os 根据这些材料帮我生成个人说明书。
```

Claude Code 中可以把 `$caojuege-personal-os` 换成 `/caojuege-personal-os`。

## 设计原则

- 低摩擦：先吃已有材料，不默认发长问卷
- 可选采访：只有在语料不足或需要更深版本时才追问
- 双重输出：同时服务人和 AI
- 具体优先：少写空泛人格词，多写能力、合作、边界
- 克制表达：不把个人说明书做成营销包装或完整传记

## Made by

[草诀歌 AI Labs](https://www.caojuege.com/)

## 版本

当前版本：`v0.1.4`

版本建议：

- 用 Git tag / GitHub Release 管理公开版本
- `v0.1.x`：工作流和输出结构仍在快速迭代
- `v1.0.0`：当输入流程、采访框架和双资产输出都稳定后再发布
- `SKILL.md` 里先不额外加入自定义 `version` 字段，避免不同 agent 的解析器行为不一致
