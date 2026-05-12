// 从环境变量获取 API 配置
const API_KEY = import.meta.env.VITE_LLM_API_KEY as string
const BASE_URL = import.meta.env.VITE_LLM_BASE_URL as string
const MODEL = import.meta.env.VITE_LLM_MODEL as string

// LLM 消息格式接口
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// API 错误类
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// 网络错误类
export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

// 配置错误类
export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

/**
 * 验证 API 配置是否完整有效
 * @throws 如果配置无效，抛出 ConfigError
 */
function validateConfig(): void {
  if (!API_KEY || API_KEY === 'your-api-key-here' || API_KEY === '') {
    throw new ConfigError('请在 .env 文件中配置有效的 VITE_LLM_API_KEY')
  }
  if (!BASE_URL || BASE_URL === '') {
    throw new ConfigError('请在 .env 文件中配置有效的 VITE_LLM_BASE_URL')
  }
  if (!MODEL || MODEL === '') {
    throw new ConfigError('请在 .env 文件中配置有效的 VITE_LLM_MODEL')
  }
}

/**
 * 获取完整的 API 地址
 * @returns 完整的 API URL
 */
function getFullUrl(): string {
  return BASE_URL.endsWith('/chat/completions')
    ? BASE_URL
    : `${BASE_URL}/chat/completions`
}

/**
 * 发送消息到 LLM API（非流式）
 * @param messages 消息历史数组
 * @returns API 返回的内容
 */
export async function sendToLLM(messages: LLMMessage[]): Promise<string> {
  validateConfig()

  const url = getFullUrl()

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
      }),
    })
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new NetworkError('网络连接失败，请检查网络或API地址是否正确')
    }
    throw new NetworkError(err instanceof Error ? err.message : '网络请求失败')
  }

  // 处理 API 返回的错误状态码
  if (!response.ok) {
    let errorMessage = 'API 请求失败'
    let errorCode: string | undefined

    try {
      const errorData = await response.json()
      errorMessage = errorData.error?.message || errorData.error?.code || errorMessage
      errorCode = errorData.error?.code
    } catch {
      // 根据不同的 HTTP 状态码返回友好的错误信息
      if (response.status === 401) {
        errorMessage = 'API 密钥无效或已过期，请检查配置'
      } else if (response.status === 403) {
        errorMessage = 'API 访问被拒绝，请检查权限配置'
      } else if (response.status === 429) {
        errorMessage = '请求过于频繁，请稍后重试'
      } else if (response.status >= 500) {
        errorMessage = '服务器错误，请稍后重试'
      }
    }

    throw new APIError(errorMessage, response.status, errorCode)
  }

  // 解析响应数据
  let data: any
  try {
    data = await response.json()
  } catch {
    throw new Error('响应数据解析失败')
  }

  // 验证响应格式
  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error('无效的响应格式')
  }

  return data.choices[0].message.content
}

// 流式回调类型定义
export type StreamCallback = (content: string) => void

/**
 * 发送消息到 LLM API（流式响应）
 * @param messages 消息历史数组
 * @param onChunk 每收到一个数据块时的回调函数
 */
export async function sendToLLMStream(
  messages: LLMMessage[],
  onChunk: StreamCallback
): Promise<void> {
  validateConfig()

  const url = getFullUrl()

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: true, // 启用流式响应
      }),
    })
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new NetworkError('网络连接失败，请检查网络或API地址是否正确')
    }
    throw new NetworkError(err instanceof Error ? err.message : '网络请求失败')
  }

  // 处理 API 返回的错误状态码
  if (!response.ok) {
    let errorMessage = 'API 请求失败'
    try {
      const errorData = await response.json()
      errorMessage = errorData.error?.message || errorMessage
    } catch {
      if (response.status === 401) {
        errorMessage = 'API 密钥无效或已过期，请检查配置'
      } else if (response.status === 403) {
        errorMessage = 'API 访问被拒绝，请检查权限配置'
      } else if (response.status === 429) {
        errorMessage = '请求过于频繁，请稍后重试'
      } else if (response.status >= 500) {
        errorMessage = '服务器错误，请稍后重试'
      }
    }
    throw new APIError(errorMessage, response.status)
  }

  // 检查响应体是否存在
  if (!response.body) {
    throw new Error('响应体为空')
  }

  // 创建读取器来解析流式数据
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    // 循环读取流数据
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // 解码二进制数据并追加到缓冲区
      buffer += decoder.decode(value, { stream: true })
      // 按行分割处理
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      // 处理每一行数据
      for (const line of lines) {
        const trimmed = line.trim()
        // 跳过空行和非数据行
        if (!trimmed || !trimmed.startsWith('data:')) continue

        // 提取 data: 后面的内容
        const data = trimmed.slice(5).trim()
        // 如果是结束标记，退出循环
        if (data === '[DONE]') continue

        try {
          // 解析 JSON 数据
          const parsed = JSON.parse(data)
          // 提取增量内容
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            // 调用回调函数处理接收到的内容
            onChunk(content)
          }
        } catch {
          // 跳过无效的 JSON 数据
        }
      }
    }
  } catch (err) {
    throw new NetworkError(err instanceof Error ? err.message : '流式读取失败')
  }
}
