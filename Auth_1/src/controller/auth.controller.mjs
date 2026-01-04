import { BAD_REQ } from "../utils/Error.mjs";


const CreateAuthController = function ({
    AuthService
}) {
    const register = async (req, res) => {
        req.c_log.info({event:"REGISTER_USER",status:"RECEIVED"})
        if (!req.body) throw BAD_REQ({ message: "body not empty!", event: "event.auth.register",layer:"layer.controller" })
        const { username, email, full_name, password } = req.body || {};
        if (!username) throw BAD_REQ({message: "username is required!", event: "event.auth.register",layer:"layer.controller" });
        if (!email) throw BAD_REQ({ message: "email is required!", event: "event.auth.register",layer:"layer.controller" });
        if (!full_name) throw BAD_REQ({ message: "full_name is required!", event: "event.auth.register" ,layer:"layer.controller"});
        if (!password || password.length < 12) throw BAD_REQ({ message: "password is required or password must be greater than 11!", event: "event.auth.register",layer:"layer.controller" });

        const user = await AuthService.create({
            username, full_name, email, password
        },req)
        req.c_log.info({event:"REGISTER_USER",status:"COMPLETED"})
        return {
            status: 200,
            body: {
                data: user
            }
        }
    }

    const verifyEmail = async (req, res) => {
        req.c_log.info({event:"VERIFY_EMAIL",status:"RECEIVED"})
        if (!req.query) throw BAD_REQ({
            message: "token is required", 
            event: "event.auth.verifyEmail", 
            layer:"layer.controller"
        })
        const { t: token } = req.query;
        await AuthService.verifyEmail({token},req);
        req.c_log.info({event:"VERIFY_EMAIL",status:"COMPLETED"})
        return {
            status: 200,
            body: {
                message: "verify you email!"
            }
        }
    }

    const login = async (req, res,next) => {
        req.c_log.info({event:"LOGIN",status:"RECEIVED"});
        if(!req?.body) throw BAD_REQ({message:"body is required!",layer:"layer.controller",event:"event.auth.login"});
        const {username,email,password} = req?.body||{};
        const {access_token,refresh_token,session_token} = await AuthService.passwordLogin({username,email,password},req);
        req.c_log.info({event:"LOGIN",status:"COMPLETED"});
        return {
            cookies:[
                {name:"sid",value:session_token,path:"/api/v1",age:1000*60*60*24},
                {name:"rid",value:refresh_token,path:"/api/v1/auth/refresh",age:1000*60*60*24}
            ],
            status:200,
            body:{
                message:"Successfully Login!",
                access_token,
                expires_in:"15m"
            }
        }
    }

    const oauthLogin = async(req,res,next)=>{
        req.c_log.info({event:"OAUTH_LOGIN",status:"RECEIVED"});
        if(!req?.query) throw  BAD_REQ({message:"query is required!",layer:"layer.controller",event:"event.auth.oauthLogin"});
        const {provider} = req.query||{};
        if(!provider) throw BAD_REQ({message:"provider is required!",layer:"layer.controller",event:"event.auth.oauthLogin"});
        const {redirect_url,session_id} = await AuthService.oauthLogin({provider},req);
        req.c_log.info({event:"OAUTH_LOGIN",status:"COMPLETED"});
        return {
            cookies:[
                {name:"session_id",value:session_id,path:`/api/v1/auth/${provider}/callback`,age:1000*60*10}
            ],
            redirect:true,
            url:redirect_url
        }
    }

    const linkProvider = async(req,res,next)=>{
        req.c_log.info({event:"LINK_PROVIDER",status:"RECEIVED"});
        if(!req?.body) throw BAD_REQ({message:"body is required",layer:"layer.controller",event:"event.auth.linkProvider"});
        const {provider,password,flow_id,name} = req.body||{};
        if(provider==="oauth"&&!name) throw BAD_REQ({message:"name is required!",layer:"layer.controller",event:"event.auth.linkProvider"});
        if(provider==="password"&&!password) throw BAD_REQ({message:"password is required!",layer:"layer.controller",event:"event.auth.linkProvider"});
        if(!flow_id) throw BAD_REQ({message:"flow_id is required!",layer:"layer.controller",event:"event.auth.linkProvider"});
        const result = await AuthService.linkProvider({provider,password,flow_id,name},req);
        if(provider==="oauth") return {cookies:[{name:"session_id",value:result.session_id,path:`/api/v1/auth/${name}/callback`,age:1000*60*10}],redirect:true,url:result.redirect_url};
        req.c_log.info({event:"LINK_PROVIDER",status:"COMPLETED"});
        return {
            c_cookies:["session_id"],
            cookies:[
                {name:"sid",value:result.session_token,path:"/api/v1/",age:1000*60*60*24},
                {name:"rid",value:result.refresh_token,path:"/api/v1/auth/refresh",age:1000*60*60*24}
            ],
            status:200,
            body:{
                access_token:result.access_token,
                message:"successfully login!",
                expires_in:"15m"
            }
        }
    }

    const oauthCallback = async(req,res,next)=>{

        req.c_log.info({event:"OAUTH_CALLBACK",status:"RECEIVED"})
        if(!req?.query) throw BAD_REQ({message:"query is required!",layer:"layer.controller",event:"event.auth.oauthCallback"});
        const {code,state} = req?.query||{};
        if(!code || !state) throw BAD_REQ({message:"code and state is required!",layer:"layer.controller",event:"event.auth.oauthCallback"});
        const {session_id} = req?.cookies||{};
        if(!session_id) throw BAD_REQ({layer:"layer.controller",event:"event.auth.oauthCallback",message:"session cookie not found!",});
        const  {access_token,refresh_token,session_token} = await AuthService.oauthCallback({state,code,session_id},req);
        req.c_log.info({event:"OAUTH_CALLBACK",status:"COMPLETE"});
        return {
            c_cookies:["session_id"],
            cookies:[
                {name:"sid",value:session_token,path:"/api/v1",age:1000*60*60*24},
                {name:"rid",value:refresh_token,path:"/api/v1/auth/refresh",age:1000*60*60*24}
            ],
            status:200,
            body:{
                access_token,
                message:"successfully login!",
                expires_in:"15m"
            }
        }
    }

    const refresh = async (req, res, next) => {
        req.c_log.info({event:"REFRESH",status:"RECEIVED"});
        const { sid, rid } = req.cookies || {};
        if (!sid || !rid) {
            throw BAD_REQ({
                message: "sid and rid is required!", event: "event.auth.refresh",layer:"layer.controller"
            })
        }
        const {
            access_token,
            refresh_token,
            session_token,
        } = await AuthService.refresh_TOKEN({sid, rid},req);
        req.c_log.info({event:"refresh",status:"completed"})
        return {
            cookies: [
                { name: "sid", value: session_token, path: "/api/v1", age: 1000 * 60 * 60 * 24 },
                { name: "rid", value: refresh_token, path: "/api/v1/auth/refresh", age: 1000 * 60 * 60 * 24 }
            ],
            status: 200,
            body: {
                message: "successfully refreshed!",
                access_token,
                expires_in: "15m"
            }
        }

    }

    const logout = async (req, res, next) => {
        req.c_log.info({event:"logout",status:"received"});
        const { user_id } = req.session || {};
        const { all = false } = req?.query || {};
        const { sid } = req.cookies || {};
        if (!sid) throw BAD_REQ({
            message: "sid is required!",
            event: "event.auth.logout",
            layer:"layer.controller"
        })
        await AuthService.logout({user_id, sid, all},req);
        req.c_log.info({event:"logout",status:"completed"});
        return {
            c_cookies: ["sid", "rid"],
            status: 200,
            body: {
                message: "successfully logout!",
            }
        };
    }

    const forgetPassword = async (req, res, next) => {
        req.c_log.info({event:"forgetPassword",status:"received"});
        if (!req?.body) throw BAD_REQ({
            message: "body is required!",
            event: "event.auth.forgetPassword",
            layer:"layer.controller"
        })
        const { username, email } = req.body;
        if (!username && !email) throw BAD_REQ({
            message: "username | email is required",
            event: "event.auth.forgetPassword",
            layer:"layer.controller"
        })
        await AuthService.forgetPassword({ username, email },req);
        req.c_log.info({event:"forgetPassword",status:"completed"})
        return {
            status: 200,
            body: {
                message: "check your email!"
            }
        }
    }

    const resetPass = async (req, res, next) => {
        req.info.log({event:"resetPass",status:"received"});
        if (!req?.body) throw BAD_REQ({
            message: "body is required!",
            event: "event.auth.resetPass",
            layer:"layer.controller"
        })
        const { token, password } = req.body;
        if (!token || !password) throw BAD_REQ({
            message: "token and password is must required!",
            event: "event.auth.resetPass",
            layer:"layer.controller"
        })
        await AuthService.resetPass({token, password},req);
        req.info.log({event:"resetPass",status:"completed"});
        return {
            status: 200,
            body: {
                message: "please login again!"
            }
        }
    }

    const addPass = async(req,res,next)=>{
        req.info.log({event:"addPass",status:"received"});
        if(!req?.body) throw BAD_REQ({
            message:"body is required!",
            layer:"layer.controller",
            event:"event.auth.addPass"
        })
        const {password} = req?.body||{};
        if(!password) throw BAD_REQ({message:"password is required",layer:"layer.controller",event:'event.auth.addPass'});
        const {user_id,account_id} = req?.session||{};
        await AuthService.addPass({password,user_id,account_id},req);
        req.info.log({event:"addPass",status:"completed"});
        return {
            status:200,
            body:{
                message:"add password successfully!"
            }
        }
    }

    return {
        register,
        login,
        refresh,
        logout,
        verifyEmail,
        forgetPassword,
        resetPass,
        oauthLogin,
        oauthCallback,
        linkProvider,
        addPass
    }
}

export default CreateAuthController;