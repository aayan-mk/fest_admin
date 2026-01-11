const db = require('./db');

// Get number of events
function getEventCount(cb) {
  db.query('SELECT COUNT(*) AS count FROM events', (err, rows) => {
    if (err) return cb(err);
    cb(null, rows[0].count);
  });
}

// Get number of contingents per event
function getContingentCounts(cb) {
  db.query('SELECT event_id, COUNT(*) AS count FROM contingents GROUP BY event_id', (err, rows) => {
    if (err) return cb(err);
    cb(null, rows);
  });
}

// Get leaderboard (top 5 by total points from prsheet for a given sheet_name)
function getLeaderboard(sheetName, cb) {
  db.query('SELECT * FROM prsheet WHERE sheet_name=? ORDER BY total DESC LIMIT 5', [sheetName], (err, rows) => {
    if (err) return cb(err);
    cb(null, rows);
  });
}

// Get leaderboard (top 5 by total points from prsheet_utsav2026)
function getLeaderboardUtsav2026(cb) {
  db.query('SELECT * FROM prsheet_utsav2026 ORDER BY total DESC LIMIT 5', (err, rows) => {
    if (err) return cb(err);
    cb(null, rows);
  });
}

module.exports = {
  getEventCount,
  getContingentCounts,
  getLeaderboard,
  getLeaderboardUtsav2026
};
