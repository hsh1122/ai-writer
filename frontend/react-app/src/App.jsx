import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { generateArticle, saveArticle, getHistory, deleteArticle } from './api'
import './App.css'

export default function App() {
  const [topic, setTopic] = useState('')
  const [article, setArticle] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('write')
  const [expandedId, setExpandedId] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      setMessage({ type: 'error', text: '复制失败' })
    }
  }

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const loadHistory = async () => {
    try {
      const data = await getHistory()
      setHistory(data.articles || [])
    } catch (err) {
      console.error('加载历史失败', err)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleGenerate = async () => {
    if (loading) return
    if (!topic.trim()) {
      setMessage({ type: 'error', text: '请输入文章主题' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const data = await generateArticle(topic.trim())
      setArticle(data.article)
      setMessage({ type: 'success', text: '文章生成成功' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || '生成失败，请检查后端服务是否启动' })
      setArticle('')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!topic.trim()) {
      setMessage({ type: 'error', text: '请输入文章主题' })
      return
    }
    if (!article.trim()) {
      setMessage({ type: 'error', text: '请先生成文章' })
      return
    }
    try {
      await saveArticle(topic.trim(), article)
      setMessage({ type: 'success', text: '保存成功' })
      loadHistory()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || '保存失败' })
    }
  }

  const selectHistoryItem = (item) => {
    setTopic(item.topic)
    setArticle(item.article)
    setActiveTab('write')
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation()
    if (!window.confirm(`确定要删除「${item.topic}」吗？`)) return
    try {
      await deleteArticle(item.id)
      setHistory((prev) => prev.filter((h) => h.id !== item.id))
      if (expandedId === item.id) setExpandedId(null)
      setDeleteSuccess(true)
      setTimeout(() => setDeleteSuccess(false), 2000)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || '删除失败' })
    }
  }

  return (
    <div className="app">
      {copySuccess && (
        <div className="copy-toast">已复制到剪贴板</div>
      )}
      {deleteSuccess && (
        <div className="copy-toast">删除成功</div>
      )}
      <header className="header">
        <h1>AI 写作助手</h1>
        <p>输入主题，一键生成约500字文章</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'write' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('write')}
        >
          写作
        </button>
        <button
          className={activeTab === 'history' ? 'tab active' : 'tab'}
          onClick={() => { setActiveTab('history'); loadHistory(); }}
        >
          历史
        </button>
      </nav>

      {activeTab === 'write' && (
        <section className="write-section">
          <div className="input-group">
            <label htmlFor="topic">文章主题</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：人工智能的发展与未来"
              disabled={loading}
            />
          </div>

          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? '生成中...' : '生成文章'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleSave}
              disabled={loading || !article}
            >
              保存文章
            </button>
          </div>

          {message && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}

          {loading && (
            <div className="article-loading" aria-live="polite">
              <span className="spinner" aria-hidden />
              <span>正在生成文章...</span>
            </div>
          )}

          {article && (
            <div className="article-box">
              <div className="article-box-header">
                <label>生成的文章</label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(article)}
                >
                  复制文章
                </button>
              </div>
              <div className="article-content markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{article}</ReactMarkdown>
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <section className="history-section">
          {message && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}
          {history.length === 0 ? (
            <p className="empty">暂无历史文章</p>
          ) : (
            <ul className="history-list">
              {history.map((item) => (
                <li
                  key={item.id}
                  className={`history-item ${expandedId === item.id ? 'expanded' : ''}`}
                >
                  <div
                    className="history-card-header"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="history-header-content">
                      <div className="history-topic">{item.topic}</div>
                      <div className="history-date">
                        {new Date(item.created_at).toLocaleString('zh-CN')}
                      </div>
                      <div className="history-preview markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {item.article.slice(0, 200) + (item.article.length > 200 ? '...' : '')}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="history-header-actions">
                      <button
                        type="button"
                        className="btn btn-delete btn-sm"
                        onClick={(e) => handleDelete(e, item)}
                        title="删除"
                      >
                        删除
                      </button>
                      <span className="history-expand-icon" aria-hidden>
                        {expandedId === item.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                  <div className="history-expand-content">
                    <div className="history-full-article markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.article}
                      </ReactMarkdown>
                    </div>
                    <div className="history-expand-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(item.article)
                        }}
                      >
                        复制文章
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          selectHistoryItem(item)
                        }}
                      >
                        加载到写作
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
