import { createApp } from 'vue'
import './assets/style.css'
import "amfe-flexible/index.js"
import App from './App.vue'
import { createPinia } from 'pinia'
import 'element-plus/theme-chalk/src/message-box.scss'
import 'element-plus/theme-chalk/src/message.scss'

const pinia = createPinia()

import router from './router/index'
const app = createApp(App)

app.use(router).use(pinia).mount('#app')
