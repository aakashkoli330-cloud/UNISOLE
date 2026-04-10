// ============================================================
// server/middleware/auth.js  — RE-EXPORT authMiddleware
// This file exists only for backward compatibility.
// All imports of auth.js now use the same unified middleware.
// ============================================================

module.exports = require("./authMiddleware");
