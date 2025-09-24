//create axios instance with base url
import axios from 'axios';
const instance = axios.create({
  baseURL: 'https://nakuls-restaurant.onrender.com',
  withCredentials: true,
});
export default instance;
