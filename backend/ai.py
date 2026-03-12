"""
AI 文章生成模块
支持 OpenAI API，需要设置 OPENAI_API_KEY 环境变量
"""
import os


async def generate_article(topic: str) -> str:
    """
    根据主题生成约500字的文章
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        # 无 API Key 时返回示例文章（开发/测试用）
        return _generate_fallback_article(topic)
    
    try:
        import openai
        client = openai.AsyncOpenAI(api_key=api_key)
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "你是一位专业的写作助手。请根据用户给出的主题，撰写一篇约500字的中文文章。文章应结构清晰、语言流畅、内容充实。"
                },
                {
                    "role": "user",
                    "content": f"请以「{topic}」为主题，写一篇约500字的文章。"
                }
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        article = response.choices[0].message.content
        return article or _generate_fallback_article(topic)
        
    except Exception as e:
        print(f"AI 生成失败: {e}")
        return _generate_fallback_article(topic)


def _generate_fallback_article(topic: str) -> str:
    """无 API 或出错时返回的示例文章"""
    return f"""# {topic}

本文围绕「{topic}」这一主题展开论述。

## 一、引言

在当今快速发展的时代，「{topic}」日益成为人们关注的焦点。无论是从个人成长还是社会发展来看，这一话题都具有重要的现实意义。本文将从多个角度对这一主题进行探讨，希望能够为读者提供有益的思考。

## 二、主要内容

首先，我们需要深入理解「{topic}」的核心内涵。它不仅仅是一个简单的概念，更蕴含着丰富的文化内涵和实践价值。在历史的长河中，无数先贤对这一问题进行过深入的思考，他们的智慧为我们 today 的探索奠定了基础。

其次，在实践层面，如何更好地把握和运用「{topic}」也是值得我们思考的问题。理论与实践的有机结合，才能真正发挥其应有的价值。我们需要在日常工作和生活中，不断总结经验，探索适合自身发展的路径。

## 三、展望与结论

展望未来，「{topic}」必将在社会发展中扮演越来越重要的角色。我们应当保持开放的心态，积极学习新知识，不断提升自我，以更好地适应时代的需求。

总之，「{topic}」是一个值得深入研究的话题。希望本文能够激发读者对这一问题更多的思考与探索。

---
（提示：设置 OPENAI_API_KEY 环境变量并安装 openai 库后，可调用真实 AI 生成文章）"""
