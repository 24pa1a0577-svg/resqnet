
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { storage } from './services/mockData';

// Components
import SplashScreen from './views/SplashScreen';

// Pages
import LandingPage from './views/LandingPage';
import RoleSelection from './views/RoleSelection';
import LoginPage from './views/LoginPage';
import CitizenDashboard from './views/dashboards/CitizenDashboard';
import VolunteerDashboard from './views/dashboards/VolunteerDashboard';
import NGODashboard from './views/dashboards/NGODashboard';
import GovernmentDashboard from './views/dashboards/GovernmentDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize storage and check for existing session
    storage.initialize();
    const savedUser = localStorage.getItem('resqnet_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Splash screen duration (3 seconds)
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(splashTimer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('resqnet_current_user');
    setUser(null);
    navigate('/');
  };

  if (showSplash) return <SplashScreen />;
  if (loading) return null; // Prevent flicker during initial state check

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={user ? <Navigate to={`/dashboard/${user.role.toLowerCase().replace(' ', '-')}`} /> : <LandingPage />} 
        />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />

        {/* Role Protected Routes */}
        <Route 
          path="/dashboard/citizen" 
          element={user?.role === UserRole.CITIZEN ? <CitizenDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/dashboard/volunteer" 
          element={user?.role === UserRole.VOLUNTEER ? <VolunteerDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/dashboard/ngo-coordinator" 
          element={user?.role === UserRole.NGO ? <NGODashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/dashboard/government-official" 
          element={user?.role === UserRole.GOVERNMENT ? <GovernmentDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
