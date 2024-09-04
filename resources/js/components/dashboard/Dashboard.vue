<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">Dashboard Component</div>
                    <div class="card-body">
                        I'm an Dashboard component.<br/>
                        <router-link to="/">Home</router-link>
                        <button type="button" @click="logout" v-if="user">Logout</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

    export default {
        computed:{
            ...mapState(['user'])
        },
        methods:{
            ...mapActions(['logout'])
        },
        created() {
            this.$store.dispatch('fetchUser');
        },
    }
</script>
