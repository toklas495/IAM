import AppError from "../utils/Error.mjs";

const CreateUserController = function ({
    UserService
}) {
    const read = async (req, res) => {
        req.c_log.info({event:"READ_USER_BY_USER_ID",status:"RECEIVED"});
        if (!req?.params) throw AppError.known({
            message: "parmas is required!",
            event: "event.user.read",
            status: 400,
            layer:"layer.controller"
        })
        const { userId } = req.params;
        const user = await UserService.read({user_id:userId},req);
        req.c_log.info({event:"READ_USER",status:"COMPLETED"});
        return {
            status: 200,
            body:{
                data: user
            }
        }
    }

    const readProfile = async (req, res) => {
        req.c_log.info({status:"RECEIVED",event:"READ_PROFILE_BY_ME"});
        const { user_id } = req.session || {};
        const user = await UserService.read({user_id,me:true},req);
        req.c_log.info({status:"READ_PROFILE_BY_ME",event:"COMPLETED"});
        return {
            status: 200,
            body:{
                data: user
            }
        }
    }

    const update = async (req, res) => {
        req.c_log.info({status:"RECEIVED",event:"UPDATE_USER"})
        if (!req?.body) throw AppError.known({
            message: "body is required",
            event: "event.user.update",
            status: 400,
            layer:"layer.controller"
        })
        const { user_id } = req.session || {};
        const { username, full_name, email, bio } = req.body||{};
        if (![username, full_name, email, bio].some(param => param)) throw AppError.known({ message: "empty body not required!", event: "event.user.update", status: 400,layer:"layer.controller" });
        await UserService.update({ user_id, username, full_name, email, bio },req);
        req.c_log.info({event:"UPDATE_USER",status:"COMPLETED"});
        return { 
            status: 200,
            body:{
                message:"updated!"
            } 
        };
    }

    const updatePassword = async (req, res) => {
        req.c_log.info({event:"UPDATED_PASSWORD",status:"RECEIVED"});
        if (!req?.body) throw AppError.known({
            status: 400,
            message: "body is empty",
            event: "event.user.update",
            layer:"layer.controller"
        })
        const { user_id } = req.session || {};
        const { password } = req.body;
        await UserService.updatePassword({user_id, password},req);
        req.c_log.info({event:"UPDATED_PASSWORD",status:"COMPLETED"})
        return {
            status: 200,
            body:{
                message:"updated!"
            }
        }
    }


    const destroy = async (req, res) => {
        req.c_log.info({status:"RECEIVED",event:"DESTROYED"})
        const { user_id} = req.session || {};
        await UserService.destroy({user_id},req);
        req.c_log.info({status:"COMPLETED",event:"DESTROYED"});
        return {
            status: 200,
            body:{
                message:"deleted!"
            }
        }
    }

    return {
        destroy,
        read,
        update,
        updatePassword,
        readProfile
    }
}


export default CreateUserController;
