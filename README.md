# SpeakMentor AI：场景化英语口语陪练助手

SpeakMentor AI 是一个面向英语学习者、求职者和职场新人的 AI 英语口语练习工具。用户可以选择面试、点餐、会议或自定义场景，通过语音输入与 AI 进行英文对话，并获得表达纠错、自然表达建议、发音反馈、量化评分、课后总结和练习报告导出。

项目采用前后端分离架构，前端基于 React + TypeScript + Vite + Ant Design，后端基于 Node.js + Express + TypeScript。项目支持真实浏览器语音识别、浏览器 TTS 播报、大模型 API 接入入口，并提供完整 Mock fallback，保证在没有真实 API Key、语音识别失败或网络异常时仍可完整演示核心流程。

讲解视频链接：https://www.bilibili.com/video/BV1YhEb6JE7N/

---

## 一、项目背景

英语学习者在口语练习中常见的问题包括：缺少真实交流场景、不知道表达是否自然、缺少即时纠错、缺少发音反馈，以及难以量化练习效果。

SpeakMentor AI 以“场景化口语陪练”为核心，通过语音输入、AI 对话、纠错反馈、量化评分和报告导出，帮助用户完成从练习到复盘的完整学习闭环。

---

## 二、目标用户

- 英语学习者：希望通过真实场景提升英语口语表达能力。
- 求职者：需要练习英文自我介绍、项目介绍、实习经历和面试问答。
- 职场新人：需要练习会议发言、观点表达、客户沟通等职场英语场景。
- 前端实训展示：适合作为 AI + 语音交互 + 前后端分离方向的综合实训项目。

---

## 三、核心功能

### 1. 场景选择

支持面试、点餐、会议和自定义场景，用户可以根据实际需求选择不同口语练习主题。

### 2. 语音输入

支持浏览器 Web Speech API 真实语音识别，同时提供 Mock ASR。  
当浏览器不支持语音识别、麦克风权限异常或识别失败时，系统会自动降级为 Mock ASR。

### 3. AI 英文对话

用户完成语音输入后，系统会根据当前场景生成 AI 英文回复。

支持三种模式：

- Backend AI：后端真实大模型返回
- Backend Mock：后端 Mock 返回
- Frontend Mock：后端请求失败后的前端本地兜底

### 4. 表达纠错

系统会针对用户英文表达生成结构化反馈，包括：

- 用户原句
- 语法纠错
- 更自然表达
- 中文解释
- 关键学习点

### 5. 发音与流畅度反馈

系统会提供轻量级发音反馈，包括流畅度评价、发音清晰度建议、语速表现和下一步改进建议。

### 6. 量化评分

系统从四个维度对用户表达进行评分：

- 流畅度
- 准确度
- 表达自然度
- 场景完成度

同时给出综合评分和等级说明，帮助用户直观看到本轮练习表现。

### 7. AI 回复语音播报

AI 英文回复支持浏览器 TTS 播报，用户可以点击播放按钮收听 AI 回复，也可以在播放过程中停止播报。

### 8. 课后总结与报告导出

用户完成一轮练习后，可以生成课后总结报告，并导出为 Markdown 文件。报告内容包括练习场景、对话轮数、综合评分、表达亮点、常见问题和下一步练习建议。

---

## 四、技术栈

### 前端

| 技术 | 说明 |
| --- | --- |
| React | 构建前端页面与组件 |
| TypeScript | 提供类型约束 |
| Vite | 前端开发与构建工具 |
| Ant Design | UI 组件库 |
| Axios | 前后端接口请求 |
| Web Speech API | 浏览器语音识别 |
| SpeechSynthesis | 浏览器语音播报 |
| CSS Grid / Flex | 页面布局 |

### 后端

| 技术 | 说明 |
| --- | --- |
| Node.js | 后端运行环境 |
| Express | 后端 API 服务 |
| TypeScript | 后端类型约束 |
| CORS | 处理前后端跨域 |
| dotenv | 管理环境变量 |
| tsx | 本地开发运行 TypeScript |

---

## 五、项目结构

```text
speakmentor-ai
├─ frontend
│  ├─ src
│  │  ├─ api
│  │  ├─ components
│  │  ├─ constants
│  │  ├─ hooks
│  │  ├─ mocks
│  │  ├─ types
│  │  ├─ utils
│  │  ├─ App.tsx
│  │  ├─ index.css
│  │  └─ main.tsx
│  ├─ .env.example
│  └─ package.json
│
├─ backend
│  ├─ src
│  │  ├─ controllers
│  │  ├─ middlewares
│  │  ├─ routes
│  │  ├─ services
│  │  ├─ types
│  │  ├─ app.ts
│  │  └─ server.ts
│  ├─ .env.example
│  └─ package.json
│
├─ .gitignore
└─ README.md
```

---

## 六、前端启动方式

进入前端目录：

```bash
cd frontend
```

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:5173
```

前端打包：

```bash
npm run build
```

---

## 七、后端启动方式

进入后端目录：

```bash
cd backend
```

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

后端默认运行在：

```text
http://localhost:3001
```

健康检查接口：

```text
GET http://localhost:3001/health
```

对话接口：

```text
POST http://localhost:3001/api/dialogue
```

后端打包：

```bash
npm run build
```

---

## 八、环境变量配置

### 前端环境变量

前端配置文件示例：

```text
frontend/.env.example
```

内容：

```env
VITE_API_BASE_URL=http://localhost:3001
```

如需本地配置：

```bash
cd frontend
copy .env.example .env
```

### 后端环境变量

后端配置文件示例：

```text
backend/.env.example
```

内容：

```env
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173

AI_API_KEY=
AI_API_URL=
AI_MODEL_NAME=
```

如需本地配置：

```bash
cd backend
copy .env.example .env
```

说明：

- `.env` 文件不要提交到 GitHub。
- 未配置 AI API 时，后端会自动走 Mock 模式。
- AI 请求失败时，后端会自动 fallback 到 Mock 模式。

---

## 九、Mock 模式说明

本项目设计了多层 Mock fallback，保证演示稳定。

### 1. Mock ASR

当浏览器不支持语音识别、麦克风权限失败或真实识别失败时，系统会自动使用 Mock ASR 生成英文输入。

### 2. Backend Mock

当后端没有配置真实 AI API，或者 AI 请求失败时，后端会返回 Mock AI 回复、纠错反馈和评分。

### 3. Frontend Mock

当前端请求后端失败，例如后端未启动或网络异常时，前端会自动使用本地 Mock 数据生成 AI 回复和反馈。

---

## 十、大模型 API 接入说明

后端已预留大模型 API 接入入口。

配置位置：

```text
backend/.env
```

配置项：

```env
AI_API_KEY=
AI_API_URL=
AI_MODEL_NAME=
```

后端请求流程：

```text
前端请求 /api/dialogue
↓
后端判断是否配置 AI_API_KEY、AI_API_URL、AI_MODEL_NAME
↓
有配置：尝试调用真实大模型
↓
成功：返回 mode: "ai"
↓
失败：自动返回 mode: "mock"
```

前端会根据返回结果显示：

```text
Backend AI
Backend Mock
Frontend Mock
```

---

## 十一、浏览器兼容说明

推荐使用 Chrome 或 Edge 浏览器进行演示。

### Web Speech API

浏览器语音识别能力在不同浏览器中支持情况不完全一致。如果当前浏览器不支持真实语音识别，项目会自动使用 Mock ASR。

### SpeechSynthesis

AI 回复语音播报基于浏览器内置 SpeechSynthesis。如果当前浏览器不支持 TTS，页面会给出提示，但不会影响对话、纠错、评分和报告导出等核心流程。

---

## 十二、运行检查

运行演示时建议同时启动后端和前端。

启动后端：

```bash
cd backend
npm run dev
```

启动前端：

```bash
cd frontend
npm run dev
```

构建检查：

```bash
cd frontend
npm run build
```

```bash
cd backend
npm run build
```

---

## 十三、项目亮点

1. **场景化口语练习**  
   支持面试、点餐、会议和自定义场景，贴近真实英语交流需求。

2. **语音交互闭环**  
   支持语音输入、AI 英文回复和 AI 回复语音播报。

3. **结构化学习反馈**  
   提供语法纠错、自然表达、发音建议和关键学习点。

4. **量化评分机制**  
   从流畅度、准确度、表达自然度和场景完成度进行多维评分。

5. **课后总结与报告导出**  
   支持生成练习总结，并导出 Markdown 报告用于复盘。

6. **前后端分离架构**  
   前端负责交互展示，后端负责接口和 AI 服务适配。

7. **Mock fallback 完整**  
   没有真实 API Key 或浏览器能力异常时仍可完整演示。

8. **具备真实 AI 接入能力**  
   后端预留大模型 API 接入入口，可从 Mock 平滑升级为真实 AI。
