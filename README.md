<img width="1583" height="822" alt="image" src="https://github.com/user-attachments/assets/fe912f74-d6b7-4a4e-9fd8-4349165cab9e" />


# 司马迁.skill

一个用于生成 `Personal OS` 的 Agent Skill。

> 司马迁.skill 是一个系列的第一卷。它帮你写下"你是谁"。

它把一个人的已有材料、补充回答和可选采访，整理成两份资产：

1. `persona-agent.md`：给 AI agent 使用，帮助它理解这个人的事实、判断、风格、边界和协作方式。
2. `personal-homepage.html`：给人使用，帮助合作方快速知道这个人是谁、能提供什么、正在寻找什么合作。

## 适合什么场景

- 想做一份个人说明书或个人主页给合作的人、Agent用
- 想把已有文章、简历、播客、笔记蒸馏成 AI persona
- 想让合作方更快理解"我是谁 / 我能提供什么 / 我在找什么"
- 想把深度访谈沉淀成可复用的身份资产

## 如何使用

不用 git clone，不用编辑配置文件。**粘一段话给 agent，它会自己搞定剩下的**。

### 用 Claude Code / Codex（推荐）

把下面这段粘进 Claude Code 或 Codex：

```text
帮我跑 github.com/ShaohuaDavidLee/simaqian 这个 skill。
如果还没装，先 clone 到 ~/.claude/skills/simaqian.skill。
我的材料放在 ./me/ 里。如果我没材料，访谈我就行。
```

agent 会自己 clone 仓库、读 SKILL.md、按工作流跑。

### 用 claude.ai / ChatGPT / 豆包 / Kimi

把下面这段粘进任何 AI 聊天窗口：

```text
请按 github.com/ShaohuaDavidLee/simaqian 这个仓库的 SKILL.md
帮我跑一份个人小传。读完仓库的 README、SKILL.md 和 references/
就能开始。我的材料下面给你。
```

然后把你的材料粘在后面（文章、简历、播客转写、社媒长贴都行）。

### 完全没有材料？

直接说"我没有材料，访谈我吧"。skill 会切到访谈模式，30 分钟左右问完。

---

想先看跑完是什么样？→ [examples/david-persona-agent.public.md](./examples/david-persona-agent.public.md)

## 工作流

1. 先读取已有材料
2. 只补最关键的信息缺口
3. 按需做一轮采访，不强制
4. 输出两份核心资产
5. 在 persona 里加入 `未竟之处` 和 `盲区` 两节，分别标注尚未闭合的部分、和可能写偏的地方
6. 可选：把 persona 发给 1–2 个熟悉你的朋友，用 `friend-review-template.md` 帮你校对哪里写偏了
7. 想修订时，改 `persona-agent.md`，让 AI 据此重新生成 homepage——不建议手动改 HTML

## 文件结构

```text
simaqian.skill/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── assets/
│   ├── personal-homepage-template.html
│   └── friend-review-template.md
├── examples/
│   ├── README.md
│   └── david-persona-agent.public.md
└── references/
    ├── intake-and-interview.md
    └── output-spec.md
```

## 设计原则

- 低摩擦：先吃已有材料，不默认发长问卷
- 可选采访：只有在语料不足或需要更深版本时才追问
- 双重输出：同时服务人和 AI
- 具体优先：少写空泛人格词，多写能力、合作、边界
- 克制表达：不把个人说明书做成营销包装或完整传记

## 隐私默认

默认采取"公开行为对齐"原则：如果一项信息只在简历或私聊里出现，但本人的公开渠道（官网、文章、社媒、播客）从未提及——默认不写进 persona。

家庭、年龄、薪资、电话、住址、健康、未公开商业合作等敏感字段默认跳过。用户明确同意后才纳入。完整字段清单见 [`SKILL.md`](./SKILL.md) 中的 `隐私默认` 一节。

## 如何迭代和修订

`persona-agent.md` 是源文件。`personal-homepage.html` 只是它的一个视图。

### 改 persona-agent.md（容易）

用任何文本编辑器打开，直接改即可。它是 Markdown。

朋友校准反馈、半年后的自我更新、新经历的补充——都改这一份。

### 改 personal-homepage.html（不建议手动改）

把 HTML 当作“从 persona 渲染出来的视图”。要变化时，告诉 AI：

> “我把 persona-agent.md 改了，请根据新版本重新生成 personal-homepage.html。”

或者直接说改的方向：

> “homepage 整体太正式，请调得更轻一点，第一屏文案换成 [...]，再重新生成。”

只在你熟悉 HTML 的前提下，才直接动文件本身。否则手改和重生成几乎一样快，还容易出错。

## 方法局限

诚实地说，这个 skill 不能让你“真正认识自己”——它做不到。

它能做的是一件具体的事：**把已经在你身上的东西，写成 AI 和合作方都能读懂的形态。**

为了不过度承诺，有几条边界你应该先知道：

- **它捕捉的是自我形象，不是行为。** 它读的是你已经写下来的、说出来的、愿意被看见的部分。你私下的犹豫、回避和矛盾，它读不到。
- **它是一张快照，不是一段轨迹。** 跑一次的输出是“此刻的你”。三个月、半年后再跑，可能会很不一样——这不是 bug，是真实。建议每隔一段时间重跑一次。
- **AI 不会像真朋友那样追问。** 它倾向于把你的回答整理得连贯、自洽。但人本来就不那么自洽。读起来“很像你”，不代表“就是你”。
- **它不是性格测试，也不是疗愈工具。** 不要把它当 MBTI 用，更不要当心理咨询用。它只是一份给 AI 看的说明书，附带一份给人看的主页。
- **最准的部分，往往是你已经知道的部分。** 它的价值不在于“告诉你新东西”，而在于“帮你把已经知道但说不清楚的东西，说清楚”。

所以：

- 如果你想找的是一面“能照出真我”的镜子——这不是它。
- 如果你想找的是一个“能让 AI 更准协助你、让合作方更快理解你”的工具——它是。
- 真正“找到自己”那件事，需要时间、朋友、和你愿意诚实到什么程度。这个 skill 帮不了你，但它可以做一个不错的起点。

## Made by

[草诀歌 AI Labs](https://www.caojuege.com/) — 一个帮助人用 AI 做出"作品型产品"的社区。

## 版本

当前版本：`v0.2.3`

版本建议：

- 用 Git tag / GitHub Release 管理公开版本
- `v0.x`：工作流和输出结构仍在快速迭代
- `v1.0.0`：当输入流程、采访框架和双资产输出都稳定后再发布
- `SKILL.md` 里先不额外加入自定义 `version` 字段，避免不同 agent 的解析器行为不一致
