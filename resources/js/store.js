import {createStore} from 'vuex';
import axios from './axios';
import router from './router';

const store = createStore({
    state(){
        return {
            user:null,
            authenticated:false,
            isConfigLoaded:false,
            config:{}
        };
    },
    mutations:{
        setConfig(state, config){
            state.config = config;
            state.isConfigLoaded = true;
        },
        setUser(state, user){
            state.user = user;
            state.authenticated = !!user;
        },
        clearUser(state){
            state.user = null;
            state.authenticated = false;
        }
    },
    actions:{
        async fetchConfig({commit, state}){
            if (state.isConfigLoaded) return;
            try{
                const response = await axios.get('/api/config');
                commit('setConfig',response.data);
            }catch(error){
                console.error('Error in fetching config: ', error);
            }
        },
        async fetchUser({commit}){
            try{
                if(localStorage.getItem('_user_name') && localStorage.getItem('_user_token')){
                    commit('setUser',localStorage.getItem('_user_name'));
                    return;
                }
                const response = await axios.get('/api/user');
                commit('setUser',response.data.data.user);
                localStorage.setItem('_user_name',response.data.data.user);
                localStorage.setItem('_user_token',response.data.data.token);

            }catch(error){
                console.error('Error in fetching: ',error);
                commit('clearUser');
            }
        },
        async logout({commit}){
            try{
                await axios.post('/api/logout');
                localStorage.removeItem('_user_name');
                localStorage.removeItem('_user_token');
                commit('clearUser');
                router.push('/login');
            }catch(error){
                console.error('Error in logout: ',error);
            }
        }
    }
});

export default store;
