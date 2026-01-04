import { n_asyncHandler } from "../utils/asyncHandler.mjs";
import AppError from "../utils/Error.mjs";


const CreateUserService = function (options={}) {
    const {UserModel,getCache,tokenManager} = options;

    const updatePassword = n_asyncHandler(async (data,ctx) => {
        const {user_id,password} = data;

        const user = await UserModel.read({ id: user_id });
        if (!user) {
            throw AppError.known({
                message: "user not found!",
                event: "event.service.user.updatePassword",
                layer: "layer.service",
                status: 404,
                code:"NOT_FOUND"
            })
        }
        const hashPassword = await tokenManager.hashify(password).argon2();
        await UserModel.update(user_id, { password: hashPassword });
    })

    const read = n_asyncHandler(async (data,ctx) => {
        const {user_id,me=false} = data;

        const cached = await getCache("user").get(user_id, me, "user:read-by-id");
        if (cached) return cached;
        const user = await UserModel.read({ id: user_id });
        if (!user) throw AppError.known({
            message: "user not found!",
            event: "event.service.user.read",
            layer: "layer.service",
            status: 404,
            code:"NOT_FOUND"
        })
        const response = {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            ...(me && { email: user.email }),
            bio: user.bio,
            created_at: user.created_at,
            updated_at: user.updated_at
        }
        await getCache("user").set(response, user_id, me, "user:read-by-id");
        return response;
    })


    const update = n_asyncHandler(async (data,ctx) => {
        const {user_id,username,email,full_name,bio} = data;

        const payload = {
            ...(username !== undefined && { username }),
            ...(email !== undefined && { email }),
            ...(full_name !== undefined && { full_name }),
            ...(bio !== undefined && { bio })
        }
        const user = await UserModel.update(user_id, payload);
        if (!user) throw AppError.known({
            message: "user not found!",
            event: "event.user.update",
            layer: "layer.service",
            status: 404,
            code:"NOT_FOUND"
        })
        await getCache("user").bumpVersion();
    });

    const destroy = n_asyncHandler(async (data,ctx) => {
        const {user_id} = data;
        const user = await UserModel.destroy(user_id);
        if (!user) throw AppError.known({
            isknown: true,
            message: "user not found!",
            event: "user:destroy",
            layer: "service",
            status: 404
        })
        await getCache("user").bumpVersion();
    })

    return {
        destroy,
        update,
        updatePassword,
        read
    }
}
export default CreateUserService;
