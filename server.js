// server.js
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const papersRouter = require("./routes/papers");
const recommendRouter = require("./routes/recommend");
const summarizeRouter = require("./routes/summarize");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON request bodies

// Routes
app.use("/api/papers", papersRouter);
app.use("/api/recommend", recommendRouter);
app.use("/api/summarize", summarizeRouter);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
