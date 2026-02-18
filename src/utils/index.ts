import { saveAs } from 'file-saver'

/**
 * 格式化文件大小
 * @param size
 */
export const formatSize = (size?: number) => {
  if (!size) return '未知'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 下载图片
 * @param url 图片下载地址
 * @param fileName 要保存为的文件名
 */
export function downloadImage(url?: string, fileName?: string) {
  if (!url) {
    return
  }
  saveAs(url, fileName)
}

/**
 * 将颜色值转换为标准 #RRGGBB 格式
 * @param input
 */
export function toHexColor(input: string) {
  // 去掉 0x 前缀
  const colorValue = input.startsWith('0x') ? input.slice(2) : input

  // 将剩余部分解析为十六进制数，再转成 6 位十六进制字符串
  const hexColor = parseInt(colorValue, 16).toString(16).padStart(6, '0')

  // 返回标准 #RRGGBB 格式
  return `#${hexColor}`
}

/**
 * 兼容代理与绝对地址的图片 URL
 * @param url
 */
export const resolveImageUrl = (url?: string) => {
  if (!url) {
    return url
  }
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (url.startsWith('/api/')) {
    return url
  }

  if (url.startsWith('/uploads/')) {
    const base = apiBaseUrl || 'http://localhost:8123'
    try {
      return new URL(url, base).toString()
    } catch {
      return url
    }
  }

  const tryResolveSameOriginApi = (base?: string) => {
    if (!base) {
      return undefined
    }
    try {
      const baseUrl = new URL(base, window.location.origin)
      const targetUrl = new URL(url, window.location.origin)
      if (targetUrl.origin === baseUrl.origin && targetUrl.pathname.startsWith('/api/')) {
        return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`
      }
    } catch {
      return undefined
    }
    return undefined
  }

  const resolvedFromEnv = tryResolveSameOriginApi(apiBaseUrl)
  if (resolvedFromEnv) {
    return resolvedFromEnv
  }

  const localApiBase = 'http://localhost:8123'
  const localApiHttpsBase = 'https://localhost:8123'
  const resolvedFromLocal =
    tryResolveSameOriginApi(localApiBase) || tryResolveSameOriginApi(localApiHttpsBase)
  if (resolvedFromLocal) {
    return resolvedFromLocal
  }

  return url
}
