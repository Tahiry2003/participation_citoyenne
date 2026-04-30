const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "entretien",
  password: "arson",
  port: 5432,
});

module.exports = pool;
