import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    const hasTable = await knex.schema.hasTable('accounts');
    if (!hasTable) {
        await knex.schema.createTable('accounts', (table) => {
            table.string('id').primary().defaultTo(knex.raw("gen_random_uuid()"))
            table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
            table.string('provider').notNullable();
            table.string('provider_user_id').notNullable();
            table.string("provider_email").nullable();
            table.string('refresh_token').nullable();
            table.bigInteger('expires_at').nullable();
            table.string('scope').nullable();
            table.string("is_active").defaultTo(true);
            table.timestamps(true, true);
            table.unique(['provider', 'provider_user_id']);

            table.index(["provider","provider_user_id","user_id"]);
        });
    }
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("accounts");
}

