import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import { logActivityToBackend } from "../utils/logBackend";

const columns = [
  "Sr. No", "College Name", "Contingent Name", "CL meet points", "Online PR activity 1 points (x1000)", "Online PR activity 2 points (x1000)", "Online PR activity 3 points (x1000)", "Tech Participations points (x100)", "Tech winning points (x1000)", "Sports Participation points (x100)", "Sports winning points (x1000)", "Culturals participation points (x100)", "Culturals winning points (x1000)", "Theatre participation points (x100)", "Theatre winning points (x1000)", "Re-creational participation points (x100)", "RC Winning (x1000)", "Flagship winners (x5000)", "Online PR points (x1000)", "On day PR points (x1000)", "Sponsor PR points (x1000)", "Extra PR points (x1000)", "Negative Points", "TOTAL POINTS"
];

const fieldMap = [
  "id", "college", "contingent", "clMeet", "online1", "online2", "online3", "techPart", "techWin", "sportsPart", "sportsWin", "cultPart", "cultWin", "theatrePart", "theatreWin", "rcPart", "rcWin", "flagship", "onlinePR", "onDayPR", "sponsorPR", "extra", "negative", "total"
];

export default function Utsav2026Sheet() {
  const [data, setData] = useState([]);
  const [lastSavedData, setLastSavedData] = useState([]);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("asc");
  const [editMode, setEditMode] = useState(false);
  const [warnings, setWarnings] = useState({});
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API}/api/prsheet_utsav2026?sortBy=${sortBy}&order=${order}`)
      .then(res => {
        setData(res.data.prsheet_utsav2026);
        setLastSavedData(res.data.prsheet_utsav2026);
      })
      .catch(() => {
        setData([]);
        setLastSavedData([]);
      });
  }, [sortBy, order, API]);

  // Helper to clamp a value to a max and warn if exceeded
  const clampWithWarn = (rowIdx, key, val, max) => {
    const num = Number(val) || 0;
    if (num > max) {
      setWarnings(prev => ({ ...prev, [`${rowIdx}-${key}`]: `Max ${max}` }));
      return max;
    } else {
      setWarnings(prev => {
        const copy = { ...prev };
        delete copy[`${rowIdx}-${key}`];
        return copy;
      });
      return num;
    }
  };

  // Calculate total as per the new formula
  const calculateTotal = (row, rowIdx) => {
    return (
      Number(row.clMeet) +
      clampWithWarn(rowIdx, 'online1', row.online1, 1000) +
      clampWithWarn(rowIdx, 'online2', row.online2, 1000) +
      clampWithWarn(rowIdx, 'online3', row.online3, 1000) +
      (Number(row.techPart) * 100) +
      (Number(row.techWin) * 1000) +
      (Number(row.sportsPart) * 100) +
      (Number(row.sportsWin) * 1000) +
      (Number(row.cultPart) * 100) +
      (Number(row.cultWin) * 1000) +
      (Number(row.theatrePart) * 100) +
      (Number(row.theatreWin) * 1000) +
      (Number(row.rcPart) * 100) +
      (Number(row.rcWin) * 1000) +
      (Number(row.flagship) * 5000) +
      clampWithWarn(rowIdx, 'onlinePR', row.onlinePR, 1000) +
      clampWithWarn(rowIdx, 'onDayPR', row.onDayPR, 1000) +
      clampWithWarn(rowIdx, 'sponsorPR', row.sponsorPR, 1000) +
      clampWithWarn(rowIdx, 'extra', row.extra, 1000) -
      (Number(row.negative) || 0)
    );
  };

  const handleChange = (rowIdx, key, value) => {
    setData(prev => prev.map((row, idx) => {
      if (idx !== rowIdx) return row;
      const updated = { ...row, [key]: value };
      updated.total = calculateTotal(updated, rowIdx);
      return updated;
    }));
  };

  const handleSave = async () => {
    // recalculate all totals before saving
    const updatedData = data.map((row, idx) => ({ ...row, total: calculateTotal(row, idx) }));
    setData(updatedData);
    for (const row of updatedData) {
      await axios.put(`${API}/api/prsheet_utsav2026/${row.id}`, row);
    }
    // Find changes
    let changes = [];
    updatedData.forEach((row, idx) => {
      const prev = lastSavedData[idx] || {};
      fieldMap.forEach(field => {
        if (row[field] !== prev[field]) {
          changes.push(`${columns[fieldMap.indexOf(field)]}: '${prev[field] ?? ''}' → '${row[field]}' (Row ${row.id})`);
        }
      });
    });
    if (changes.length > 0) {
      await logActivityToBackend(`updated Utsav PR sheet: ${changes.join('; ')}`);
    } else {
      await logActivityToBackend("updated Utsav PR sheet (no visible changes)");
    }
    setLastSavedData(updatedData);
    setEditMode(false);
  };

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === "asc" ? "desc" : "asc");
    else { setSortBy(field); setOrder("asc"); }
  };

  return (
    <div className="pr-sheet-container">
      <h2>Utsav 2026 PR SHEET</h2>
      <button onClick={() => editMode ? handleSave() : setEditMode(true)} style={{marginBottom:12}}>
        {editMode ? "Save" : "Edit"}
      </button>
      <div className="pr-sheet-table-wrapper" style={{overflowX:'auto'}}>
        <table className="pr-sheet-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={col} style={{whiteSpace:'nowrap'}}>
                  <span style={{cursor:'pointer'}} onClick={() => handleSort(fieldMap[idx])}>{col}</span>
                  {sortBy === fieldMap[idx] && (order === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={row.id}>
                {fieldMap.map((field, colIdx) => (
                  <td key={field} style={{verticalAlign:'top'}}>
                    {field === "id" || field === "college" || field === "contingent" ? (
                      field === "id" ? row.id :
                      <input
                        value={row[field]}
                        onChange={e => handleChange(rowIdx, field, e.target.value)}
                        disabled={!editMode}
                      />
                    ) : (
                      <>
                        <input
                          type="number"
                          value={row[field]}
                          onChange={e => handleChange(rowIdx, field, Number(e.target.value))}
                          disabled={!editMode}
                        />
                        {editMode && warnings[`${rowIdx}-${field}`] && (
                          <div style={{color:'#e11d48',fontSize:12}}>{warnings[`${rowIdx}-${field}`]}</div>
                        )}
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
