exports.up = async (knex) => {
  const exists = await knex.schema.hasTable("users");
  if (!exists) {

    await knex.schema.createTable("users", (table) => {
      table.uuid("id").primary().defaultTo(knex.fn.uuid());

      table.string("username").notNullable().unique();
      table.string("full_name").nullable()
      table.string("email").nullable().unique();
      table.text("bio").nullable();
      table.timestamps(true, true);
      table.index("username");
      table.index("email");
    });
  }
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("users");
};
