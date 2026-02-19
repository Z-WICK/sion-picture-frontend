/* eslint-disable */
import request from '@/request'

/** User login POST /user */
export async function postUser(body: API.UserLoginRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponse>('/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Add user (admin) POST /user/add */
export async function postUserAdd(body: API.UserAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponse>('/user/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Delete user (admin) POST /user/delete */
export async function postUserOpenApiDelete(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/user/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Get user (admin) GET /user/get */
export async function getUserGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserGetParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/user/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** Get current login user GET /user/get/login */
export async function getUserGetLogin(options?: { [key: string]: any }) {
  return request<API.BaseResponse>('/user/get/login', {
    method: 'GET',
    ...(options || {}),
  })
}

/** Get user VO GET /user/get/vo */
export async function getUserGetVo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserGetVoParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/user/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** List users (admin) POST /user/list/page/vo */
export async function postUserListPageVo(
  body: API.UserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/user/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** User logout POST /user/logout */
export async function postUserLogout(options?: { [key: string]: any }) {
  return request<API.BaseResponse>('/user/logout', {
    method: 'POST',
    ...(options || {}),
  })
}

/** Register user POST /user/register */
export async function postUserRegister(
  body: API.UserRegisterRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Update user (admin) POST /user/update */
export async function postUserUpdate(
  body: API.UserUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/user/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
