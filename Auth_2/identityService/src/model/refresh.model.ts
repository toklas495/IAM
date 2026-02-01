import type { RefreshOptionSchema } from "../type/refresh.type.js";
import type { ErrorSchema } from "../utils/error.js"
import type { Knex } from "knex";

interface Option {
    Error:ErrorSchema;
    db:Knex
}

const createRefreshModel = (opts:Option)=>{
    const create = async(refreshOption:RefreshOptionSchema):Promise<void>=>{
        await opts.db("refresh_tokens").insert(refreshOption);
    }
    return {
        create
    }
}

export type RefreshModelSchema = ReturnType<typeof createRefreshModel>;
export default createRefreshModel;