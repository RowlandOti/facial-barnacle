import axios from 'axios';
import Endpoints from './Endpoints';

export const userService = {
  loginUser,
}

function loginUser(payload) {
  const url = Endpoints.LOGIN
  return axios.post(url, payload)
}
