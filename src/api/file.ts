/* eslint-disable */
import request from '@/request'

/** Download test file (admin) GET /file/test/download/ */
export async function getFileTestDownload(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFileTestDownloadParams,
  options?: { [key: string]: any }
) {
  return request<string>('/file/test/download/', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** Download R2 test file (admin) GET /file/test/r2/download */
export async function getFileTestR2Download(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFileTestR2DownloadParams,
  options?: { [key: string]: any }
) {
  return request<string>('/file/test/r2/download', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** Upload test file to R2 (admin) POST /file/test/r2/upload */
export async function postFileTestR2Upload(
  body: {},
  file?: File,
  options?: { [key: string]: any }
) {
  const formData = new FormData()

  if (file) {
    formData.append('file', file)
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele]

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''))
        } else {
          formData.append(ele, JSON.stringify(item))
        }
      } else {
        formData.append(ele, item)
      }
    }
  })

  return request<API.BaseResponse>('/file/test/r2/upload', {
    method: 'POST',
    data: formData,
    ...(options || {}),
  })
}

/** Upload test file (admin) POST /file/test/upload */
export async function postFileTestUpload(body: {}, file?: File, options?: { [key: string]: any }) {
  const formData = new FormData()

  if (file) {
    formData.append('file', file)
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele]

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''))
        } else {
          formData.append(ele, JSON.stringify(item))
        }
      } else {
        formData.append(ele, item)
      }
    }
  })

  return request<API.BaseResponse>('/file/test/upload', {
    method: 'POST',
    data: formData,
    ...(options || {}),
  })
}
