import Vue from 'vue';
import VueRouter from 'vue-router';

import ColorfulPage from '../pages/ColorfulPage.vue'
import WhitelistPage from '../pages/WhitelistPage.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'ColorfulPage',
        component: ColorfulPage
    },
    {
        path: '/whitelist',
        name: 'WhitelistPage',
        component: WhitelistPage
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router