import AppError, { normalizeError } from "../utils/Error.mjs";

const CreateUserModel = function (db) {
    const create = async (payload) => {
        try {
            const [user] = await db("users").insert(payload).returning("id");
            return user.id;
        } catch (error) {
            if (error.code === "23505") {
                throw AppError.known({
                    message: "",
                    event: "event.model.user.create",
                    status: 409,
                    layer:"layer.model"
                })
            }
            throw normalizeError(error,{layer:"layer.model",event:"event.model.user.create"});
        }
    }

    const createOrGet = async (payload) => {
        try {
            const { email } = payload;
            let user = await db("users").where({ email }).first();
            if (!user) {
                [user] = await db("users").insert(payload).returning("*");
            }
            return user
        } catch(error) {
            if (error.code === "23505") {
                throw AppError.known({
                    message: "already Exist!",
                    event: "event.model.user.createOrGet",
                    status: 409,
                    layer:"layer.model"
                })
            }
            throw normalizeError(error,{layer:"layer.model",event:"event.model.user.createOrGet"});
        }
    }

    const read = async (payload) => {
        return await db("users").where(payload).first();
    }

    const findByUserOrEmail = async(user_or_email)=>{
        return await db("users").where(builder=>{
            builder.where("username",user_or_email)
            .orWhere("email",user_or_email)
        }).first();
    }

    const destroy = async (userId) => {
        const [user] = await db("users").where({ id: userId }).del().returning("*");
        return user;
    }
    const update = async (userId, payload) => {
        const [user] = await db("users")
            .update(payload)
            .where({ id: userId })
            .returning("*");
        return user;
    }

    return {
        create,
        destroy,
        update,
        read,
        createOrGet,
        findByUserOrEmail
    }
}

export default CreateUserModel;