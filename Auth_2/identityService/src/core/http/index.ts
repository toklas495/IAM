import axios from "axios";
import {URL} from 'url';
import { AppError } from "../../utils/AppError.js";

interface RequestOptionInterface {
    method:string;
    url:string;
    data?:object|string;
    headers?:object;
    params?:object
}

const splitUrl = (url:string)=>{
    const userParam = new URL(url);
    return {
        baseUrl:userParam.origin,
        url:userParam.pathname+userParam.search
    }
}


const client = axios.create({
    timeout:5000,
    validateStatus:()=>true // important we handle status manually
})


export default async function Request(
    opts:RequestOptionInterface
){
    try{
        const {baseUrl,url} = splitUrl(opts.url);
        const res = await client({
            method:opts.method,
            url:url,
            baseURL:baseUrl,
            headers:opts.headers||{},
            data:opts.data||{},
            params:opts.params||{}
        })

        if(res.status>=200 && res.status<300 && !res?.data?.error) {
            return res.data;
        }
        throw new AppError({
            message:res?.data?.message||res?.data?.error_description||"http_request_failed",
            code:res?.data?.error||"UNAUTH",
            status:res.status
        })
    }catch(error){
        throw error;
    }
}