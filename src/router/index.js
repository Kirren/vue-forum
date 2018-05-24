import Vue from 'vue'
import Router from 'vue-router'
import HomePage from '@/pages/HomePage'
import ThreadPage from '@/pages/ThreadPage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: HomePage
    },
    {
      path: '/thread/:id',
      name: 'ThreadPage',
      component: ThreadPage,
      props: true
    }
  ],
  mode: 'history'
})
