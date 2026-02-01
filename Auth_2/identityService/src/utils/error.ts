import { AppError } from "./AppError.js";


export default function createError(){
    const alreadyExist = (message?:string):AppError=>
        new AppError({
            message:message??"alread exist!",
            code:"DUPLICATE",
            status:409
        })
    const unAuthorized = (message?:string):AppError=>
        new AppError({
            message:message??"unAuthorized",
            code:"UNAUTH",
            status:401
        })
    const forbidden = (message?:string):AppError=>
        new AppError({
            message:message??"Access Denied!",
            code:"FORBIDDEN",
            status:403
        })
    const usernameOrEmailExist = (message?:string):AppError=>
        new AppError({
            message:message??"username or email already exist!",
            code:"DUPLICATE",
            status:407
        })
    const invalidCred = (message?:string):AppError=>
        new AppError({
            message:message??"invalid credentials!",
            code:"NOT_FOUND",
            status:404
        })
    
    const notFound = (message?:string):AppError=>
        new AppError({
            message:message??"Not Found!",
            code:"NOT_FOUND",
            status:404
        })
    return {
        unAuthorized,
        forbidden,
        usernameOrEmailExist,
        invalidCred,
        notFound,
        alreadyExist
    }
}

export type ErrorSchema = ReturnType<typeof createError>;