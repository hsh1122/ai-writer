# AI 写作助手

基于 FastAPI + React + SQLite 的 AI 写作助手，可输入主题一键生成约500字文章，支持保存与历史查看。

## 技术栈

- **后端**: Python, FastAPI
- **前端**: React (Vite)
- **数据库**: SQLite

## 项目结构

```
ai-wirte/
├── backend/
│   ├── main.py         # FastAPI 入口
│   ├── database.py     # 数据库操作
│   ├── models.py       # 数据模型
│   ├── ai.py           # AI 文章生成
│   └── requirements.txt
├── frontend/
│   └── react-app/
├── README.md
```

## 快速开始

### 1. 后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

后端默认运行在 `http://localhost:8000`。

### 2. 前端

```bash
cd frontend/react-app
npm install
npm run dev
```

前端默认运行在 `http://localhost:3000`，并通过代理将 `/api` 转发到后端。

### 3. AI 生成（可选）

默认情况下，后端在无 `OPENAI_API_KEY` 时会返回示例文章。若要使用真实 AI：

1. 在 [OpenAI](https://platform.openai.com/) 获取 API Key
2. 设置环境变量：`set OPENAI_API_KEY=sk-xxx`（Windows）或 `export OPENAI_API_KEY=sk-xxx`（Linux/Mac）
3. 重启后端

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /generate | 根据主题生成文章 |
| POST | /save | 保存文章 |
| GET | /history | 获取历史文章 |

### POST /generate

**请求体**:
```json
{"topic": "文章主题"}
```

**响应**:
```json
{"article": "生成的文章内容"}
```

### POST /save

**请求体**:
```json
{"topic": "文章主题", "article": "文章内容"}
```

**响应**:
```json
{"id": 1, "message": "保存成功"}
```

### GET /history

**响应**:
```json
{
  "articles": [
    {
      "id": 1,
      "topic": "主题",
      "article": "内容",
      "created_at": "2025-03-10T12:00:00"
    }
  ]
}
```

## 功能说明

1. **输入主题**：在输入框填写文章主题
2. **生成文章**：点击「生成文章」调用 AI 生成约500字
3. **保存文章**：生成后可点击「保存文章」存入 SQLite
4. **历史文章**：在「历史」标签页查看已保存文章，点击可加载到写作区
