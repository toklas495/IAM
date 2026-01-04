// every auth provider must Implement this shape

export class AuthProviderContract{
    constructor(name){
        this.name = name;
    }
    /*
        called when auth start
        oauth -> redirect url
        password -> nothing
    */

    async initiate(ctx){
        throw new Error("initiate() not implemented");
    }

    /**
     * 
     * called after user proves identity
     * must return normalized profile
     */

    async authenticate(ctx){
        throw new Error("authenticate not implmented");
    }
}

export function createAuthProfile({
    provider,
    provider_user_id,
    provider_email,
    provider_email_verified,
    name,
    avatar
}){
    return {
        provider,
        provider_user_id,
        provider_email,
        provider_email_verified,
        name,
        avatar
    }
}