import AppError from "../utils/Error.mjs";

const providers = new Map();

export function register(provider){
    if(!provider?.name){
        throw AppError.known({message:"Provider must have a name!",layer:"layer.auth",event:"event.auth.register"});
    }
    providers.set(provider.name,provider);
}


export function getProvider(name){
    const provider = providers.get(name);
    if(!provider){
        throw AppError.known({message:`Auth provider not found: ${name}`,status:404,layer:"layer.auth",event:"event.auth.getProvider"})
    }
    return provider;
}