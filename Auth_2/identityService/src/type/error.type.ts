export type ErrorCode = "UNAUTH"|"BAD_REQ"|"FORBIDDEN"|"NOT_FOUND"|"DUPLICATE"|"RATE_LIMIT"|"INTERNAL_SERVER"


export interface AppErrorOptions{
    message:string,
    status:number,
    code:ErrorCode,
    details?:Record<string,unknown>,
    cause?:string
}

