import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, ShieldAlert, User as UserIcon } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/customer');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      // Navigation handled by useEffect
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className={`icon-wrapper ${role === 'admin' ? 'admin-wrapper' : ''}`}>
            {role === 'admin' ? <ShieldAlert size={28} /> : <UserPlus size={28} />}
          </div>
          <h2>Create Account</h2>
          <p>Join us to start making reservations</p>
        </div>

        <div className="role-selector">
          <button 
            type="button" 
            className={`role-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => setRole('customer')}
          >
            <UserIcon size={18} /> User
          </button>
          <button 
            type="button" 
            className={`role-btn ${role === 'admin' ? 'active admin' : ''}`}
            onClick={() => setRole('admin')}
          >
            <ShieldAlert size={18} /> Administrator
          </button>
        </div>
        
        {error && <div className="alert error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your full name"
              required 
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a password"
              required 
              minLength="6"
            />
          </div>
          <button type="submit" disabled={loading} className={`btn btn-primary btn-block ${role === 'admin' ? 'btn-admin' : ''}`}>
            {loading ? 'Creating Account...' : `Sign Up as ${role === 'admin' ? 'Admin' : 'User'}`}
          </button>
        </form>
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
