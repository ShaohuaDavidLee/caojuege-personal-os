<img width="1100" height="797" alt="image" src="https://github.com/user-attachments/assets/46cf35f1-101a-4df2-9e43-226d316d6f75" />

# 司马迁.skill

> 人人都有自己的司马迁。

`司马迁.skill` 是一个帮你写下“我是谁”的开源 Agent Skill。

它有两个入口：

- **轻列传**：30 秒，生成一张《某某列传》卡片，下载成 1080x1080 图片，适合发朋友圈、小红书，或给自己看一眼“AI 眼里的我”。
- **精列传**：30 分钟，把你的文章、简历、播客、社媒、笔记和可选访谈，整理成一套完整的 `Personal OS`。


轻列传是一张图。

精列传是一套个人说明书。

原来的 Personal OS 工作流，现在就是精列传。

背后的方法，全部开源在这里。

## 宣言

司马迁来不及做的，是给还活着的年轻人立传。

AI 时代，如果记录一个人的资源不再稀缺，我们想尝试一次：在一个人最宝贵的年岁里，帮他知道自己是谁。

这份被认真记录的资格，也应该留给正在寻找自己作品、还有时间的人。完整文字见 [`MANIFESTO.md`](./MANIFESTO.md)，原始稿件见 [`docs/simaqian-manifesto.docx`](./docs/simaqian-manifesto.docx)。

## 立即体验

打开：<https://simaqian.caojuege.com>

你可以直接选择：

| 模式 | 适合谁 | 输出 |
| --- | --- | --- |
| 轻列传 | 想先玩一下、发一张图、看看 AI 如何理解自己 | 一张《某某列传》卡片 |
| 精列传 | 想认真整理自己，让 AI 和合作方更懂你 | `persona-agent.md` + `personal-homepage.html` |

## 精列传会生成什么

1. `persona-agent.md`

   给 AI agent 用，帮助它理解你的事实、判断、风格、边界和协作方式。

2. `personal-homepage.html`

   给人看，帮助合作方快速知道你是谁、能提供什么、正在寻找什么合作。

它不是人格测试，不是心理诊断，也不是营销包装。

它只做一件事：把已经在你身上的东西，写成 AI 和人都能读懂的形态。
<img width="1536" height="1074" alt="image" src="https://github.com/user-attachments/assets/13b563c5-c579-4da6-a36c-ba47a729a270" />


## 如何使用精列传

### 用 Claude Code / Codex / Antigravity / OpenClaw

把下面这段粘给你的 Agent：

```text
帮我跑 github.com/ShaohuaDavidLee/simaqian 这个 skill。
如果还没装，先 clone 到 ~/.claude/skills/simaqian.skill。
我的材料放在 ./me/ 里。如果我没材料，访谈我就行。
```

Agent 会读取仓库、执行 `SKILL.md` 里的工作流，并生成两份资产。

### 用 ChatGPT / Claude.ai / Kimi / 豆包

把下面这段粘进聊天窗口：

```text
请按 github.com/ShaohuaDavidLee/simaqian 这个仓库的 SKILL.md
帮我跑一份个人说明书。读完 README、SKILL.md 和 references/
就能开始。我的材料下面给你。
```

然后继续贴你的材料：文章、简历、播客转写、社媒长帖、作品链接都可以。

没有材料也可以直接说：

```text
我没有材料，访谈我吧。
```

## 它怎么工作

精列传默认四步：

1. **先吸收材料**：不一上来发长问卷，先读你已经写下、说过、做过的东西。
2. **再补关键缺口**：只问少量高杠杆问题，比如“你不是谁？”“别人最容易误解你什么？”“AI 绝对不能替你说什么？”
3. **可选深度访谈**：如果你想要更像自己的版本，再做 6-10 个定制追问。
4. **输出两份资产**：一份给 AI 用，一份给人看。

想先看成品效果：

[examples/david-persona-agent.public.md](./examples/david-persona-agent.public.md)

## 适合什么场景

- 想做一份个人说明书或个人主页
- 想让 AI 更准确地理解和协助你
- 想把文章、简历、播客、笔记蒸馏成 AI persona
- 想让合作方更快知道“你是谁 / 你能提供什么 / 你在找什么”
- 想在做作品、转型、创业前，更清楚地整理自己的方向

## 隐私默认

默认采取“公开行为对齐”原则：

如果一项信息只在简历或私聊里出现，但公开文章、播客、社媒、官网从未提及，默认不写进 persona。用户明确同意后才纳入。

家庭、年龄、薪资、电话、住址、健康、未公开商业合作等敏感字段默认跳过。完整规则见 [`SKILL.md`](./SKILL.md)。

## 文件结构

```text
simaqian.skill/
├── MANIFESTO.md
├── SKILL.md
├── agents/
│   └── openai.yaml
├── docs/
│   └── simaqian-manifesto.docx
├── assets/
│   ├── lieZhuan-template.html
│   ├── personal-homepage-template.html
│   └── friend-review-template.md
├── examples/
│   └── david-persona-agent.public.md
├── landing/
│   └── index.html
└── references/
    ├── intake-and-interview.md
    └── output-spec.md
```

## 设计原则

- **低摩擦**：先吃已有材料，不默认发长问卷。
- **双入口**：轻列传用于快速体验，精列传用于认真整理。
- **双输出**：同时服务 AI 和人。
- **具体优先**：少写空泛人格词，多写事实、能力、判断和边界。
- **克制表达**：不把个人说明书写成成功学包装。

## 为什么开源

司马迁把列传写给帝王将相，也写给刺客、游侠、商人和滑稽艺人。

AI 时代，记录一个人的资源不再那么稀缺。也许我们可以更早一点，在一个人还在寻找、还在创造、还有时间的时候，帮他把自己写清楚。

这就是 `司马迁.skill` 想做的事。

## Made by

[草诀歌 AI Labs](https://www.caojuege.com/) — 一个帮助人用 AI 做出“作品型产品”的社区。

## 版本

当前版本：`v0.2.3`
