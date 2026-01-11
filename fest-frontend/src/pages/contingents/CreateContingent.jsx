import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateContingent.css';

export default function CreateContingent() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    cc_code: '',
    college_name: '',
    cl_name: '',
    cl_contact: '',
    acl1_name: '',
    acl1_contact: '',
    acl2_name: '',
    acl2_contact: '',
    event_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get('/api/events', { withCredentials: true })
      .then(res => {
        // Accept both array and {events: array}
        let data = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (Array.isArray(res.data.events)) data = res.data.events;
        setEvents(data);
      })
      .catch(() => setEvents([]));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/contingents', form, { withCredentials: true });
      setSuccess('Contingent created successfully!');
      setForm({
        cc_code: '', college_name: '', cl_name: '', cl_contact: '',
        acl1_name: '', acl1_contact: '', acl2_name: '', acl2_contact: '', event_id: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create contingent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-contingent-container">
      <h2>Create Contingent</h2>
      <form onSubmit={handleSubmit} className="create-contingent-form-grid">
        <div><label>CC Code</label><input name="cc_code" value={form.cc_code} onChange={handleChange} required /></div>
        <div><label>College/Department Name</label><input name="college_name" value={form.college_name} onChange={handleChange} /></div>
        <div><label>CL Name</label><input name="cl_name" value={form.cl_name} onChange={handleChange} required /></div>
        <div><label>CL Contact</label><input name="cl_contact" value={form.cl_contact} onChange={handleChange} /></div>
        <div><label>ACL 1 Name</label><input name="acl1_name" value={form.acl1_name} onChange={handleChange} /></div>
        <div><label>ACL 1 Contact</label><input name="acl1_contact" value={form.acl1_contact} onChange={handleChange} /></div>
        <div><label>ACL 2 Name</label><input name="acl2_name" value={form.acl2_name} onChange={handleChange} /></div>
        <div><label>ACL 2 Contact</label><input name="acl2_contact" value={form.acl2_contact} onChange={handleChange} /></div>
        <div className="full-width">
          <label>Event Name</label>
          <select name="event_id" value={form.event_id} onChange={handleChange} required>
            <option value="">Select Event</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>
        {error && <div className="error full-width">{error}</div>}
        {success && <div className="success full-width">{success}</div>}
        <button type="submit" className="full-width" disabled={loading}>{loading ? 'Creating...' : 'Create Contingent'}</button>
      </form>
    </div>
  );
}
