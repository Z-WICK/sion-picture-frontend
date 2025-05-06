import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import VueCropper from 'vue-cropper';
import 'vue-cropper/dist/index.css'
import 'ant-design-vue/dist/reset.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/access'

const app = createApp(App)
app.use(Antd)
app.use(createPinia())
app.use(router)

app.mount('#app')
app.use(VueCropper)

