import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loader">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they are admin trying to access customer, redirect to admin
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    // If customer trying to access admin
    if (user.role === 'customer') return <Navigate to="/customer" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
