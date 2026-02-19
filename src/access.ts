// 是否为首次获取登录用户
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import router from '@/router'

let firstFetchLoginUser = true

router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser
  // 确保页面刷新，首次加载时，能够等后端返回用户后再检验权限
  if (firstFetchLoginUser) {
    await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
    firstFetchLoginUser = false
  }
  const toUrl = to.fullPath
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || !loginUser.id) {
      message.error('请先登录')
      next(`/user/login?redirect=${encodeURIComponent(to.fullPath)}`)
      return
    }
    if (loginUser.userRole !== 'admin') {
      message.error('当前账号无管理员权限')
      next('/')
      return
    }
  }
  next()
})
