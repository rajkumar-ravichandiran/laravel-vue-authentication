<template>
    <div class="az-body">
        <div class="az-signin-wrapper">
            <div class="az-card-signin">
                <h1 class="az-logo">Valaippathivu</h1>
                <div class="az-signin-header">
                <h2 class="mb-3">Forget Password!</h2>
                <p class="mb-2 text-secondary">Provide your account's Email for which you want to reset password</p>

                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label>Email</label>
                        <input :disabled="otpSent" type="text" class="form-control" :class="{'parsley-error': emailErrMsg}" placeholder="Enter your email" v-model="email">
                        <small v-if="emailErrMsg" class="text-danger form-text">{{ emailErrMsg }}</small>
                    </div><!-- form-group -->
                    <template v-if="otpSent">
                        <template v-if="!userVerified" >
                            <div class="form-group mb-2">
                                <p class="mb-1 az-content-text">We've sent you a code to your email.</p>
                                <p class="mb-2 az-content-text">This code will expire in <span v-if="formattedTime" class="tx-primary tx-medium">{{ formattedTime }}</span> mins</p>
                                <label class="d-flex align-items-end mb-2">Enter OTP <button :disabled="!allowResend" @click="sendOtp" class="btn btn-outline-primary btn-rounded btn-block mg-l-auto btn-sm mt-0" type="button">Resend Code</button></label>
                                <input type="text" class="form-control" :class="{'parsley-error': otpErrMsg}" placeholder="Enter your OTP" v-model="otp">
                                <small v-if="otpErrMsg" class="text-danger form-text">{{ otpErrMsg }}</small>
                            </div>
                        </template>
                        <template v-else-if="userVerified">
                            <div class="form-group">
                                <label>Password</label>
                                <div class="input-group">
                                    <div class="input-group-prepend cursor-pointer">
                                        <span class="input-group-text" id="password-toggle" @click="togglePassword"><i :class="passwordTypeClass" class="las"></i></span>
                                    </div>
                                    <input v-model="password" :type="passwordType" class="form-control" :class="{'parsley-error':passwrdErrMsg}" placeholder="Enter your password">
                                </div>
                                <small v-if="passwrdErrMsg" class="text-danger form-text">{{ passwrdErrMsg }}</small>
                            </div><!-- form-group -->
                            <div class="form-group">
                                <label>Confirm Password</label>
                                <div class="input-group">
                                    <div class="input-group-prepend cursor-pointer">
                                        <span class="input-group-text" id="password-toggle" @click="togglePassword"><i :class="passwordTypeClass" class="las"></i></span>
                                    </div>
                                    <input v-model="passwordConfirmation" :type="passwordType" class="form-control" :class="{'parsley-error':passwrdConfErrMsg}" :disabled="passwrdErrMsg || password.length == 0" placeholder="Confirm password">
                                </div>
                                <small v-if="passwrdConfErrMsg" class="text-danger form-text">{{ passwrdConfErrMsg }}</small>
                            </div><!-- form-group -->
                        </template>
                    </template>
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
                </div><!-- az-signin-header -->
                <div class="az-signin-footer">
                    <p class="mt-2"><router-link to="login">Back to Login</router-link></p>
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
            emailErrMsg:'',
            otp:'',
            otpErrMsg:'',
            password: '',
            passwordConfirmation: '',
            passwrdErrMsg:'',
            passwrdConfErrMsg:'',
            inprocess:false,
            otpSent:false,
            userVerified:false,
        };
    },
    methods:{
        async resetPassword(){
            try {
                this.emailErrMsg = this.validateEmail(this.email);
                this.passwrdErrMsg = this.validatePassword(this.password);
                this.passwrdConfErrMsg = this.validatePassword(this.passwordConfirmation, true, this.password);
                if(this.emailErrMsg || this.passwrdErrMsg || this.passwrdConfErrMsg){
                    return;
                }
                //await axios.get('sanctum/csrf-cookie');
                this.inprocess = true;
                const payload = {
                    email: this.email,
                    password: this.password,
                    password_confirmation: this.passwordConfirmation,
                };
                const response = await axios.post('/api/reset-password', payload);
                if(response.data.status){
                    this.inprocess = false;
                    this.$router.push('/login');
                }
                console.log(response.data.msg);
            } catch (error) {
                this.inprocess = false;
                console.error('Reset Password failed:', error.response.data);
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
                const response = await axios.post('/api/verify-otp',{email:this.email, otp:this.otp});

                if(response.data.status){
                    this.userVerified = true;
                    this.inprocess = false;
                    console.log(response.data.msg);
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
            if(!this.otpSent && !this.userVerified){
                await this.sendOtp();
            }else if(this.otpSent && !this.userVerified){
                await this.verifyOtp();
            }else if(this.userVerified){
                await this.resetPassword();
            }
        }
    }
}
</script>
