<template>
    <div class="az-body">
        <div class="az-signup-wrapper">
        <div class="az-column-signup-left">
            <div>
            <h5>Simple Login & Register Authentication</h5>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum</p>
            </div>
        </div><!-- az-column-signup-left -->
        <div class="az-column-signup">
            <h1 class="az-logo">Valaippathivu</h1>
            <template v-if="!userVerified && userRegistered">
                <div class="az-signup-header">
                    <h2 class="mb-3">Verify Your Account!</h2>
                    <p class="mb-3 text-secondary">Enter OTP sent to your Email</p>
                    <form @submit.prevent="verifyOtp">
                        <div class="form-group">
                            <input type="text" class="form-control" :class="{'parsley-error': otpErrMsg}" placeholder="Enter your OTP" v-model="otp">
                            <small v-if="otpErrMsg" class="text-danger form-text">{{ otpErrMsg }}</small>
                        </div>
                        <button type="submit" class="btn btn-az-primary btn-block mt-2">Continue</button>
                    </form>
                </div>
            </template>
            <template v-else-if="userVerified">
                <div class="az-signup-header">
                    <h2 class="mb-3">Account Verified!</h2>
                    <p class="mb-3 text-secondary">Email Verified Successfully, redirecting to Dashboard. Enjoy Blogging..</p>
                </div>
            </template>
            <template v-else>
                <div class="az-signup-header">
                <h2>Get Started</h2>
                <h4>It's free to signup and only takes a minute.</h4>
                <form @submit.prevent="register">
                    <div class="form-group">
                    <label>Firstname &amp; Lastname</label>
                    <input v-model="name" type="text" class="form-control" :class="{'parsley-error':nameErrMsg}" placeholder="Enter your firstname and lastname">
                    <small v-if="nameErrMsg" class="text-danger form-text">{{ nameErrMsg }}</small>
                    </div><!-- form-group -->
                    <div class="form-group">
                    <label>Email</label>
                    <input v-model="email" type="text" class="form-control" :class="{'parsley-error':emailErrMsg}" placeholder="Enter your email">
                    <small v-if="emailErrMsg" class="text-danger form-text">{{ emailErrMsg }}</small>
                    </div><!-- form-group -->
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
                                <span class="input-group-text" id="confirm-password-toggle" @click="togglePassword"><i :class="passwordTypeClass" class="las"></i></span>
                            </div>
                            <input v-model="passwordConfirmation" :type="passwordType" class="form-control" :class="{'parsley-error':passwrdConfErrMsg}" :disabled="passwrdErrMsg || password.length == 0" placeholder="Confirm password">
                        </div>
                        <small v-if="passwrdConfErrMsg" class="text-danger form-text">{{ passwrdConfErrMsg }}</small>
                    </div><!-- form-group -->

                    <button type="submit" class="btn btn-az-primary btn-block mt-2" :disabled="inprocess">
                        <template v-if="inprocess">
                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Loading...
                        </template>
                        <template v-else>
                            Create Account
                        </template>
                    </button>

                    <div class="row row-xs">
                    <div class="col-sm-6"><button type="button" class="btn btn-block"><i class="fab fa-facebook-f"></i> Signup with Facebook</button></div>
                    <div class="col-sm-6 mg-t-10 mg-sm-t-0"><button type="button" class="btn btn-primary btn-block"><i class="fab fa-twitter"></i> Signup with Twitter</button></div>
                    </div><!-- row -->
                </form>
                </div><!-- az-signup-header -->
                <div class="az-signup-footer">
                    <p>Already have an account? <router-link to="/login">Sign In</router-link></p>
                </div><!-- az-signin-footer -->
            </template>
        </div><!-- az-column-signup -->
        </div><!-- az-signup-wrapper -->
    </div>
</template>

<script>
import axios from '../../../axios';
import validationMixin from '../../../validationMixin';
import otpVerifyMixin from '../../../otpVerifyMixin';
import passwordMixin from '../../../passwordMixin';

export default {
    mixins:[validationMixin, otpVerifyMixin, passwordMixin],
    data() {
        return {
            name: '',
            email: '',
            password: '',
            passwordConfirmation: '',
            nameErrMsg:'',
            emailErrMsg:'',
            passwrdErrMsg:'',
            passwrdConfErrMsg:'',
            userRegistered:false,
            otp:'',
            otpErrMsg:'',
            userVerified:false,
            inprocess:false
        };
    },
    methods: {
        async register() {
            try {
                this.nameErrMsg = this.validateName(this.name);
                this.emailErrMsg = this.validateEmail(this.email);
                this.passwrdErrMsg = this.validatePassword(this.password);
                this.passwrdConfErrMsg = this.validatePassword(this.passwordConfirmation, true, this.password);
                if(this.emailErrMsg || this.nameErrMsg || this.passwrdErrMsg || this.passwrdConfErrMsg){
                    return;
                }
                //await axios.get('sanctum/csrf-cookie');
                const payload = {
                    name: this.name,
                    email: this.email,
                    password: this.password,
                    password_confirmation: this.passwordConfirmation,
                };
                this.inprocess = true;
                const response = await axios.post('/api/register', payload);
                if(response.data.status){
                    this.userRegistered = true;
                    this.inprocess = false;
                }
                console.log(response.data.msg);
            } catch (error) {
                this.inprocess = false;
                console.error('Registration failed:', error.response.data);
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
                    setTimeout(()=>{
                        this.$router.push('/login');
                    },2000);
                    this.inprocess = false;
                    console.log(response.data.msg);
                }else{
                    this.inprocess = false;
                    console.log(response.data.msg);
                    this.otpErrMsg = response.data.msg;
                }
            }catch(error){
                this.inprocess = false;
                console.error('Otp Verification failed', error);
            }
        },
    },
};
</script>
