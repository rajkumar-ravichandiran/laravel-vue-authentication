import { createRouter, createWebHistory } from 'vue-router';
import { useStore } from 'vuex';
const Dashboard = () => import('@/components/dashboard/Dashboard.vue');
const NotFound = () => import('@/components/dashboard/NotFound.vue');
const Login = () => import('@/components/dashboard/auth/Login.vue');
const Register = () => import('@/components/dashboard/auth/Register.vue');
const ForgetPassword = () => import('@/components/dashboard/auth/ForgetPassword.vue');

const routes = [
  { path: '/', redirect: '/login'},
  { path: '/login', component: Login, meta:{onlyGuest:true, title:'Login'} },
  { path: '/register', component: Register, meta:{onlyGuest:true, title:'Registration'} },
  { path: '/forget-password', component: ForgetPassword, meta:{onlyGuest:true, title:'Forget Password'} },
  { path: '/dashboard', component: Dashboard, meta:{requiresAuth:true}},
  { path: '/:pathMatch(.*)*', component: NotFound, meta:{title:'Not Found'} },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next)=>{
    const store = useStore();

    if (!store.state.isConfigLoaded) {
        await store.dispatch('fetchConfig');
    }
    const config = store.state.config;
    document.title = to.meta.title ? `${to.meta.title} - ${config.app_name}` : config.app_name;

    try{
        await store.dispatch('fetchUser');
        const isAuthenticated = store.state.authenticated;

        if(to.meta.requiresAuth && !isAuthenticated){
            next('/login');
        }else if(to.meta.onlyGuest && isAuthenticated){
            next('/');
        }else{
            next();
        }
    }catch(error){
        console.error('Error during route navigation: ', error);
        next('/login');
    }
});

export default router;
