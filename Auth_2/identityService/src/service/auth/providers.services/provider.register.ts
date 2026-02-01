import type { providerSchema } from "../../../type/account.type.js";
import { AppError } from "../../../utils/AppError.js";
import type { AuthProvider } from "./provider.contract.js";

const providers = new Map<string,AuthProvider>();

export const registerProvider = (provider:AuthProvider)=>{
    providers.set(provider.name,provider);
}

export const getProvider = (name:providerSchema)=>{
    const provider = providers.get(name);
    if(!provider) throw new AppError({message:"unknown provider",status:500,code:"INTERNAL_SERVER"});
    return provider;   
}


