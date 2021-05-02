import axios from 'axios'
import {Agent} from "node/https";

const csrf_axios = axios.create({
    withCredentials: true,
    httpsAgent: Agent({rejectUnauthorized: false, requestCert: true, keepAlive: true}),
})

csrf_axios.defaults.withCredentials = true
csrf_axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
csrf_axios.defaults.xsrfCookieName = "_csrf_token";

export default csrf_axios