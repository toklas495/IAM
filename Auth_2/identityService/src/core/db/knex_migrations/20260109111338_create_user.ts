import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    const isExist = await knex.schema.hasTable("users");
    if(!isExist){
        return knex.schema.createTable("users",table=>{
            table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
            table.string("username").notNullable().unique();
            table.string("full_name");
            table.string("email").nullable().unique();
            table.boolean("email_verified").defaultTo(false);
            table.string("bio").nullable()
            table.string("avatar").nullable();
            table.boolean("is_active").defaultTo(true);
            table.timestamps(true,true);
        
            table.index(["username","is_active"]);
            table.index("email");
        })
    }
}


export async function down(knex: Knex): Promise<void> {
    const isExist = await knex.schema.hasTable("users");
    if(isExist){
        return knex.schema.dropTable("users");
    }
}

