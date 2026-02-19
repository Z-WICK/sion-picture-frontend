/* eslint-disable */
import request from '@/request'

/** Add space member POST /spaceUser/add */
export async function postSpaceUserAdd(
  body: API.SpaceUserAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/spaceUser/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Delete space member POST /spaceUser/delete */
export async function postSpaceUserOpenApiDelete(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/spaceUser/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Edit space member POST /spaceUser/edit */
export async function postSpaceUserEdit(
  body: API.SpaceUserEditRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/spaceUser/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** Get space member POST /spaceUser/get */
export async function postSpaceUserGet(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/spaceUser/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** List space members POST /spaceUser/list */
export async function postSpaceUserList(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponse>('/spaceUser/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** List my spaces POST /spaceUser/list/my */
export async function postSpaceUserListMy(options?: { [key: string]: any }) {
  return request<API.BaseResponse>('/spaceUser/list/my', {
    method: 'POST',
    ...(options || {}),
  })
}
