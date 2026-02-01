import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    const hasTable = await knex.schema.hasTable('oauth_clients');
    if(!hasTable) {
        return knex.schema.createTable("oauth_clients",table=>{
            table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
            table.string("client_id").notNullable().unique();
            table.string("client_secret").notNullable();
            table.jsonb("redirect_uris").notNullable();
            table.jsonb("scopes").notNullable();
            table.string("client_name").notNullable();
            table.string("client_type").notNullable();
            table.string("logo_uri").nullable();
            table.string("client_uri").nullable();
            table.boolean("is_active").notNullable().defaultTo(true);
            table.boolean("is_confidential").notNullable().defaultTo(true);
            table.timestamps(true,true);
        })
    }
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("oauth_clients");
}

