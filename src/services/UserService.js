import axios from 'axios';
import Endpoints from './Endpoints';
import {storageRef} from "../init-fcm";

export const userService = {
    loginUser
}

function loginUser(payload) {
    const url = Endpoints.LOGIN
    return axios.post(url, payload)
}
