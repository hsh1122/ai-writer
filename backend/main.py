"""
AI 写作助手 API 服务
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    GenerateRequest, GenerateResponse,
    SaveRequest, SaveResponse,
    ArticleRecord, HistoryResponse,
    DeleteResponse
)
from database import init_db, save_article, get_all_articles, delete_article
from ai import generate_article

app = FastAPI(title="AI 写作助手 API")

# 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://ai-writer-psi.vercel.app",
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    """启动时初始化数据库"""
    init_db()


@app.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    """根据主题生成文章"""
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="主题不能为空")
    
    article = await generate_article(request.topic)
    return GenerateResponse(article=article)


@app.post("/save", response_model=SaveResponse)
async def save(request: SaveRequest):
    """保存文章"""
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="主题不能为空")
    if not request.article.strip():
        raise HTTPException(status_code=400, detail="文章内容不能为空")
    
    article_id = save_article(request.topic, request.article)
    return SaveResponse(id=article_id, message="保存成功")


@app.get("/history", response_model=HistoryResponse)
async def history():
    """获取历史文章列表"""
    articles = get_all_articles()
    records = [
        ArticleRecord(
            id=row["id"],
            topic=row["topic"],
            article=row["article"],
            created_at=row["created_at"]
        )
        for row in articles
    ]
    return HistoryResponse(articles=records)


@app.delete("/article/{article_id}", response_model=DeleteResponse)
async def delete_article_by_id(article_id: int):
    """根据ID删除文章"""
    if not delete_article(article_id):
        raise HTTPException(status_code=404, detail="文章不存在")
    return DeleteResponse(message="删除成功")


@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "ok"}
