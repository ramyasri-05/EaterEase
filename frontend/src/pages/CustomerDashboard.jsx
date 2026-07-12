import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, Users, XCircle, LayoutDashboard, History, Sparkles, Pencil } from 'lucide-react';

const buildAvatarUrl = (name) => {
  const initials = (name || 'Guest')
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
          <stop offset="0%" stop-color="#58d6c8"/>
          <stop offset="100%" stop-color="#ff7a59"/>
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

const CustomerDashboard = () => {
  const { user, updateProfileImage } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const fileInputRef = useRef(null);

  const fetchReservations = async () => {
    try {
      const { data } = await api.get('/reservations/myreservations');
      setReservations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/reservations', { date, timeSlot, guests: Number(guests) });
      setSuccess('Reservation booked successfully!');
      fetchReservations();
      setDate('');
      setTimeSlot('');
      setGuests(1);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book reservation');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/reservations/${id}`);
      fetchReservations();
    } catch (err) {
      console.error(err);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 17; i <= 22; i++) {
      slots.push(`${i}:00`);
      slots.push(`${i}:30`);
    }
    return slots;
  };

  const upcomingReservations = reservations.filter(r => r.status === 'confirmed' && new Date(r.date) >= new Date(new Date().setHours(0,0,0,0)));
  const pastReservations = reservations.filter(r => r.status === 'cancelled' || new Date(r.date) < new Date(new Date().setHours(0,0,0,0)));
  const avatarUrl = previewImage || user?.profileImage || buildAvatarUrl(user?.name);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const fileDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read the selected image.'));
        reader.readAsDataURL(file);
      });

      await updateProfileImage(fileDataUrl);
      setPreviewImage(fileDataUrl);
      setSuccess('Profile photo updated successfully!');
      setTimeout(() => setSuccess(''), 2500);
    } catch (uploadError) {
      setError(uploadError?.message || uploadError.response?.data?.message || 'Failed to upload profile photo');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar glass-panel">
        <div className="user-profile-summary profile-card">
          <div className="avatar-shell clickable-avatar" onClick={handleAvatarClick} role="button" tabIndex={0} aria-label="Edit profile photo" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAvatarClick()}>
            <img className="profile-avatar" src={avatarUrl} alt={`${user?.name || 'Customer'} profile`} />
            <span className="avatar-status" />
            <span className="avatar-overlay">
              <Pencil size={16} />
            </span>
          </div>
          <div className="profile-copy">
            <h3>{user?.name}</h3>
            <p>Customer</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFile} className="avatar-input" />
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /> Overview
          </button>
          <button className={`nav-item ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>
            <Calendar size={20} /> Book a Table
          </button>
          <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={20} /> My History
          </button>
        </nav>
      </aside>

      <div className="dashboard-main">
        {activeTab === 'overview' && (
          <div className="tab-content fade-in">
            <div className="welcome-banner glass-panel">
              <h2>Welcome back, {user?.name}! 👋</h2>
              <p>Ready for your next amazing dining experience?</p>
              <button className="btn btn-primary mt-3" onClick={() => setActiveTab('book')}>Book Now</button>
            </div>

            <div className="stats-row mt-4">
              <div className="stat-card glass-panel">
                <div className="stat-icon"><Calendar size={24} /></div>
                <div className="stat-info">
                  <h4>Upcoming</h4>
                  <h2>{upcomingReservations.length}</h2>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon"><History size={24} /></div>
                <div className="stat-info">
                  <h4>Total Bookings</h4>
                  <h2>{reservations.length}</h2>
                </div>
              </div>
            </div>

            <div className="recent-activity mt-4">
              <h3>Your Upcoming Reservations</h3>
              {upcomingReservations.length === 0 ? (
                <div className="empty-state glass-panel mt-2">
                  <p>No upcoming reservations. Time to book a table!</p>
                </div>
              ) : (
                <div className="reservation-list mt-2">
                  {upcomingReservations.slice(0, 3).map(res => (
                    <div key={res._id} className="reservation-card">
                      <div className="reservation-details">
                        <div className="res-header">
                          <span className="res-date">{new Date(res.date).toLocaleDateString()}</span>
                          <span className="status-badge confirmed">Confirmed</span>
                        </div>
                        <div className="res-info">
                          <p><Clock size={16} /> {res.timeSlot}</p>
                          <p><Users size={16} /> {res.guests} Guests</p>
                          <p>Table: #{res.table?.number}</p>
                        </div>
                      </div>
                      <button onClick={() => handleCancel(res._id)} className="btn btn-danger btn-sm">
                        <XCircle size={16} /> Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'book' && (
          <div className="tab-content fade-in">
            <h2>Book a Table</h2>
            <div className="booking-section glass-panel mt-3">
              {error && <div className="alert error">{error}</div>}
              {success && <div className="alert success">{success}</div>}
              
              <form onSubmit={handleBooking} className="booking-form-grid">
                <div className="form-group">
                  <label><Calendar size={18} /> Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    min={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label><Clock size={18} /> Time</label>
                  <select 
                    value={timeSlot} 
                    onChange={(e) => setTimeSlot(e.target.value)} 
                    required
                  >
                    <option value="">Select time</option>
                    {generateTimeSlots().map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label><Users size={18} /> Guests</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="20"
                    value={guests} 
                    onChange={(e) => setGuests(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="form-group submit-group">
                  <button type="submit" className="btn btn-primary btn-block">Confirm Booking</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="tab-content fade-in">
            <h2>Reservation History</h2>
            <div className="reservation-list mt-3">
              {reservations.length === 0 ? (
                <div className="empty-state glass-panel">
                  <p>You haven't made any reservations yet.</p>
                </div>
              ) : (
                reservations.map(res => (
                  <div key={res._id} className={`reservation-card ${res.status === 'cancelled' ? 'cancelled' : ''}`}>
                    <div className="reservation-details">
                      <div className="res-header">
                        <span className="res-date">{new Date(res.date).toLocaleDateString()}</span>
                        <span className={`status-badge ${res.status}`}>{res.status}</span>
                      </div>
                      <div className="res-info">
                        <p><Clock size={16} /> {res.timeSlot}</p>
                        <p><Users size={16} /> {res.guests} Guests</p>
                        <p>Table: #{res.table?.number}</p>
                      </div>
                    </div>
                    {res.status !== 'cancelled' && (
                      <button onClick={() => handleCancel(res._id)} className="btn btn-danger btn-sm">
                        <XCircle size={16} /> Cancel
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
