import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import { logActivityToBackend } from "../utils/logBackend";

const columns = [
  "Sr. no", "Department Name", "Contingent Name", "Base Points", "Purchase Points", "Balance Points",
  "Sports Participation Points (x100)", "Sports Winning Points (x1000)", "Cultural Participation Points (x100)", "Cultural Winning Points (x1000)",
  "Under 25 registrations (x20)", "Prom Tickets (x50)", "Mela Stall Points (x100)", "48 HFP participation (x1000)", "48 HFP winning (x7000)",
  "Carpe Diem's got Icon participation (x1000)", "CDGI Winners (x7000)", "War of CL winners (x5000)", "Carpe Diem's got talent participation (x1000)",
  "CDGT Winner (x5000)", "Kai Po che winners", "Online PR activity 1 winners", "Online PR activity 2 winners", "Online PR activity 3 winners",
  "PR week points (x1000)", "Online PR points (x1000)", "On day energy points (x1000)", "PR rally points (x1000)", "Floor decoration points (x1000)",
  "On day PR points", "Extra points", "Negative points", "Total"
];

const fieldMap = [
  "id", "dept", "contingent", "base", "purchase", "balance",
  "sportsPart", "sportsWin", "cultPart", "cultWin",
  "under25", "prom", "mela", "hfpPart", "hfpWin",
  "iconPart", "iconWin", "warCL", "talentPart",
  "talentWin", "kaiPoChe", "online1", "online2", "online3",
  "prWeek", "onlinePR", "onDayEnergy", "prRally", "floor",
  "onDayPR", "extra", "negative", "total"
];

export default function Carpediem3_0Sheet() {
  const [data, setData] = useState([]);
  const [lastSavedData, setLastSavedData] = useState([]);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("asc");
  const [editMode, setEditMode] = useState(false);
  const [warnings, setWarnings] = useState({});
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API}/api/prsheet?sortBy=${sortBy}&order=${order}&sheet=carpediem2026`)
      .then(res => {
        setData(res.data.prsheet);
        setLastSavedData(res.data.prsheet);
      })
      .catch(() => {
        setData([]);
        setLastSavedData([]);
      });
  }, [sortBy, order, API]);

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

  const calculateTotal = (row, rowIdx) => {
    return (
      Number(row.balance) +
      (Number(row.sportsPart) * 100) +
      (Number(row.sportsWin) * 1000) +
      (Number(row.cultPart) * 100) +
      (Number(row.cultWin) * 1000) +
      (Number(row.under25) * 20) +
      (Number(row.prom) * 50) +
      (Number(row.mela) * 100) +
      (Number(row.hfpPart) * 1000) +
      (Number(row.hfpWin) * 7000) +
      (Number(row.iconPart) * 1000) +
      (Number(row.iconWin) * 7000) +
      (Number(row.warCL) * 5000) +
      (Number(row.talentPart) * 1000) +
      (Number(row.talentWin) * 5000) +
      (Number(row.kaiPoChe) || 0) +
      (Number(row.online1) || 0) +
      (Number(row.online2) || 0) +
      (Number(row.online3) || 0) +
      clampWithWarn(rowIdx, 'prWeek', row.prWeek, 1000) +
      clampWithWarn(rowIdx, 'onlinePR', row.onlinePR, 1000) +
      clampWithWarn(rowIdx, 'onDayEnergy', row.onDayEnergy, 1000) +
      clampWithWarn(rowIdx, 'prRally', row.prRally, 1000) +
      clampWithWarn(rowIdx, 'floor', row.floor, 1000) +
      (Number(row.onDayPR) || 0) +
      (Number(row.extra) || 0) -
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
    const updatedData = data.map((row, idx) => ({ ...row, total: calculateTotal(row, idx) }));
    setData(updatedData);
    for (const row of updatedData) {
      await axios.put(`${API}/api/prsheet/${row.id}`, row);
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
      await logActivityToBackend(`updated Carpe Diem PR sheet: ${changes.join('; ')}`);
    } else {
      await logActivityToBackend("updated Carpe Diem PR sheet (no visible changes)");
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
      <h2>Carpe Diem 2026 PR SHEET</h2>
      <button onClick={() => editMode ? handleSave() : setEditMode(true)} style={{marginBottom:12}}>
        {editMode ? "Save" : "Edit"}
      </button>
      <div className="pr-sheet-table-wrapper" style={{overflowX:'auto'}}>
        <table className="pr-sheet-table" style={{minWidth:'2200px', fontSize:'1.08rem', borderCollapse:'separate', borderSpacing:'0 2px'}}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={col} style={{whiteSpace:'nowrap', padding:'10px 18px', fontWeight:600, fontSize:'1.08rem', color:'#000', background:'#f3f4f6', borderBottom:'2px solid #e5e7eb'}}>
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
                  <td key={field} style={{verticalAlign:'top', padding:'8px 14px', fontSize:'1.07rem', minWidth:110}}>
                    {field === "id" || field === "dept" || field === "contingent" ? (
                      field === "id" ? row.id :
                      <input
                        value={row[field]}
                        onChange={e => handleChange(rowIdx, field, e.target.value)}
                        disabled={!editMode}
                        style={{width:'100%',padding:'6px 8px',fontSize:'1.07rem'}}
                      />
                    ) : (
                      <>
                        <input
                          type="number"
                          value={row[field]}
                          onChange={e => handleChange(rowIdx, field, Number(e.target.value))}
                          disabled={!editMode}
                          style={{width:'100%',padding:'6px 8px',fontSize:'1.07rem'}}
                        />
                        {editMode && warnings[`${rowIdx}-${field}`] && (
                          <div style={{fontSize:12}}>{warnings[`${rowIdx}-${field}`]}</div>
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
