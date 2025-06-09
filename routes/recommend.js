const express = require("express");
const router = express.Router();
const pool = require("../db");
const { OpenAI } = require("openai");

const openai = new OpenAI();

/**
 * POST /api/recommend
 *   Body: { query: string } or { paperId: number }
 *   Returns top 3 similar papers based on cosine_distance in SQL.
 */
router.post("/", async (req, res) => {
  const { query, paperId } = req.body;

  try {
    let embedding;

    if (query && typeof query === "string") {
      // Generate an embedding for the query
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: [query.replace(/\n/g, " ")],
      });
      embedding = response.data[0].embedding;
    } else if (paperId && Number.isInteger(paperId)) {
      // Fetch the stored embedding for a given paper ID
      const paperRes = await pool.query(
        `SELECT embedding FROM papers WHERE id = $1`,
        [paperId]
      );
      if (paperRes.rows.length === 0) {
        return res.status(404).json({ error: "Paper not found" });
      }
      embedding = paperRes.rows[0].embedding;
    } else {
      return res
        .status(400)
        .json({ error: "Request body must contain either 'query' or 'paperId'." });
    }

    // Build the vector literal
    const embLiteral = "[" + embedding.map((v) => v.toFixed(6)).join(",") + "]";
    const embSql = `'${embLiteral}'::vector`;

    // Now use ($1 IS NULL OR id <> $1) so that passing NULL returns *all* rows
    const sql = `
      SELECT
        id,
        title,
        pdf_path,
        (1 - cosine_distance(embedding, ${embSql})) AS similarity
      FROM papers
      WHERE ($1::int IS NULL OR id <> $1::int)
      ORDER BY cosine_distance(embedding, ${embSql})
      LIMIT 4;
    `;

    // If paperId is undefined, pass null -> all rows will match
    const excludeId = paperId || null;
    const result = await pool.query(sql, [excludeId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error in /api/recommend:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
