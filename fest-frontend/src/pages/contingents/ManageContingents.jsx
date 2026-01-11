import './ManageContingents.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ManageContingents() {
  const [contingents, setContingents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editColor, setEditColor] = useState('#2d3a5a');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [notification, setNotification] = useState("");

  // Sorting state per event
  const [sortOrders, setSortOrders] = useState({}); // { [eventId]: 'default' | 'az' | 'za' }

  // Collapsible state per event
  const [openTables, setOpenTables] = useState({}); // { [eventId]: true/false }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/contingents', { withCredentials: true }),
      axios.get('/api/events', { withCredentials: true })
    ])
      .then(([contingentRes, eventRes]) => {
        setContingents(Array.isArray(contingentRes.data.contingents) ? contingentRes.data.contingents : []);
        setEvents(Array.isArray(eventRes.data.events) ? eventRes.data.events : []);
      })
      .catch(() => setError('Failed to fetch contingents or events'))
      .finally(() => setLoading(false));
  }, []);

  const handleView = (id) => setViewId(id);
  const handleEdit = (id) => {
    setEditId(id);
    const c = contingents.find(x => x.id === id);
    setEditData({ ...c });
    setEditColor('#2d3a5a');
  };
  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await axios.delete(`/api/contingents/${confirmDeleteId}`, { withCredentials: true });
      setContingents(contingents.filter(c => c.id !== confirmDeleteId));
      setNotification("Contingent deleted successfully.");
      setTimeout(() => setNotification(""), 2500);
    } catch (err) {
      setNotification("Failed to delete contingent.");
      setTimeout(() => setNotification(""), 2500);
    }
    setConfirmDeleteId(null);
  };
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleColorChange = (e) => setEditColor(e.target.value);
  const handleEditSave = () => {
    // TODO: Implement update API call
    setEditId(null);
  };
  const handleEditCancel = () => setEditId(null);
  const handleViewClose = () => setViewId(null);
  const handleSortChange = (eventId, order) => {
    setSortOrders(prev => ({ ...prev, [eventId]: order }));
  };
  const handleToggleTable = (eventId) => {
    setOpenTables(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  // Group contingents by event, with sorting
  const contingentsByEvent = events.map(ev => {
    let eventConts = contingents.filter(c => c.event_id === ev.id);
    const sortOrder = sortOrders[ev.id] || 'default';
    if (sortOrder === 'az') {
      eventConts = [...eventConts].sort((a, b) => a.cc_code.localeCompare(b.cc_code));
    } else if (sortOrder === 'za') {
      eventConts = [...eventConts].sort((a, b) => b.cc_code.localeCompare(a.cc_code));
    }
    return {
      event: ev,
      contingents: eventConts
    };
  }).filter(group => group.contingents.length > 0);

  return (
    <div className="manage-contingent-container">
      <h2>Manage Contingents</h2>
      {loading ? <div>Loading...</div> : error ? <div className="error">{error}</div> : (
        contingentsByEvent.map(group => (
          <div key={group.event.id} className="event-section">
            <div className="event-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="collapse-btn"
                  onClick={() => handleToggleTable(group.event.id)}
                  style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', marginRight: 4 }}
                  aria-label={openTables[group.event.id] ? 'Collapse' : 'Expand'}
                >
                  {openTables[group.event.id] !== false ? '▼' : '►'}
                </button>
                <h3>{group.event.name}</h3>
              </div>
              <div className="table-filter-group">
                <span style={{ fontSize: 13, color: '#9fb7d1', marginRight: 8 }}>Sort:</span>
                <select
                  value={sortOrders[group.event.id] || 'default'}
                  onChange={e => handleSortChange(group.event.id, e.target.value)}
                  style={{ fontSize: 13, padding: '2px 8px', borderRadius: 6 }}
                >
                  <option value="default">Default</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </select>
              </div>
            </div>
            <div className={`collapse-anim${openTables[group.event.id] !== false ? '' : ' closed'}`}>
              <table>
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>CC Code</th>
                    <th style={{textAlign:'right'}}>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {group.contingents.map((c, idx) => (
                    <tr key={c.id}>
                      <td>{idx + 1}</td>
                      <td>{c.cc_code}</td>
                      <td style={{textAlign:'right'}}>
                        <button className="icon-btn" title="View" onClick={() => handleView(c.id)}>
                          <span role="img" aria-label="view">👁️</span>
                        </button>
                        <button className="icon-btn" title="Edit" onClick={() => handleEdit(c.id)}>
                          <span role="img" aria-label="edit">✏️</span>
                        </button>
                        <button className="icon-btn" title="Delete" onClick={() => handleDelete(c.id)}>
                          <span role="img" aria-label="delete">🗑️</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
      {/* View Modal */}
      {viewId && (() => {
        const c = contingents.find(x => x.id === viewId);
        if (!c) return null;
        return (
          <div className="modal-bg" onClick={handleViewClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <h3>Contingent Details</h3>
              <ul style={{ lineHeight: 1.7 }}>
                <li><b>CC Code:</b> {c.cc_code}</li>
                <li><b>College/Dept:</b> {c.college_name}</li>
                <li><b>CL Name:</b> {c.cl_name}</li>
                <li><b>CL Email:</b> {c.cl_email}</li>
                <li><b>CL Contact:</b> {c.cl_contact}</li>
                <li><b>ACL1 Name:</b> {c.acl1_name}</li>
                <li><b>ACL1 Email:</b> {c.acl1_email}</li>
                <li><b>ACL1 Contact:</b> {c.acl1_contact}</li>
                <li><b>ACL2 Name:</b> {c.acl2_name || '-'}</li>
                <li><b>ACL2 Email:</b> {c.acl2_email || '-'}</li>
                <li><b>ACL2 Contact:</b> {c.acl2_contact || '-'}</li>
              </ul>
              <button className="icon-btn" onClick={handleViewClose}>Close</button>
            </div>
          </div>
        );
      })()}
      {/* Edit Modal */}
      {editId && (() => {
        const c = editData;
        return (
          <div className="modal-bg" onClick={handleEditCancel}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <h3>Edit Contingent</h3>
              <form onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                <div><label>CC Code</label><input name="cc_code" value={c.cc_code} onChange={handleEditChange} style={{ color: editColor }} /></div>
                <div><label>College/Dept</label><input name="college_name" value={c.college_name} onChange={handleEditChange} style={{ color: editColor }} /></div>
                <div><label>CL Name</label><input name="cl_name" value={c.cl_name} onChange={handleEditChange} style={{ color: editColor }} /></div>
                <div><label>CL Email</label><input name="cl_email" value={c.cl_email} onChange={handleEditChange} style={{ color: editColor }} /></div>
                <div><label>CL Contact</label><input name="cl_contact" value={c.cl_contact} onChange={handleEditChange} style={{ color: editColor }} /></div>
                <div><label>ACL1 Name</label><input name="acl1_name" value={c.acl1_name} onChange={handleEditChange} style={{ color: editColor }} /></div>
                <div><label>ACL1 Email</label><input name="acl1_email" value={c.acl1_email} onChange={handleEditChange} style={{ color: editColor }} /></div>
                <div><label>ACL1 Contact</label><input name="acl1_contact" value={c.acl1_contact} onChange={handleEditChange} style={{ color: editColor }} /></div>
                <div><label>ACL2 Name</label><input name="acl2_name" value={c.acl2_name} onChange={handleEditChange} style={{ color: editColor }} /></div>
                <div><label>ACL2 Email</label><input name="acl2_email" value={c.acl2_email} onChange={handleEditChange} style={{ color: editColor }} /></div>
                <div><label>ACL2 Contact</label><input name="acl2_contact" value={c.acl2_contact} onChange={handleEditChange} style={{ color: editColor }} /></div>
                <div style={{margin:'10px 0'}}>
                  <label>Text Color</label>
                  <input type="color" value={editColor} onChange={handleColorChange} style={{width:40,height:28,border:'none',background:'none',verticalAlign:'middle'}} />
                </div>
                <button className="icon-btn" type="submit">Save</button>
                <button className="icon-btn" type="button" onClick={handleEditCancel}>Cancel</button>
              </form>
            </div>
          </div>
        );
      })()}
      {notification && <div className="notification">{notification}</div>}
      {confirmDeleteId && (
        <div className="modal-bg" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Are you sure you want to delete this contingent?</h3>
            <div style={{display:'flex',gap:16,marginTop:18}}>
              <button className="icon-btn" onClick={confirmDelete} style={{background:'#d32f2f',color:'#fff'}}>Delete</button>
              <button className="icon-btn" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
