// Disable TLS certificate validation globally (for this client):
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,   // allow self‐signed certs
    },
});

pool.on("error", (err) => {
    console.error("Unexpected Postgres idle client error", err);
    process.exit(-1);
});

module.exports = pool;
