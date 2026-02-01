import type { FastifyReply, FastifyRequest } from "fastify";

type cookieSchema = {
    name:string;
    value:string;
    path:string;
    age:number;
}

export interface responseSchema {
    status:"ok";
    message?:string;
    data?:string|object;
    cookies?:cookieSchema[];
    redirect?:true|false;
    url?:string;
    clearCookie?:string[]
}

const cookieHandler = (response:responseSchema,reply:FastifyReply)=>{
    if(response.cookies){
        response.cookies.forEach(cookie=>{
            reply.setCookie(cookie.name,cookie.value,{
                httpOnly:true,
                secure:true,
                sameSite:"lax",
                path:cookie.path,
                maxAge:cookie.age
            })
        })
    }

    if(response.clearCookie){
        response.clearCookie.forEach(name=>{
            reply.clearCookie(name,{
                httpOnly:true,
                sameSite:"lax",
                secure:true,
                path:"/"
            })
        })
    }
}

export const c_asyncHandler = (fn:Function)=>{
    return async(req:FastifyRequest,reply:FastifyReply)=>{
        const response:responseSchema =  await fn(req,reply);
        cookieHandler(response,reply);
        if(response.redirect&&response.url) return reply.redirect(response.url);
        return {
            status:response.status,
            message:response.message,
            data:response.data
        }
    }
}