"""
数据模型定义
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class GenerateRequest(BaseModel):
    """生成文章请求"""
    topic: str


class GenerateResponse(BaseModel):
    """生成文章响应"""
    article: str


class SaveRequest(BaseModel):
    """保存文章请求"""
    topic: str
    article: str


class SaveResponse(BaseModel):
    """保存文章响应"""
    id: int
    message: str = "保存成功"


class ArticleRecord(BaseModel):
    """文章记录"""
    id: int
    topic: str
    article: str
    created_at: datetime


class HistoryResponse(BaseModel):
    """历史文章响应"""
    articles: list[ArticleRecord]
