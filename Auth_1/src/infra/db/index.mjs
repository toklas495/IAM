import knex from "knex";
import knexConfig from "../../../knexfile.mjs";
import { normalizeError } from "../../utils/Error.mjs";


const db = knex(knexConfig.development);
// verify connection
(async()=>{
    try{
        await db.raw("SELECT 1+1 AS result");
        console.log(`DATABASE CONNECTED ($env "dev")`);
    }catch(error){
        console.error("x Database connection failed: ",error.message);
        throw normalizeError(error,{layer:"layer.infra",event:"event.db.check"});
    }
})()

export async function closeDb(){
    console.log("Closing database connection...");
    await db.destroy();
    console.log(" DATABASE connection closed.");
};

export default db;