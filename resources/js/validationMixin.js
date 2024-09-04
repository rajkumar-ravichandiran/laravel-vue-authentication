import { validEmail, validPassword, validName } from './validationUtils';

export default {
    methods: {
        validateEmail(email) {
            if (!email) {
                return 'Email is required';
            } else if (!validEmail(email)) {
                return 'Enter a valid email';
            } else {
                return '';
            }
        },
        validatePassword(password, isConfirm = false, orginalPassword) {
            if (!password) {
                return 'Password is required';
            } else if (!validPassword(password)) {
                return 'Password must be at least 6 characters long, include at least one number, one uppercase letter, and one special symbol.';
            } else if (isConfirm && password !== orginalPassword) {
                return 'Passwords do not match';
            } else {
                return '';
            }
        },
        validateName(name) {
            if (!name) {
                return 'Name is required';
            } else if (!validName(name)) {
                return 'Name should only contain letters and numbers';
            } else {
                return '';
            }
        },
        validateOtp(otp){
            if(!otp){
                return 'OTP is required';
            }else if(otp < 6){
                return 'Enter 6 Digit Valid OTP';
            }else{
                return '';
            }
        },
    }
}
