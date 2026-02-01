import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    const hasTable = await knex.schema.hasTable('credentials');
    if (!hasTable) {
        return knex.schema.createTable('credentials', (table) => {
            table.uuid("id").primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid("user_id").references("id").inTable("users").notNullable().onDelete("CASCADE");
            table.string("password_hash").notNullable();
            table.timestamps(true,true);
            table.timestamp("last_used_at").nullable();

            table.index("user_id");
        });
    }
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('credentials');
}

