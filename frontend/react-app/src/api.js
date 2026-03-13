/**
 * API 请求封装
 */
const API_BASE = 'http://127.0.0.1:8000'

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = Array.isArray(err.detail)
      ? err.detail.map((e) => e.msg || JSON.stringify(e)).join(', ')
      : err.detail || err.message || `请求失败: ${res.status}`
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }

  return res.json()
}

/**
 * 生成文章
 * @param {string} topic - 文章主题
 * @returns {Promise<{article: string}>}
 */
export async function generateArticle(topic) {
  return request('/generate', {
    method: 'POST',
    body: JSON.stringify({ topic }),
  })
}

/**
 * 保存文章
 * @param {string} topic - 文章主题
 * @param {string} article - 文章内容
 */
export async function saveArticle(topic, article) {
  return request('/save', {
    method: 'POST',
    body: JSON.stringify({ topic, article }),
  })
}

/**
 * 获取历史文章
 * @returns {Promise<{articles: Array}>}
 */
export async function getHistory() {
  return request('/history')
}

/**
 * 删除文章
 * @param {number} id - 文章ID
 */
export async function deleteArticle(id) {
  return request(`/article/${id}`, { method: 'DELETE' })
}
