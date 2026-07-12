import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Search, Trash2, Calendar, LayoutDashboard, Grid, Users, ShieldAlert, Crown } from 'lucide-react';

const buildAvatarUrl = (name) => {
  const initials = (name || 'Admin')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" role="img" aria-label="Profile avatar">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff7a59"/>
          <stop offset="100%" stop-color="#6ea8ff"/>
        </linearGradient>
      </defs>
      <rect width="240" height="240" rx="72" fill="url(#bg)"/>
      <circle cx="120" cy="92" r="38" fill="rgba(255,255,255,0.18)"/>
      <path d="M72 188c8-32 34-50 48-50s40 18 48 50" fill="rgba(255,255,255,0.18)"/>
      <text x="120" y="136" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="800" fill="#ffffff">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  
  // Table form
  const [tableNumber, setTableNumber] = useState('');
  const [tableCapacity, setTableCapacity] = useState('');

  const fetchReservations = async () => {
    try {
      const url = filterDate ? `/reservations?date=${filterDate}` : '/reservations';
      const { data } = await api.get(url);
      setReservations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTables = async () => {
    try {
      const { data } = await api.get('/tables');
      setTables(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, [filterDate]);

  const handleCancelReservation = async (id) => {
    if(window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await api.delete(`/reservations/${id}`);
        fetchReservations();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tables', { number: Number(tableNumber), capacity: Number(tableCapacity) });
      setTableNumber('');
      setTableCapacity('');
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add table');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysReservations = reservations.filter(r => r.date.startsWith(todayStr) && r.status === 'confirmed');
  const avatarUrl = buildAvatarUrl(user?.name);

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar glass-panel">
        <div className="user-profile-summary profile-card admin-profile-card">
          <div className="avatar-shell admin-shell">
            <img className="profile-avatar" src={avatarUrl} alt={`${user?.name || 'Admin'} profile`} />
            <span className="avatar-status admin-status" />
          </div>
          <div className="profile-copy">
            <h3>{user?.name}</h3>
            <p className="admin-badge">Administrator</p>
          </div>
          <div className="profile-note admin-note">
            <Crown size={14} /> Control center online
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /> Overview
          </button>
          <button className={`nav-item ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>
            <Calendar size={20} /> All Reservations
          </button>
          <button className={`nav-item ${activeTab === 'tables' ? 'active' : ''}`} onClick={() => setActiveTab('tables')}>
            <Grid size={20} /> Manage Tables
          </button>
        </nav>
      </aside>

      <div className="dashboard-main">
        {activeTab === 'overview' && (
          <div className="tab-content fade-in">
            <div className="welcome-banner admin-banner glass-panel">
              <h2>Admin Control Center ⚙️</h2>
              <p>Monitor restaurant activity, manage bookings, and configure tables.</p>
            </div>

            <div className="stats-row mt-4">
              <div className="stat-card glass-panel">
                <div className="stat-icon"><Calendar size={24} /></div>
                <div className="stat-info">
                  <h4>Today's Bookings</h4>
                  <h2>{todaysReservations.length}</h2>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon"><Grid size={24} /></div>
                <div className="stat-info">
                  <h4>Total Tables</h4>
                  <h2>{tables.length}</h2>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon"><Users size={24} /></div>
                <div className="stat-info">
                  <h4>Total Reservations</h4>
                  <h2>{reservations.length}</h2>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3>Today's Schedule</h3>
              <div className="table-responsive glass-panel mt-2 p-3">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Customer</th>
                      <th>Guests</th>
                      <th>Table</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysReservations.length > 0 ? todaysReservations.map(res => (
                      <tr key={res._id}>
                        <td><strong>{res.timeSlot}</strong></td>
                        <td>{res.user?.name}</td>
                        <td>{res.guests}</td>
                        <td>#{res.table?.number}</td>
                        <td><span className="status-badge confirmed">Confirmed</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="text-center">No bookings for today.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="tab-content fade-in">
            <div className="section-header">
              <h2>All Reservations</h2>
              <div className="filter-group">
                <Calendar size={18} />
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
                {filterDate && <button onClick={() => setFilterDate('')} className="btn btn-sm">Clear</button>}
              </div>
            </div>
            
            <div className="table-responsive glass-panel p-2 mt-3">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Guests</th>
                    <th>Table</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(res => (
                    <tr key={res._id} className={res.status === 'cancelled' ? 'row-cancelled' : ''}>
                      <td>
                        <div className="customer-info">
                          <strong>{res.user?.name}</strong>
                          <span>{res.user?.email}</span>
                        </div>
                      </td>
                      <td>{new Date(res.date).toLocaleDateString()}</td>
                      <td>{res.timeSlot}</td>
                      <td>{res.guests}</td>
                      <td>#{res.table?.number}</td>
                      <td><span className={`status-badge ${res.status}`}>{res.status}</span></td>
                      <td>
                        {res.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleCancelReservation(res._id)} 
                            className="action-btn cancel"
                            title="Cancel Reservation"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center">No reservations found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="tab-content fade-in">
            <h2>Manage Tables</h2>
            <div className="admin-section tables-manager glass-panel mt-3">
              <h4>Add New Table</h4>
              <form onSubmit={handleAddTable} className="add-table-form mt-2">
                <div className="form-group mb-0">
                  <input 
                    type="number" 
                    placeholder="Table No." 
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group mb-0">
                  <input 
                    type="number" 
                    placeholder="Capacity (Seats)" 
                    value={tableCapacity}
                    onChange={(e) => setTableCapacity(e.target.value)}
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Table</button>
              </form>

              <h4 className="mt-4 mb-2">Current Tables</h4>
              <div className="tables-grid">
                {tables.map(table => (
                  <div key={table._id} className="table-card glass-panel">
                    <div className="table-number">#{table.number}</div>
                    <div className="table-capacity">{table.capacity} Seats</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
