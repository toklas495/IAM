import type { providerSchema, queryOptions } from "../type/oauth.type.js"

const providers:providerSchema[] = ["google","facebook","password","github"];

export const ProviderExtractor = (params:object)=>{
    const {provider} = params as {provider:providerSchema};
    if(!provider ||!providers.includes(provider)){
        return undefined;
    }
    return provider;
}

export const queryExtractor = (query:queryOptions)=>{
    const {code,state, error, error_description} = query;
    return {code,state,error,error_description};
}