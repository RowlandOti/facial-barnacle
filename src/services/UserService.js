import csrf_axios from 'axios';
import Endpoints from './Endpoints';

export const userService = {
    loginUser
}

function loginUser(payload) {
    const url = Endpoints.LOGIN
    return csrf_axios.post(url, payload)
}
