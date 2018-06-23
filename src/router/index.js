import Vue from 'vue'
import Router from 'vue-router'
import Mapping from '../components/Mapping'
// import Print from '../components/Print'
import Home from '@/components/Home'
import Data from '../components/Data'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/data',
      name: 'Data',
      component: Data
    },
    {
      path: '/map',
      name: 'Mapping',
      component: Mapping
    },
    // {
    //   path: '/print',
    //   name: 'Print',
    //   component: Print,
    // }
  ]
})
