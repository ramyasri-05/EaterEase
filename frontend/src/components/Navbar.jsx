import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScroll = (id) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-highlight">The Cozy</span> Table
        </Link>
        <div className="navbar-links">
          <button onClick={() => handleScroll('menu')} className="nav-link-btn">Menu</button>
          <button onClick={() => handleScroll('about')} className="nav-link-btn">About</button>
          <button onClick={() => handleScroll('contact')} className="nav-link-btn">Contact</button>
          
          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin' : '/customer'} className="nav-link">Dashboard</Link>
              <span className="nav-greeting">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
