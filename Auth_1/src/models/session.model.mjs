import AppError, { normalizeError } from "../utils/Error.mjs";

const CreateSessionModel = function (db) {
    const insertToken = async ({
        user_id,
        session_token,
        refresh_token,
        jwt_id,
        expires_at,
        session_limit
    }) => {
        const trx = await db.transaction();
        try {
            const sessions = await trx("sessions")
                .select("id")
                .where({ user_id, revoked: false })
                .orderBy("created_at", "asc")
                .offset(session_limit - 1)
                .forUpdate();

            if (sessions.length > 0) {
                await trx("sessions")
                    .whereIn("id", sessions.map(session => session.id))
                    .update({ revoked: true });
            }

            await trx("sessions")
                .insert({
                    user_id,
                    session_token,
                    refresh_token,
                    jwt_id,
                    expires_at,
                    revoked: false
                });

            await trx.commit();
        } catch (error) {
            await trx.rollback();
            throw normalizeError(error,{layer:"layer.model",event:"event.models.auth.insert"});
        }
    }


    const readToken = async (where_payload) => {
        try {
            return await db("sessions").where(where_payload).first();
        } catch (error) {
            throw normalizeError(error,{layer:"layer.model",event:"event.auth.readToken"});
        }
    }

    const updateToken = async (where_payload, update_payload) => {
        try {
            const sessions = await db("sessions").where(where_payload).update(update_payload).returning("*");
            return sessions;
        } catch (error) {
            throw normalizeError(error,{layer:"layer.model",event:"event.auth.updateToken"});
        }
    }

    const refresh = async (hsid, hrid, n_hrid, njwt_id) => {
        const trx = await db.transaction();
        const now = new Date();
        try {
            const session = await trx("sessions")
                .where({
                    refresh_token: hrid,
                    revoked: false
                })
                .first()
                .forUpdate();

            if (!session || session.expires_at < now || session.session_token !== hsid) {
                throw AppError.known({
                    message: "Invalid refresh Token!",
                    event: "event.model.auth.refresh",
                    status: 401,
                    layer:"layer.model"
                })
            }

            await trx("sessions")
                .update(
                    {
                        revoked: false,
                        refresh_token: n_hrid,
                        jwt_id: njwt_id
                    }
                )
                .where({ id: session.id })

            await trx.commit();
            return {
                user_id: session.user_id,
                account_id:session.account_id
            }
        } catch (error) {
            throw normalizeError(error,{layer:"layer.model",event:"event.model.auth.refresh"})
        }
    }

    return {
        refresh,
        insertToken,
        updateToken,
        readToken
    }
}



export default CreateSessionModel;
