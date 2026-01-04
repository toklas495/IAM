
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isExist = await knex.schema.hasTable("sessions");
  if (!isExist) {
    return knex.schema.createTable("sessions", (table) => {
      table.uuid("id").primary().defaultTo(knex.fn.uuid());
      table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
      table.uuid("account_id").notNullable().references("id").inTable("auth_accounts").onDelete("CASCADE");
      table.text("session_token").notNullable()
      table.text("refresh_token").notNullable()
      table.uuid("jwt_id").notNullable()
      table.string("expires_at").notNullable();
      table.boolean("revoked").defaultTo(false);
      table.timestamps(true, true);

      table.unique(["refresh_token", "session_token"]);
      table.index(["user_id", "refresh_token"]);
    })
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("sessions");
};
