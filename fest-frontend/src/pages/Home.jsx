import { useEffect, useState } from "react";
import TypingText from "../components/TypingText";
import LeaderboardCard from "../components/LeaderboardCard";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function Home() {
  const [eventCount, setEventCount] = useState(0);
  const [contingentCounts, setContingentCounts] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaderboardCarpe, setLeaderboardCarpe] = useState([]);
  const [leaderboardUtsav, setLeaderboardUtsav] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [eventCountRes, contingentCountsRes, eventsRes, leaderboardCarpeRes, leaderboardUtsavRes] = await Promise.all([
          axios.get(`${API}/api/shortcut/event-count`, { withCredentials: true }),
          axios.get(`${API}/api/shortcut/contingent-counts`, { withCredentials: true }),
          axios.get(`${API}/api/events`, { withCredentials: true }),
          axios.get(`${API}/api/shortcut/leaderboard/carpediem2026`, { withCredentials: true }),
          axios.get(`${API}/api/shortcut/leaderboard/prsheet_utsav2026`, { withCredentials: true })
        ]);
        setEventCount(eventCountRes.data.count);
        setContingentCounts(contingentCountsRes.data.counts);
        setEvents(eventsRes.data.events || []);
        setLeaderboardCarpe(leaderboardCarpeRes.data.leaderboard || []);
        setLeaderboardUtsav(leaderboardUtsavRes.data.leaderboard || []);
      } catch (e) {
        // Log error for debugging
        console.error('Error fetching dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Helper to check if all total scores are 0 or no data
  const isNoLeaderboardData = (lb) => !lb.length || lb.every(row => !row.total || row.total === 0);

  return (
    <div className="home-dashboard">
      <h2 className="typing-head">
        <TypingText text={["Welcome to Fest Admin Dashboard", "Manage Contingents, Events & PRs"]} loop={true} />
      </h2>
      <div className="dashboard-shortcuts">
        <div className="shortcut-card">
          <div className="shortcut-title">Total Events</div>
          <div className="shortcut-value">{eventCount}</div>
        </div>
        {events.map(ev => {
          const countObj = contingentCounts.find(c => c.event_id === ev.id) || { count: 0 };
          return (
            <div className="shortcut-card" key={ev.id}>
              <div className="shortcut-title">Contingents in {ev.name}</div>
              <div className="shortcut-value">{countObj.count}</div>
            </div>
          );
        })}
      </div>
      <div className="leaderboard-section">
        <h3 style={{marginTop:32, marginBottom:12}}>Carpe Diem 2026 Leaderboard (Top 5 by Total Points)</h3>
        <div className="leaderboard-list">
          <LeaderboardCard event={{ name: "Carpe Diem 2026" }} leaderboard={isNoLeaderboardData(leaderboardCarpe) ? [] : leaderboardCarpe} />
        </div>
        <h3 style={{marginTop:32, marginBottom:12}}>Utsav 2026 Leaderboard (Top 5 by Total Points)</h3>
        <div className="leaderboard-list">
          <LeaderboardCard event={{ name: "Utsav 2026" }} leaderboard={isNoLeaderboardData(leaderboardUtsav) ? [] : leaderboardUtsav} />
        </div>
      </div>
      {loading && <div className="dashboard-loading">Loading...</div>}
    </div>
  );
}
