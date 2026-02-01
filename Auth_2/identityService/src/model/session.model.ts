import type { Knex } from "knex";
import type { ErrorSchema } from "../utils/error.js"
import type { sessionOptionsDto, SessionSchema } from "../type/session.type.js";



interface OptionSchema{
    Error:ErrorSchema;
    db:Knex
}

const createSessionModel = (opts:OptionSchema,session_limit:number=5)=>{
    const create = async(sessionOption:sessionOptionsDto)=>{
        const trx = await opts.db.transaction();
        const now = new Date();
        try{
            const sessions = await trx("sessions").where({
                user_id:sessionOption.user_id,
                revoked:false
            }).andWhere("expires_at",">",now)
            .orderBy("created_at","asc")
            .offset(session_limit)
            .forUpdate();

            if(sessions&&sessions.length>0){
                const sessionIds = sessions.map(s=>s.id);
                await trx("sessions").whereIn("id",sessionIds).update({revoked:true});
            }

            const [n_session] = await trx("sessions").insert(sessionOption).returning("*");
            await trx.commit();
            return n_session  as SessionSchema;
        }catch(error){
            await trx.rollback();
            throw error;
        }
    }
    return {
        create
    }
}

export type SessionModelSchema = ReturnType<typeof createSessionModel>;
export default createSessionModel;