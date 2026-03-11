const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Papa = require("papaparse");
const path = require("path");
const fs = require("fs");

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ── Serve React build in production ──────────────────────────────────────────
const clientBuild = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
}

// ── POST /api/upload — parse CSV and return summary ──────────────────────────
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const csvText = req.file.buffer.toString("utf8");
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true, dynamicTyping: true });

    if (parsed.errors.length && parsed.data.length === 0) {
      return res.status(400).json({ error: "Could not parse CSV file" });
    }

    const rows = parsed.data;
    const columns = parsed.meta.fields || [];
    const rowCount = rows.length;

    // Build a concise summary for the LLM (first 60 rows to avoid token bloat)
    const sampleRows = rows.slice(0, 60);
    const csvSample = Papa.unparse(sampleRows);

    // Basic column type detection
    const columnTypes = {};
    columns.forEach(col => {
      const vals = rows.slice(0, 20).map(r => r[col]).filter(v => v !== null && v !== undefined && v !== "");
      const numericCount = vals.filter(v => typeof v === "number" || !isNaN(Number(v))).length;
      columnTypes[col] = numericCount > vals.length * 0.7 ? "numeric" : "categorical";
    });

    // Compute quick stats for numeric columns
    const stats = {};
    columns.filter(c => columnTypes[c] === "numeric").forEach(col => {
      const vals = rows.map(r => Number(r[col])).filter(v => !isNaN(v));
      if (vals.length) {
        stats[col] = {
          min: Math.min(...vals).toFixed(2),
          max: Math.max(...vals).toFixed(2),
          sum: vals.reduce((a, b) => a + b, 0).toFixed(2),
          avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
        };
      }
    });

    // Unique values for categorical columns (top 10)
    const categoricals = {};
    columns.filter(c => columnTypes[c] === "categorical").forEach(col => {
      const unique = [...new Set(rows.map(r => r[col]))].filter(Boolean).slice(0, 10);
      categoricals[col] = unique;
    });

    res.json({
      columns,
      columnTypes,
      rowCount,
      stats,
      categoricals,
      csvSample,
      fileName: req.file.originalname,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/query — ask LLM a question about the data ──────────────────────
app.post("/api/query", async (req, res) => {
  const { question, dataContext, history = [], apiKey } = req.body;
  if (!question || !dataContext) return res.status(400).json({ error: "Missing question or data context" });
  if (!apiKey) return res.status(400).json({ error: "Missing API key" });

  const systemPrompt = `You are Rabbitt, a sharp AI business analyst. The user has uploaded a CSV dataset. Here is the dataset context:

File: ${dataContext.fileName}
Rows: ${dataContext.rowCount}
Columns: ${dataContext.columns.join(", ")}

Column types: ${JSON.stringify(dataContext.columnTypes)}
Categorical values: ${JSON.stringify(dataContext.categoricals)}
Numeric stats: ${JSON.stringify(dataContext.stats)}

CSV sample (up to 60 rows):
${dataContext.csvSample}

Instructions:
1. Answer the user's question directly using the actual data above. Be specific with numbers.
2. Always include a "💡 Insight:" section with 1-2 sentences of business interpretation.
3. Always include a "📊 Supporting Data:" line.
4. At the end, output a JSON block for chart generation in this exact format (no markdown fences, just the JSON after the text):
CHART_JSON:{"type":"bar|line|none","title":"Chart Title","labels":["A","B","C"],"values":[1,2,3],"color":"#00e5a0"}

Use "none" for chart type if no visualization makes sense. For line charts, labels should be time-based.
Keep the response concise — max 4 short paragraphs plus the CHART_JSON line.`;

  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: question },
  ];

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3-latest",
        max_tokens: 800,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const fullText = data.choices?.[0]?.message?.content || "Sorry, could not process that.";

    // Parse out CHART_JSON
    let chartData = null;
    let answerText = fullText;
    const chartMatch = fullText.match(/CHART_JSON:(\{.*\})/s);
    if (chartMatch) {
      try {
        chartData = JSON.parse(chartMatch[1]);
        answerText = fullText.replace(/CHART_JSON:(\{.*\})/s, "").trim();
      } catch (_) { /* ignore parse errors */ }
    }

    res.json({ answer: answerText, chart: chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Fallback to React app ─────────────────────────────────────────────────────
app.get("*", (req, res) => {
  const indexPath = path.join(clientBuild, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send("API server running. Frontend not built yet.");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🐇 Talking Rabbitt server running on port ${PORT}`));
