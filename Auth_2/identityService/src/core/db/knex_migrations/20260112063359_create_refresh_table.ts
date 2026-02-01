import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    const hasTable = await knex.schema.hasTable('refresh_tokens');
    if(!hasTable) {
        return knex.schema.createTable("refresh_tokens",table=>{
            table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
            table.uuid("session_id").notNullable().references("id").inTable("sessions").onDelete("CASCADE");
            table.string("token").notNullable().unique();
            table.timestamp('expires_at').notNullable();
            table.boolean('revoked').notNullable().defaultTo(false);
            table.timestamp('revoked_at').nullable();
            table.integer('rotations').notNullable().defaultTo(0);
            table.timestamps(true,true);

            table.index("session_id");
            table.index("token");
        })
    }
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("refresh_tokens");
}

