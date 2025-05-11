import { virou } from '@virou/core'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(virou)
app.mount('#app')
