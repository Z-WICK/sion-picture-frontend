<template>
  <div id="userRegisterPage">
    <div class="register-shell">
      <section class="intro-panel">
        <p class="eyebrow">Sion Picture</p>
        <h1 class="headline">创建你的协作空间</h1>
        <p class="summary">注册后可创建个人与团队图库，集中管理素材并与成员共享工作成果。</p>
        <ul class="feature-list">
          <li>
            <SafetyCertificateOutlined />
            账号安全与访问控制
          </li>
          <li>
            <UserAddOutlined />
            新用户快速引导
          </li>
          <li>
            <TeamOutlined />
            团队空间协同管理
          </li>
        </ul>
      </section>

      <section class="form-panel">
        <h2 class="title">账号注册</h2>
        <p class="desc">填写信息后即可创建账户</p>
        <a-form
          :model="formState"
          name="register"
          autocomplete="off"
          layout="vertical"
          @finish="handleSubmit"
        >
          <a-form-item
            label="账号"
            name="userAccount"
            :rules="[{ required: true, message: '请输入账号' }]"
          >
            <a-input v-model:value="formState.userAccount" placeholder="请输入账号" allow-clear />
          </a-form-item>
          <a-form-item
            label="密码"
            name="userPassword"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码不能小于 8 位' },
            ]"
          >
            <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
          </a-form-item>
          <a-form-item
            label="确认密码"
            name="checkPassword"
            :rules="[
              { required: true, message: '请输入确认密码' },
              { min: 8, message: '确认密码不能小于 8 位' },
            ]"
          >
            <a-input-password v-model:value="formState.checkPassword" placeholder="请输入确认密码" />
          </a-form-item>
          <div class="tips">
            已有账号？
            <RouterLink class="login-link" to="/user/login">去登录</RouterLink>
          </div>
          <a-form-item class="submit-item">
            <a-button type="primary" html-type="submit" block>注册</a-button>
          </a-form-item>
        </a-form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { postUserRegister } from '@/api/user'
import { SafetyCertificateOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons-vue'

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

/**
 * 提交表单
 * @param values
 */
const router = useRouter()
const handleSubmit = async (values: API.UserRegisterRequest) => {
  //判断两次输入的密码是否一致
  if (formState.userPassword !== formState.checkPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  const res = await postUserRegister(values)
  // 注册成功，跳转到登录页面
  if (res.data.code === 0 && res.data.data) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败' + res.data.message)
  }
}
</script>

<style scoped>
#userRegisterPage {
  --page-bg-top: #f8fafd;
  --page-bg-bottom: #ecf2f8;
  --surface: #ffffff;
  --line: #d4deea;
  --text-main: #1f2d3d;
  --text-subtle: #5d6f86;
  --brand: #345375;
  --brand-hover: #2a4563;

  padding: 8px 0;
}

.register-shell {
  max-width: 920px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(260px, 360px) minmax(320px, 460px);
  gap: 20px;
}

.intro-panel {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: linear-gradient(170deg, var(--page-bg-top) 0%, var(--page-bg-bottom) 100%);
  padding: 28px 24px;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.headline {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  color: var(--text-main);
}

.summary {
  margin: 12px 0 20px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-subtle);
}

.feature-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.feature-list li {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #ccdaea;
  background: #f7faff;
  color: #30485f;
  border-radius: 12px;
  padding: 9px 12px;
}

.feature-list li :deep(svg) {
  color: #3e5f82;
  font-size: 16px;
}

.form-panel {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  padding: 24px 24px 10px;
}

.title {
  margin: 0;
  font-size: 24px;
  color: var(--text-main);
}

.desc {
  margin: 8px 0 18px;
  color: var(--text-subtle);
}

.tips {
  margin-bottom: 16px;
  color: var(--text-subtle);
  font-size: 13px;
  text-align: right;
}

.login-link {
  color: var(--brand);
}

#userRegisterPage :deep(.ant-form-item-label > label) {
  color: var(--text-main);
  font-weight: 600;
}

#userRegisterPage :deep(.ant-input),
#userRegisterPage :deep(.ant-input-affix-wrapper) {
  min-height: 44px;
  border-radius: 12px;
  border-color: #b8c9dc;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

#userRegisterPage :deep(.ant-input-affix-wrapper .ant-input) {
  min-height: auto;
}

#userRegisterPage :deep(.ant-input:focus),
#userRegisterPage :deep(.ant-input-focused),
#userRegisterPage :deep(.ant-input-affix-wrapper-focused) {
  border-color: var(--brand);
  box-shadow: 0 0 0 2px rgb(52 83 117 / 12%);
}

#userRegisterPage :deep(.ant-btn-primary) {
  min-height: 44px;
  border-radius: 12px;
  background: var(--brand);
  border-color: var(--brand);
  font-weight: 600;
}

#userRegisterPage :deep(.ant-btn-primary:hover),
#userRegisterPage :deep(.ant-btn-primary:focus) {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
}

@media (max-width: 900px) {
  .register-shell {
    grid-template-columns: 1fr;
    max-width: 520px;
  }

  .headline {
    font-size: 26px;
  }
}

@media (max-width: 576px) {
  .intro-panel,
  .form-panel {
    border-radius: 14px;
    padding: 18px 16px;
  }

  .headline {
    font-size: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  #userRegisterPage :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>
