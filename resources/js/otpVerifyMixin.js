export default {
    data() {
        return {
            isPasswordVisible: false,
            intervalId:null,
            timeRemaining:300,
            allowResend:false
        };
    },
    beforeDestroy(){
        this.stopTimer();
    },
    computed: {
        formattedTime(){
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            return `${this.pad(minutes)} : ${this.pad(seconds)}`;
        }
    },
    methods: {
        pad(number){
            return number.toString().padStart(2, '0');
        },
        startTimer(){
            //clear any existing interval
            if(this.intervalId){
                clearInterval(this.intervalId);
            }

            //start a new Interval
            this.intervalId = setInterval(() => {
                if(this.timeRemaining > 0){
                    this.timeRemaining -=1;
                }else{
                    this.allowResend = true;
                    clearInterval(this.intervalId);
                }
            },1000);
        },
        stopTimer(){
            //clear any existing interval
            if(this.intervalId){
                clearInterval(this.intervalId);
                this.allowResend = true;
            }
        },
    }
};
