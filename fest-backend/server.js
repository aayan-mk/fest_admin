const express = require("express");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const db = require("./db");
const cors = require("cors");
require('dotenv').config();
const app = express();
const leaderboard = require('./leaderboard');

/* =====================================================
   CORS (use cors package to handle preflight and headers)
   ===================================================== */

app.use(
  cors({ origin: process.env.CORS_ORIGIN, credentials: true })
);

// Fallback: always set CORS headers (robustness for preflight failures)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

/* =====================================================
   BODY PARSER
   ===================================================== */

app.use(express.json());

/* =====================================================
   REGISTER (EMAIL + PASSWORD + INVITE CODE)
   ===================================================== */

app.post("/api/auth/register", (req, res) => {
  const { email, password, code } = req.body;

  if (!email || !password || !code) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  db.query(
    "SELECT id FROM registration_codes WHERE code=? AND is_used=0",
    [code],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (!rows.length) {
        return res.status(401).json({ error: "Invalid registration code" });
      }

      db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        err => {
          if (err) {
            return res.status(409).json({ error: "User already exists" });
          }

          db.query(
            "UPDATE registration_codes SET is_used=1 WHERE code=?",
            [code]
          );

          res.json({ success: true });
        }
      );
    }
  );
});

/* =====================================================
   LOGIN (PASSWORD FIRST)
   ===================================================== */

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  db.query(
    "SELECT password, is_2fa_enabled FROM users WHERE email=?",
    [email],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (!rows.length) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (rows[0].password !== hashedPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Password OK → decide next step
      if (rows[0].is_2fa_enabled) {
        return res.json({ next: "otp" });
      }

      res.json({ next: "setup" });
    }
  );
});

/* =====================================================
   SETUP GOOGLE AUTHENTICATOR
   ===================================================== */

app.post("/api/auth/setup", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  const secret = speakeasy.generateSecret({
    length: 20,
    name: `FestAdmin (${email})`,
  });

  db.query(
    "UPDATE users SET totp_secret=? WHERE email=?",
    [secret.base32, email],
    async err => {
      if (err) return res.status(500).json({ error: "Database error" });

      const qr = await QRCode.toDataURL(secret.otpauth_url);
      res.json({ qr });
    }
  );
});

/* =====================================================
   VERIFY OTP (SECOND FACTOR)
   ===================================================== */

app.post("/api/auth/verify", (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.query(
    "SELECT totp_secret FROM users WHERE email=?",
    [email],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (!rows.length) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const verified = speakeasy.totp.verify({
        secret: rows[0].totp_secret,
        encoding: "base32",
        token,
        window: 1,
      });

      if (!verified) {
        return res.status(401).json({ error: "Invalid OTP" });
      }

      db.query(
        "UPDATE users SET is_2fa_enabled=1 WHERE email=?",
        [email]
      );

      res.json({ success: true });
    }
  );
});

/* =====================================================
   CHANGE PASSWORD
   ===================================================== */
app.post('/api/auth/change-password', (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const oldHash = crypto.createHash('sha256').update(oldPassword).digest('hex');
  const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
  db.query('SELECT password FROM users WHERE email=?', [email], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    if (rows[0].password !== oldHash) {
      return res.status(401).json({ error: 'Old password is incorrect' });
    }
    db.query('UPDATE users SET password=? WHERE email=?', [newHash, email], err2 => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    });
  });
});

/* =====================================================
   EVENTS (CREATE / LIST / UPDATE / DELETE / REORDER)
   ===================================================== */

// List events
app.get("/api/events", (req, res) => {
  db.query(
    "SELECT id, name, description, sort_order FROM events ORDER BY sort_order ASC",
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      // For compatibility: send both array and {events: array}
      res.json({ events: rows });
      // res.json(rows); // old
    }
  );
});

// Create event
app.post("/api/events", (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Missing name" });

  // compute next sort order
  db.query("SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM events", (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    const next = rows[0].next || 1;

    db.query(
      "INSERT INTO events (name, description, sort_order) VALUES (?, ?, ?)",
      [name, description || null, next],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ id: result.insertId });
      }
    );
  });
});

// Update event
app.put("/api/events/:id", (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Missing name" });

  db.query(
    "UPDATE events SET name=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
    [name, description || null, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ success: true });
    }
  );
});

// Delete event
app.delete("/api/events/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM events WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ success: true });
  });
});

// Move event up/down (reorder)
app.put("/api/events/:id/move", (req, res) => {
  const { id } = req.params;
  const { direction } = req.body; // 'up' or 'down'

  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: 'Invalid direction' });
  }

  // find current
  db.query("SELECT id, sort_order FROM events WHERE id=?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const currentOrder = rows[0].sort_order;
    const comparator = direction === 'up' ? '<' : '>';
    const orderBy = direction === 'up' ? 'DESC' : 'ASC';

    db.query(
      `SELECT id, sort_order FROM events WHERE sort_order ${comparator} ? ORDER BY sort_order ${orderBy} LIMIT 1`,
      [currentOrder],
      (err, neighborRows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!neighborRows.length) return res.json({ success: true }); // nothing to swap

        const neighbor = neighborRows[0];

        // swap sort_order
        db.query("UPDATE events SET sort_order=? WHERE id=?", [neighbor.sort_order, id], (err) => {
          if (err) return res.status(500).json({ error: 'Database error' });

          db.query("UPDATE events SET sort_order=? WHERE id=?", [currentOrder, neighbor.id], (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ success: true });
          });
        });
      }
    );
  });
});

/* =====================================================
   CONTINGENTS (CREATE / LIST)
   ===================================================== */

// List contingents
app.get("/api/contingents", (req, res) => {
  db.query(
    `SELECT * FROM contingents`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ contingents: rows });
    }
  );
});

// Create contingent
app.post("/api/contingents", (req, res) => {
  const {
    cc_code, college_name, cl_name, cl_contact,
    acl1_name, acl1_contact,
    acl2_name, acl2_contact, event_id
  } = req.body;
  // Only require cc_code, cl_name, event_id
  if (!cc_code || !cl_name || !event_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  db.query(
    `INSERT INTO contingents (cc_code, college_name, cl_name, cl_contact, acl1_name, acl1_contact, acl2_name, acl2_contact, event_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cc_code,
      college_name || '',
      cl_name,
      cl_contact || '',
      acl1_name || '',
      acl1_contact || '',
      acl2_name || null,
      acl2_contact || null,
      event_id
    ],
    (err, result) => {
      if (err) {
        console.error('Contingent insert error:', err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ id: result.insertId });
    }
  );
});

// Delete contingent
app.delete("/api/contingents/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM contingents WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ success: true });
  });
});

/* =====================================================
   SHORTCUTS (EVENT/CONTINGENT COUNTS, LEADERBOARD)
   ===================================================== */

// Shortcut: number of events
app.get('/api/shortcut/event-count', (req, res) => {
  leaderboard.getEventCount((err, count) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ count });
  });
});
// Shortcut: number of contingents per event
app.get('/api/shortcut/contingent-counts', (req, res) => {
  leaderboard.getContingentCounts((err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ counts: rows });
  });
});
// Shortcut: leaderboard for Utsav 2026 PR sheet (top 5 by total points)
app.get('/api/shortcut/leaderboard/prsheet_utsav2026', (req, res) => {
  leaderboard.getLeaderboardUtsav2026((err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ leaderboard: rows });
  });
});
// Shortcut: leaderboard for a PR sheet (top 5 by total points)
app.get('/api/shortcut/leaderboard/:sheet', (req, res) => {
  leaderboard.getLeaderboard(req.params.sheet, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ leaderboard: rows });
  });
});

/* =====================================================
   PR SHEET (Multiple Sheets Support)
   ===================================================== */

// List PR sheet rows (with optional sort and sheet_name)
app.get('/api/prsheet', (req, res) => {
  const { sortBy = 'id', order = 'asc', sheet = 'carpediem2026' } = req.query;
  const allowed = [
    'id','dept','contingent','base','purchase','balance','sportsPart','sportsWin','cultPart','cultWin','under25','prom','mela','hfpPart','hfpWin','iconPart','iconWin','warCL','talentPart','talentWin','kaiPoChe','online1','online2','online3','prWeek','onlinePR','onDayEnergy','prRally','floor','onDayPR','extra','negative','total'
  ];
  if (!allowed.includes(sortBy)) return res.status(400).json({ error: 'Invalid sort column' });
  const dir = order === 'desc' ? 'DESC' : 'ASC';
  db.query(`SELECT * FROM prsheet WHERE sheet_name=? ORDER BY ${sortBy} ${dir}`,[sheet],(err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ prsheet: rows });
  });
});

// Update PR sheet row
app.put('/api/prsheet/:id', (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const allowed = [
    'dept','contingent','base','purchase','balance','sportsPart','sportsWin','cultPart','cultWin','under25','prom','mela','hfpPart','hfpWin','iconPart','iconWin','warCL','talentPart','talentWin','kaiPoChe','online1','online2','online3','prWeek','onlinePR','onDayEnergy','prRally','floor','onDayPR','extra','negative','total'
  ];
  const updates = Object.keys(fields).filter(k => allowed.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' });
  const sql = `UPDATE prsheet SET ${updates.map(f => `${f}=?`).join(', ')} WHERE id=?`;
  const values = updates.map(f => fields[f]);
  values.push(id);
  db.query(sql, values, err => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

/* =====================================================
   UTSAV 2026 PR SHEET (Separate Table)
   ===================================================== */

// List Utsav PR sheet rows (with optional sort)
app.get('/api/prsheet_utsav2026', (req, res) => {
  const { sortBy = 'id', order = 'asc' } = req.query;
  const allowed = [
    'id','college','contingent','clMeet','online1','online2','online3','techPart','techWin','sportsPart','sportsWin','cultPart','cultWin','theatrePart','theatreWin','rcPart','rcWin','flagship','onlinePR','onDayPR','sponsorPR','extra','negative','total'
  ];
  if (!allowed.includes(sortBy)) return res.status(400).json({ error: 'Invalid sort column' });
  const dir = order === 'desc' ? 'DESC' : 'ASC';
  db.query(`SELECT * FROM prsheet_utsav2026 ORDER BY ${sortBy} ${dir}`,(err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ prsheet_utsav2026: rows });
  });
});

// Update Utsav PR sheet row
app.put('/api/prsheet_utsav2026/:id', (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const allowed = [
    'college','contingent','clMeet','online1','online2','online3','techPart','techWin','sportsPart','sportsWin','cultPart','cultWin','theatrePart','theatreWin','rcPart','rcWin','flagship','onlinePR','onDayPR','sponsorPR','extra','negative','total'
  ];
  const updates = Object.keys(fields).filter(k => allowed.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' });
  const sql = `UPDATE prsheet_utsav2026 SET ${updates.map(f => `${f}=?`).join(', ')} WHERE id=?`;
  const values = updates.map(f => fields[f]);
  values.push(id);
  db.query(sql, values, err => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

/* =====================================================
   ACTIVITY LOG API
   ===================================================== */

app.post("/api/activity-log", (req, res) => {
  const { email, action } = req.body;
  if (!email || !action) return res.status(400).json({ error: "Missing fields" });
  db.query(
    "INSERT INTO activity_logs (email, action) VALUES (?, ?)",
    [email, action],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ success: true, id: result.insertId });
    }
  );
});

app.get("/api/activity-log", (req, res) => {
  db.query(
    "SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100",
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ logs: rows });
    }
  );
});

/* =====================================================
   SERVER START
   ===================================================== */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
