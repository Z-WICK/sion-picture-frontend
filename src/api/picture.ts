/* eslint-disable */
import request from '@/request'

/** Refresh picture list cache (admin) POST /picture/admin/cache/refreshPictureList */
export async function postPictureAdminCacheRefreshPictureList(
  body: API.PictureQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/admin/cache/refreshPictureList', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Delete picture POST /picture/delete */
export async function postPictureOpenApiDelete(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Edit picture POST /picture/edit */
export async function postPictureEdit(
  body: API.PictureEditRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Batch edit pictures POST /picture/edit/batch */
export async function postPictureEditBatch(
  body: API.PictureEditByBatchRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/edit/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Get picture (admin) GET /picture/get */
export async function getPictureGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPictureGetParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** Get picture VO GET /picture/get/vo */
export async function getPictureGetVo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPictureGetVoParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** List pictures (admin) POST /picture/list/page */
export async function postPictureListPage(
  body: API.PictureQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** List pictures (public) POST /picture/list/page/vo */
export async function postPictureListPageVo(
  body: API.PictureQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** List pictures with cache POST /picture/list/page/vo/cache */
export async function postPictureListPageVoCache(
  body: API.PictureQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/list/page/vo/cache', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Create out painting task POST /picture/out_painting/create_task */
export async function postPictureOutPaintingCreateTask(
  body: API.CreatePictureOutPaintingTaskRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/out_painting/create_task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Get out painting task GET /picture/out_painting/get_task */
export async function getPictureOutPaintingGetTask(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPictureOutPaintingGetTaskParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/out_painting/get_task', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** Review picture POST /picture/review */
export async function postPictureReview(
  body: API.PictureReviewRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Search by color POST /picture/search/color */
export async function postPictureSearchColor(
  body: API.SearchPictureByColorRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/search/color', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Search by picture POST /picture/search/picture */
export async function postPictureSearchPicture(
  body: API.SearchPictureByPictureRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/search/picture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Get picture tags and categories GET /picture/tag_category */
export async function getPictureTagCategory(options?: { [key: string]: any }) {
  return request<API.BaseResponse>('/picture/tag_category', {
    method: 'GET',
    ...(options || {}),
  })
}

/** Update picture (admin) POST /picture/update */
export async function postPictureUpdate(
  body: API.PictureUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Upload picture by file POST /picture/upload */
export async function postPictureUpload(
  body: {
    /** Picture ID */
    id?: number
    /** File URL */
    fileUrl?: string
    /** Picture name */
    picName?: string
    /** Space ID */
    spaceId?: number
    /** Picture color */
    picColor?: string
    /** COS tunnel */
    cosTunnel?: string
  },
  multipartFile?: File,
  options?: { [key: string]: any }
) {
  const formData = new FormData()

  if (multipartFile) {
    formData.append('multipartFile', multipartFile)
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

  return request<API.BaseResponse>('/picture/upload', {
    method: 'POST',
    data: formData,
    ...(options || {}),
  })
}

/** Batch upload pictures (admin) POST /picture/upload/batch */
export async function postPictureUploadBatch(
  body: API.PictureUploadByBatchRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/upload/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Upload picture by URL POST /picture/upload/url */
export async function postPictureUploadUrl(
  body: API.PictureUploadRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/picture/upload/url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
