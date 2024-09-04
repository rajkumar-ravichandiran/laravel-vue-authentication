<template>
    <div class="az-body">
        <div class="az-signin-wrapper">
            <div class="az-card-signin">
                <h1 class="az-logo">Valaippathivu</h1>
                <div class="az-signin-header">
                    <template v-if="userVerified">
                        <form @submit.prevent="loginTo">
                            <h2>Welcome back!</h2>
                            <h4>Please sign in to continue</h4>

                            <div class="form-group">
                                <label>Email</label>
                                <input type="text" class="form-control" :class="{'parsley-error': emailErrMsg}" placeholder="Enter your email" v-model="email">
                                <small v-if="emailErrMsg" class="text-danger form-text">{{ emailErrMsg }}</small>
                            </div><!-- form-group -->
                            <div class="form-group">
                                <label>Password</label>
                                <div class="input-group">
                                    <div class="input-group-prepend cursor-pointer">
                                        <span class="input-group-text" id="password-toggle" @click="togglePassword"><i :class="passwordTypeClass" class="las"></i></span>
                                    </div>
                                    <input aria-describedby="password-toggle" :type="passwordType" class="form-control" :class="{'parsley-error': passwrdErrMsg}" placeholder="Enter your password" v-model="password">
                                </div>
                                <small v-if="passwrdErrMsg" class="text-danger form-text">{{ passwrdErrMsg }}</small>
                            </div><!-- form-group -->
                            <button type="submit" class="btn btn-az-primary btn-block mt-2" :disabled="inprocess">
                                <template v-if="inprocess">
                                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Loading...
                                </template>
                                <template v-else>
                                    Sign In
                                </template>
                            </button>
                        </form>
                    </template>
                    <template v-else>
                        <form @submit.prevent="handleSubmit">
                            <h2>Sorry, Not allowed!</h2>
                            <h4>Please verify your account</h4>

                            <div class="form-group">
                                <label>Email</label>
                                <input :disabled="otpSent" type="text" class="form-control" :class="{'parsley-error': emailErrMsg}" placeholder="Enter your email" v-model="email">
                                <small v-if="emailErrMsg" class="text-danger form-text">{{ emailErrMsg }}</small>
                            </div><!-- form-group -->
                            <div class="form-group mb-2">
                                <p class="mb-1 az-content-text">We've sent you a code to your email.</p>
                                <p class="mb-2 az-content-text">This code will expire in <span v-if="formattedTime" class="tx-primary tx-medium">{{ formattedTime }}</span> mins</p>
                                <label class="d-flex align-items-end mb-2">Enter OTP <button :disabled="!allowResend" @click="sendOtp" class="btn btn-outline-primary btn-rounded btn-block mg-l-auto btn-sm mt-0" type="button">Resend Code</button></label>
                                <input type="text" class="form-control" :class="{'parsley-error': otpErrMsg}" placeholder="Enter your OTP" v-model="otp">
                                <small v-if="otpErrMsg" class="text-danger form-text">{{ otpErrMsg }}</small>
                            </div>
                            <button type="submit" class="btn btn-az-primary btn-block mt-2" :disabled="inprocess">
                                <template v-if="inprocess">
                                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Loading...
                                </template>
                                <template v-else>
                                    Continue
                                </template>
                            </button>
                        </form>
                    </template>
                </div><!-- az-signin-header -->
                <div class="az-signin-footer">
                    <p class="mt-2"><router-link to="/forget-password">Forgot password?</router-link></p>
                    <p>Don't have an account? <router-link to="/register">Create an Account</router-link></p>
                </div><!-- az-signin-footer -->
            </div><!-- az-card-signin -->
        </div>
    </div>
</template>

<script>
import axios from '../../../axios';
import validationMixin from '../../../validationMixin';
import otpVerifyMixin from '../../../otpVerifyMixin';
import passwordMixin from '../../../passwordMixin';

export default{
    mixins:[validationMixin, otpVerifyMixin, passwordMixin],
    data(){
        return {
            email:'',
            password:'',
            otp:'',
            emailErrMsg:'',
            passwrdErrMsg:'',
            otpErrMsg:'',
            inprocess:false,
            userVerified:true,
            otpSent:false,
        };
    },
    methods:{
        async loginTo(){
            try{
                this.emailErrMsg = this.validateEmail(this.email);
                this.passwrdErrMsg = !this.password ? 'Password is required' : '';
                if(this.emailErrMsg || this.passwrdErrMsg){
                    return;
                }
                this.inprocess = true;
                const credentials = {email:this.email, password:this.password};
                const response = await axios.post('/api/login',credentials);
                console.log(response);
                if(response && response.data.status){
                    console.log(response.data.msg);
                    this.$router.push('/');
                }
            }catch(error){
                this.inprocess = false;
                if(error && error.response && error.response.status === 403){
                    this.userVerified = false;
                    this.password = '';
                    this.sendOtp();
                }
                console.error('Login failed', error);
            }
        },
        async verifyOtp(){
            try{
                this.emailErrMsg = this.validateEmail(this.email);
                this.otpErrMsg = this.validateOtp(this.otp);
                if(this.emailErrMsg || this.otpErrMsg){
                    return;
                }
                this.inprocess = true;
                const response = await axios.post('/api/verify-user',{email:this.email, otp:this.otp});

                if(response.data.status){
                    this.userVerified = true;
                    this.inprocess = false;
                    console.log(response.data.msg);
                    this.$router.push('/login');
                }else{
                    console.log(response.data.msg);
                    this.inprocess = false;
                    this.otpErrMsg = response.data.msg;
                }
                this.stopTimer();
            }catch(error){
                console.error('Reset Password failed', error);
            }
        },
        async sendOtp(){
            try{
                this.emailErrMsg = this.validateEmail(this.email);
                if(this.emailErrMsg){
                    return;
                }
                this.inprocess = true;
                const response = await axios.post('/api/send-otp',{email:this.email});

                if(response.data.status){
                    this.otpSent = true;
                    this.inprocess = false;
                    this.allowResend = false;
                    this.timeRemaining = 300;
                    this.startTimer();
                    console.log(response.data.msg);
                }else{
                    this.inprocess = false;
                    console.log(response.data.msg);
                }
            }catch(error){
                this.inprocess = false;
                console.error('Reset Password failed', error);
            }
        },
        async handleSubmit(){
            if(!this.userVerified && !this.otpSent){
                await this.sendOtp();
            }else{
                await this.verifyOtp();
            }
        }
    }
}
</script>
