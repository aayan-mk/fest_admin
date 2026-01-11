import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const ManageEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [sortType, setSortType] = useState('default');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/events', { withCredentials: true });
      // Accept both {events: array} and array
      let data = [];
      if (Array.isArray(res.data)) data = res.data;
      else if (Array.isArray(res.data.events)) data = res.data.events;
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEdit = (event) => {
    setEditId(event.id);
    setEditName(event.name);
    setEditDescription(event.description);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/api/events/${id}`, { name: editName, description: editDescription }, { withCredentials: true });
      setEditId(null);
      fetchEvents();
    } catch (err) {
      setError('Failed to update event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(`/api/events/${id}`, { withCredentials: true });
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  // Sorting logic
  const getSortedEvents = () => {
    if (sortType === 'a-z') {
      return [...events].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'z-a') {
      return [...events].sort((a, b) => b.name.localeCompare(a.name));
    } else {
      return events;
    }
  };

  return (
    <div className="manage-event-container">
      <h2>Manage Events</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="sortType">Sort by: </label>
        <select id="sortType" value={sortType} onChange={e => setSortType(e.target.value)}>
          <option value="default">Default</option>
          <option value="a-z">A-Z</option>
          <option value="z-a">Z-A</option>
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th className="name-col">Name</th>
              <th className="desc-col">Description</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedEvents().map((event, idx) => (
              <tr key={event.id}>
                <td className="name-col">
                  {editId === event.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    event.name
                  )}
                </td>
                <td className="desc-col">
                  {editId === event.id ? (
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                    />
                  ) : (
                    event.description
                  )}
                </td>
                <td className="actions-col">
                  {editId === event.id ? (
                    <>
                      <button onClick={() => handleUpdate(event.id)} title="Save"><FaSave /></button>
                      <button onClick={() => setEditId(null)} title="Cancel"><FaTimes /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(event)} title="Edit"><FaEdit /></button>
                      <button onClick={() => handleDelete(event.id)} title="Delete"><FaTrash /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageEvent;
