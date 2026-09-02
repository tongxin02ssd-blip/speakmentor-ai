# SpeakMentor AI

SpeakMentor 是一个基于 React、浏览器本地 Whisper 和 DeepSeek 的连续式 AI 英语口语陪练应用。

核心流程：录音 → 浏览器内转写 → 编辑 transcript → 发送 → AI 流式回复 → 继续对话。聊天过程中不生成评分卡；只有用户主动结束会话时才生成一次结构化总结。

## 功能

- 现代单列聊天界面，支持预设与自定义练习主题。
- 文本输入和麦克风录音整合在同一个 Composer 中。
- MediaRecorder 录音，AudioContext 解码并转换为 16 kHz 单声道 Float32 音频。
- Transformers.js + `onnx-community/whisper-tiny.en` 在 Web Worker 中完成本地英文 ASR。
- 语音模型首次使用时懒加载，优先 WebGPU，失败自动回退 WASM。
- DeepSeek Chat Completions 通过后端转发为统一 SSE，AI 回复逐 token 增长。
- 支持停止生成、会话/请求身份隔离和智能自动滚动。
- 使用浏览器 `speechSynthesis` 朗读已完成的 AI 回复。
- 用户点击“结束会话”后，按需生成结构化 Session Summary。
- 不包含 Mock 回复、Demo 降级或前端 API Key。

## 技术结构

```text
SpeakMentor/
├─ frontend/
│  └─ src/
│     ├─ app/                    # 应用入口
│     ├─ features/chat/          # UI、reducer、流式聊天、总结
│     ├─ features/speech/        # 录音、音频处理、TTS、Whisper Worker
│     ├─ shared/                 # 共享图标
│     └─ styles/                 # 全局与响应式样式
└─ backend/
   └─ src/
      ├─ controllers/            # 请求验证和 SSE/JSON 响应
      ├─ routes/                 # API 路由
      ├─ services/               # DeepSeek、Prompt、Session Summary
      ├─ types/                  # API 类型
      └─ utils/                  # 健壮的 SSE 分片解析
```

前端聊天记录是页面唯一的消息业务状态，由 reducer 管理。每次流式请求都有独立的 `sessionId` 与 `requestId`；切换主题、新建会话、组件卸载或点击停止时都会取消相关工作并忽略迟到结果。

## 环境要求

- Node.js 20.19+（或 22.12+）。
- 一个可用的 DeepSeek API Key 和模型 ID。
- 推荐最新版 Chrome 或 Edge 以获得 WebGPU；其他现代浏览器会尝试 WASM。
- 麦克风要求安全上下文：HTTPS，或本机 `localhost`。

## 启动后端

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

编辑 `backend/.env`：

```env
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=your_model_id
```

`FRONTEND_ORIGIN` 支持逗号分隔的多个精确 Origin。DeepSeek 配置缺失或 URL 无效时，后端会在启动阶段明确报错。API Key 只能放在后端 `.env`，不要使用 `VITE_` 前缀。

后端默认地址为 `http://localhost:3001`，提供：

- `GET /health`
- `POST /api/chat/stream`
- `POST /api/session/summary`

### 聊天流协议

`POST /api/chat/stream` 接收：

```json
{
  "sessionId": "session-id",
  "requestId": "request-id",
  "topic": "Job interview",
  "messages": [{ "role": "user", "content": "Tell me about yourself." }]
}
```

后端不会把 DeepSeek 的原始事件暴露给前端，而是统一输出：

```text
event: token
data: {"requestId":"request-id","token":"Hello"}

event: done
data: {"requestId":"request-id"}
```

失败时发送 `event: error`。后端和前端解析器都能处理跨 chunk UTF-8、拆分事件、同一 chunk 多事件、注释心跳和非 LF 换行。

## 启动前端

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

前端环境变量只有：

```env
VITE_API_BASE_URL=http://localhost:3001
```

首次打开页面不会下载 Whisper。第一次点击麦克风后，Worker 才开始下载并缓存模型与运行时；首次加载时间和下载量取决于网络与浏览器缓存。录音和 Whisper 推理留在浏览器内，只有用户确认并发送的文字会进入聊天 API。

## 质量检查

分别在 `frontend` 和 `backend` 目录运行：

```bash
npm run typecheck
npm run lint
npm run build
```

生产构建会把 Transformers.js、Whisper Worker 和 WASM 与首屏主包分离。不要把生成的 `dist`、本地 `.env` 或模型缓存提交到仓库。
