import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    const hasTable = await knex.schema.hasTable('sessions');
    if(!hasTable) {
        return knex.schema.createTable("sessions",table=>{
            table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
            table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
            table.string("session_token").notNullable().unique();
            table.string("jwt_id").notNullable().unique()
            table.string("ip_address").nullable();
            table.string("user_agent").nullable();
            table.string("device_info").nullable();
            table.string("device_id").nullable();
            table.boolean("revoked").defaultTo(false);
            table.timestamp("expires_at").notNullable();
            table.timestamps(true,true);

            table.index("user_id");
            table.index("session_token");
        })
    }
}


export async function down(knex: Knex): Promise<void> {
}

