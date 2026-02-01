import type { providerSchema } from "../../../type/oauth.type.js";



export interface AuthProvider{
    name:providerSchema;
    authenticate(input:unknown):Promise<AuthResult>;
    initiate(input:unknown):string;
}

export interface AuthResult{
    provider:providerSchema,
    provider_user_id:string,
    user_id:string;
    provider_email?:string,
    metadata:Record<string,unknown>
}
