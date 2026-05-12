const API_KEY = import.meta.env.VITE_LLM_API_KEY as string
const BASE_URL = import.meta.env.VITE_LLM_BASE_URL as string
const MODEL = import.meta.env.VITE_LLM_MODEL as string

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

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

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

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

function getFullUrl(): string {
  return BASE_URL.endsWith('/chat/completions')
    ? BASE_URL
    : `${BASE_URL}/chat/completions`
}

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

  if (!response.ok) {
    let errorMessage = 'API 请求失败'
    let errorCode: string | undefined

    try {
      const errorData = await response.json()
      errorMessage = errorData.error?.message || errorData.error?.code || errorMessage
      errorCode = errorData.error?.code
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

    throw new APIError(errorMessage, response.status, errorCode)
  }

  let data: any
  try {
    data = await response.json()
  } catch {
    throw new Error('响应数据解析失败')
  }

  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error('无效的响应格式')
  }

  return data.choices[0].message.content
}

export type StreamCallback = (content: string) => void

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
        stream: true,
      }),
    })
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new NetworkError('网络连接失败，请检查网络或API地址是否正确')
    }
    throw new NetworkError(err instanceof Error ? err.message : '网络请求失败')
  }

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

  if (!response.body) {
    throw new Error('响应体为空')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue

        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            onChunk(content)
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  } catch (err) {
    throw new NetworkError(err instanceof Error ? err.message : '流式读取失败')
  }
}
