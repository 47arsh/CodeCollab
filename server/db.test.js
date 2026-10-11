const test = require("node:test");
const assert = require("node:assert/strict");
const pool = require("./db.js");

test("PostgreSQL connection check", async (t) => {
  if (!process.env.DATABASE_URL) {
    t.skip("DATABASE_URL is not configured in environment");
    return;
  }

  const result = await pool.query("SELECT 1 AS connected");
  assert.equal(result.rows[0].connected, 1);
});

test.after(async () => {
  await pool.end();
});
