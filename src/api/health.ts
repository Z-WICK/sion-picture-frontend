/* eslint-disable */
import request from '@/request'

/** Health check GET /health */
export async function getHealth(options?: { [key: string]: any }) {
  return request<API.BaseResponse>('/health', {
    method: 'GET',
    ...(options || {}),
  })
}
