import type { CreateUserDTO } from "../../type/user.type.js"
import type { UserModel } from "../../model/user.model.js";
import type { ErrorSchema } from "../../utils/error.js";
import type { CredServiceSchema } from "../tokens/cred.token.js";
import type { providerSchema } from "../../type/oauth.type.js";
import { getProvider } from "./providers.services/provider.register.js";
import type { SessionServiceSchema } from "./session.service.js";
import { saveAuthFlow ,getAuthFlow, updateAuthFlow, deleteAuthFlow} from "../tokens/auth.token.js";
import type { AccountServiceSchema } from "./account.service.js";

interface AuthServiceDeps {
    User:UserModel,
    Error:ErrorSchema,
    Cred:CredServiceSchema,
    Session:SessionServiceSchema,
    Account:AccountServiceSchema
}

const createAuthService = (opts:AuthServiceDeps)=>{
    const register = async (user:CreateUserDTO)=>{
        const isUser = await opts.User.findByEmailOrUsername(user.email,user.username);
        if(isUser){
            if(!await opts.Cred.isCred(isUser.id)) throw opts.Error.unAuthorized("user existing provider/set password!");
            throw opts.Error.usernameOrEmailExist("username or email exist!");
        }
        const n_user = await opts.User.create({
            username:user.username,
            full_name:user.full_name,
            email:user.email
        });
        await opts.Cred.createCred(user.password,n_user.id);
    }

    const loginOauthInitiate = async(providerName:providerSchema)=>{
        const provider = getProvider(providerName);
        const flowObject = await saveAuthFlow(provider.name);
        const redirect_uri =  provider.initiate(flowObject);
        return {
            redirect_uri,
            flow_id:flowObject.flow_id
        }
    }

    const loginOauthAuthenticate = async(providerName:providerSchema,oauthPayload:object,opt:object)=>{
        const flow = await getAuthFlow(opt.flowId);
        if(!flow||flow.status!=="INIT") throw opts.Error.notFound("AuthFlow Not Found!");
        const authenticate_payload = {client:oauthPayload,server:flow.oauth};
        return authenticate(providerName,authenticate_payload,opt);
    }

    const authenticate = async(providerName:providerSchema,authenticate_payload:object,opt:object={})=>{
        const provider = getProvider(providerName);
        const identity = await provider.authenticate(authenticate_payload);
        const {type,user} = await opts.Account.resolveAccount(identity);
        if(type==="LINK_REQUIRED"){
            await updateAuthFlow(opt.flowId,{
                status:"LINK_REQUIRED",
                intent:"ACCOUNT_LINK",
                identity
            })
            throw opts.Error.alreadyExist(`Email Already Linked With Account! first Authenticate with Password Provider... flow_id:${opt.flowId}`);
        }
        await deleteAuthFlow(opt.flowId);
        return await opts.Session.createSession(user,opt);
    }

    const linkAccount = async(flowId:string,provider:string,password:string|undefined,opt:object={})=>{
        if(!flowId) throw opts.Error.notFound("FlowId is Required!");
        const flow = await getAuthFlow(flowId);
        if(!flow||flow.status!="LINK_REQUIRED") throw opts.Error.notFound("AuthFlow not found!");
        const authProvider = getProvider("password");
        const identity = await authProvider.authenticate({email:flow.identity.provider_email,password});
        const user = await opts.Account.linkAccount(identity,flow.identity);
        await deleteAuthFlow(flowId);
        return await opts.Session.createSession(user,opt);
    }


    return {
        register,
        authenticate,
        loginOauthAuthenticate,
        loginOauthInitiate,
        linkAccount
    }
}

export type AuthServiceSchema = ReturnType<typeof createAuthService>;
export default createAuthService;