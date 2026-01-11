import React from "react";

export default function LeaderboardCard({ event, leaderboard }) {
  const isNoData = !leaderboard.length || leaderboard.every(row => !row.total || row.total === 0);
  return (
    <div className="leaderboard-card">
      <h4>{event.name} Leaderboard</h4>
      <ol>
        {isNoData && <li>No data</li>}
        {!isNoData && leaderboard.map((c, i) => (
          <li key={c.id || i}>
            <span>
              {c.contingent || c.cl_name || c.cc_code || c.college_name}
            </span>
            {typeof c.total !== 'undefined' && <span style={{ float: 'right', fontWeight: 600 }}>{c.total}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
