import type { providerSchema } from "./oauth.type.js"

export interface AccountSchema{
    id:string,
    user_id:string,
    provider:providerSchema,
    provider_user_id:string,
    provider_email?:string,
    refresh_token?:string,
    expired_at?:string,
    scope?:string,
    is_active?:boolean,
    created_at:Date,
    updated_at:Date
}


