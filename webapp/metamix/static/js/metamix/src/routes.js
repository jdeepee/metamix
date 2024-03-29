import Home from './components/Home/Home.vue'
import Studio from './components/Studio/Studio.vue'
import Register from './components/User/Register.vue'
import Login from './components/User/Login.vue'
import Upload from './components/Upload/Upload.vue'
import Manage from './components/Manage/Manage.vue'
import Mix from './components/Studio/Mix.vue'

export const routes = [
    { path: '/', component: Home },
    { path: '/meta/mix/studio', component: Studio},
    { path: '/register', component: Register},
    { path: '/login', component: Login},
    { path: '/upload', component: Upload},
    { path: '/meta', component: Manage},
    { path : '/meta/mix', component: Mix}
]