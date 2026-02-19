/* eslint-disable */
import request from '@/request'

/** Create space POST /space/add */
export async function postSpaceAdd(body: API.SpaceAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponse>('/space/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Delete space POST /space/delete */
export async function postSpaceOpenApiDelete(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/space/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Edit space POST /space/edit */
export async function postSpaceEdit(body: API.SpaceEditRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponse>('/space/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Get space (admin) GET /space/get */
export async function getSpaceGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSpaceGetParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/space/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** Get space VO GET /space/get/vo */
export async function getSpaceGetVo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSpaceGetVoParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/space/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** List space levels GET /space/list/level */
export async function getSpaceListLevel(options?: { [key: string]: any }) {
  return request<API.BaseResponse>('/space/list/level', {
    method: 'GET',
    ...(options || {}),
  })
}

/** List spaces (admin) POST /space/list/page */
export async function postSpaceListPage(
  body: API.SpaceQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/space/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** List spaces (public) POST /space/list/page/vo */
export async function postSpaceListPageVo(
  body: API.SpaceQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/space/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Update space (admin) POST /space/update */
export async function postSpaceUpdate(
  body: API.SpaceUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/space/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
