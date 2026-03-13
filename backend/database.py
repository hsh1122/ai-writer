"""
数据库配置与操作
"""
import sqlite3
from contextlib import contextmanager
from pathlib import Path

# 数据库文件路径
DB_PATH = Path(__file__).parent / "articles.db"


def init_db():
    """初始化数据库"""
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT NOT NULL,
                article TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()


@contextmanager
def get_connection():
    """获取数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # 返回字典形式
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def save_article(topic: str, article: str) -> int:
    """保存文章，返回文章ID"""
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO articles (topic, article) VALUES (?, ?)",
            (topic, article)
        )
        return cursor.lastrowid


def get_all_articles() -> list[dict]:
    """获取所有历史文章"""
    with get_connection() as conn:
        cursor = conn.execute(
            "SELECT id, topic, article, created_at FROM articles ORDER BY created_at DESC"
        )
        return [dict(row) for row in cursor.fetchall()]


def delete_article(article_id: int) -> bool:
    """删除文章，返回是否删除成功（文章是否存在）"""
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM articles WHERE id = ?", (article_id,))
        return cursor.rowcount > 0
