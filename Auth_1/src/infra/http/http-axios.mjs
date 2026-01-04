import axios from "axios"
import AppError, { normalizeError } from "../../utils/Error.mjs";
import {splitUrl} from './utils.mjs';


const client = axios.create({
    timeout:5000,
    validateStatus:()=>true  // important: we handle status mannualy
})

export async function request({
    method,
    requestUrl,
    headers={},
    data,
    params
}){
    try{
        const {baseURL,url} = splitUrl(requestUrl);
        const res = await client({
            method,
            url,
            baseURL,
            headers,
            data,
            params
        })

        if(res.status>=200 && res.status<300 &&!res?.data?.error ){
            return res.data;
        }

        throw AppError.known({
            message:res?.data?.message||res?.data?.error_description||"http request failed",
            status:res.status,
            code:res?.data.error,
            event:"event.http.request",
            layer:"layer.infra"
        })
    }catch(err){
        throw normalizeError(err,{
            event:"event.http.request",
            layer:"layer.infra"
        })
    }
}