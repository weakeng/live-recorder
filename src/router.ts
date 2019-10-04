import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home/Home.vue'
import Video from './views/Video/Video.vue'
import Setting from './views/Setting/Setting.vue'
import Resource from './views/Resource/Resource.vue'

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/home',
            name: 'home',
            component: Home
        },
        {
            path: '/video',
            name: 'video',
            component: Video,
        },
        {
            path: '/setting',
            name: 'setting',
            component: Setting,
        },
        {
            path: '/resource',
            name: 'resource',
            component: Resource,
        },
        {
            path: '*',
            redirect: '/home'
        },
    ]
})
