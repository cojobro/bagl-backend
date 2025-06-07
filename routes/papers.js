const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/papers
// Return a list of all papers (id, title, authors, year, tags, pdf_path).
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, pdf_path FROM papers ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching papers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/papers/:id
// Return full metadata for a single paper, including full_text.
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, title, full_text, pdf_path, created_at
       FROM papers
       WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paper not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching paper id=${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
