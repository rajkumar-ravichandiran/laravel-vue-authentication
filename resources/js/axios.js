import axios from 'axios'
const instance = axios.create({
   baseURL: 'http://valaippathivu.local/',
   withCredentials: true,
   withXSRFToken : true
});

export default instance;
