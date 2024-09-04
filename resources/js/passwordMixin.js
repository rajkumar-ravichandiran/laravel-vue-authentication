export default {
    data() {
        return {
            isPasswordVisible: false
        };
    },
    computed: {
        passwordType() {
            return this.isPasswordVisible ? 'text' : 'password';
        },
        passwordTypeClass() {
            return this.isPasswordVisible ? 'la-eye' : 'la-low-vision';
        }
    },
    methods: {
        togglePassword() {
            this.isPasswordVisible = !this.isPasswordVisible;
        }
    }
};
