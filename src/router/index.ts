import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import LandingPage from '@/pages/LandingPage.vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserProfilePage from '@/pages/user/UserProfilePage.vue'
import AddPicturePage from '@/pages/picture/AddPicturePage.vue'
import AddPictureBatchPage from '@/pages/picture/AddPictureBatchPage.vue'
import AddSpacePage from '@/pages/space/AddSpacePage.vue'
import MySpacePage from '@/pages/space/MySpacePage.vue'
import SpaceDetailPage from '@/pages/space/SpaceDetailPage.vue'
import SearchPicturePage from '@/pages/picture/SearchPicturePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
      meta: {
        layout: 'blank',
      },
    },
    {
      path: '/gallery',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: UserLoginPage,
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: UserRegisterPage,
    },
    {
      path: '/user/profile',
      name: '个人信息',
      component: UserProfilePage,
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: () => import('@/pages/admin/UserManagePage.vue'),
    },
    {
      path: '/admin/pictureManage',
      name: '图片管理',
      component: () => import('@/pages/admin/PictureManagePage.vue'),
    },
    {
      path: '/admin/spaceManage',
      name: '空间管理',
      component: () => import('@/pages/admin/SpaceManagePage.vue'),
    },
    {
      path: '/spaceUserManage/:id',
      name: '空间成员管理',
      component: () => import('@/pages/admin/SpaceUserManagePage.vue'),
      props: true,
    },
    {
      path: '/add_picture',
      name: '创建图片',
      component: AddPicturePage,
    },
    {
      path: '/add_picture/batch',
      name: '批量创建图片',
      component: AddPictureBatchPage,
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: () => import('@/pages/picture/PictureDetailPage.vue'),
      props: true,
    },
    {
      path: '/add_space',
      name: '创建空间',
      component: AddSpacePage,
    },
    {
      path: '/my_space',
      name: '我的空间',
      component: MySpacePage,
    },
    {
      path: '/space/:id',
      name: '空间详情',
      component: SpaceDetailPage,
      props: true,
    },
    {
      path: '/space_analyze',
      name: '空间分析',
      component: () => import('@/pages/space/SpaceAnalyzePage.vue'),
    },
    {
      path: '/search_picture',
      name: '图片搜索',
      component: SearchPicturePage,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
