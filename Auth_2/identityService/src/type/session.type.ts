export interface SessionSchema{
    id:string;
    user_id:string;
    session_token:string;
    ip_address:string|null;
    user_agent:string|null;
    device_info:any|null;
    device_id:string|null;
    revoked:true|false;
    expires_at:Date;
    created_at:Date;
    updated_at:Date;
}

export type sessionOptionsDto={
    user_id:string;
    ip_address?:string;
    device_info?:any;
    device_id?:any;
    user_agent?:any;
    expires_at?:Date;
    revoked?:false|true;
    session_token?:string
}

export type sessionMetaData = {
    ip_address?:string;
    device_info?:any;
    device_id?:any;
    user_agent?:any;
}