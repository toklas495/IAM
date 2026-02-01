import type { providerSchema } from "../../../../type/account.type.js";
import type { AuthProvider,AuthResult } from "../provider.contract.js";
import type { ErrorSchema } from "../../../../utils/error.js";
import type { UserModel } from "../../../../model/user.model.js";
import type { CredServiceSchema } from "../../../tokens/cred.token.js";


interface Options{
    User:UserModel;
    Error:ErrorSchema;
    Cred:CredServiceSchema
}

interface inputSchema{
    email:string,
    password:string
}

class PasswordProvider implements AuthProvider{
    name:providerSchema="password";
    readonly User:UserModel;
    readonly Error:ErrorSchema;
    readonly Cred:CredServiceSchema;


    constructor(opts:Options){
        this.User = opts.User;
        this.Error = opts.Error;
        this.Cred = opts.Cred;
        this.authenticate = this.authenticate.bind(this);
    }
    initiate(): string {
        return "It's not implemented! sorry"
    }
    async authenticate({email,password}:inputSchema){
        const user = await this.User.findByEmail(email);
        if(!user) throw this.Error.invalidCred();
        if(!user.email_verified) throw this.Error.unAuthorized("please verified first!");
        if(!user.is_active) throw this.Error.notFound();
        await this.Cred.checkCred(password,user.id);
        return {
            provider:"password",
            user_id:user.id,
            provider_email:user.email,
            metadata:{}
        } as AuthResult
    }
}

export default PasswordProvider;