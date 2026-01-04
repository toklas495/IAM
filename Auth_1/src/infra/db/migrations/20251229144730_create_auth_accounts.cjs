exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("auth_accounts");
  if (!exists) {

    return knex.schema.createTable("auth_accounts", (table) => {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("gen_random_uuid()"));

      table
        .uuid("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");

      table
        .enum("provider", ["password", "google", "github", "linkedin"])
        .notNullable();

      table.string("provider_user_id").notNullable();

      table.string("provider_email").nullable();
      table.boolean("provider_email_verified").defaultTo(false);

      table.text("password_hash").nullable();

      table.timestamp("last_login_at").nullable();
      table.timestamps(true, true);

      table.unique(["provider", "provider_user_id"]);
      table.index("user_id");
    });
  }
};

exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("auth_accounts");
};
