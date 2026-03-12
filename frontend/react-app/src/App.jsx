import { useState, useEffect } from 'react'
import { generateArticle, saveArticle, getHistory } from './api'
import './App.css'

export default function App() {
  const [topic, setTopic] = useState('')
  const [article, setArticle] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('write')

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

  return (
    <div className="app">
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

          {article && (
            <div className="article-box">
              <label>生成的文章</label>
              <pre className="article-content">{article}</pre>
            </div>
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <section className="history-section">
          {history.length === 0 ? (
            <p className="empty">暂无历史文章</p>
          ) : (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item" onClick={() => selectHistoryItem(item)}>
                  <div className="history-topic">{item.topic}</div>
                  <div className="history-date">
                    {new Date(item.created_at).toLocaleString('zh-CN')}
                  </div>
                  <div className="history-preview">{item.article.slice(0, 100)}...</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
