
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UserRole, User } from '../types';
import { storage, USERS_KEY } from '../services/mockData';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = localStorage.getItem('resqnet_selected_role') as UserRole || UserRole.CITIZEN;
  
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');

  const isCitizen = role === UserRole.CITIZEN;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = storage.get<User[]>(USERS_KEY, []);
    let user = users.find(u => (isCitizen ? u.email.includes('citizen') : u.email === identifier) && u.role === role);

    if (isCitizen) {
      if (!showOtp) {
        if (identifier.length === 10) {
          setShowOtp(true);
        } else {
          setError('Enter a valid 10-digit phone number');
        }
        return;
      }
      if (otp !== '123456') {
        setError('Invalid OTP (Hint: use 123456)');
        return;
      }
    } else {
      if (!identifier.includes('@')) {
        setError('Enter a valid Gmail address');
        return;
      }
      // Simple mock validation for demonstration
      if (!user) {
         user = { id: Date.now().toString(), name: identifier.split('@')[0], email: identifier, role };
         storage.set(USERS_KEY, [...users, user]);
      }
    }

    if (user) {
      localStorage.setItem('resqnet_current_user', JSON.stringify(user));
      onLogin(user);
      navigate(`/dashboard/${role.toLowerCase().replace(' ', '-')}`);
    } else {
      setError('User record not found for this role.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
          <p className="text-gray-500 mt-2">Accessing as <span className="text-red-600 font-semibold">{role}</span></p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isCitizen ? 'Phone Number' : 'Gmail Address'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <i className={isCitizen ? "fas fa-phone" : "fas fa-envelope"}></i>
              </span>
              <input 
                type={isCitizen ? "tel" : "email"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isCitizen ? "9876543210" : "name@gmail.com"}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                required
                disabled={showOtp}
              />
            </div>
          </div>

          {showOtp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <input 
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-center tracking-widest font-bold"
                required
                maxLength={6}
              />
              <p className="text-xs text-gray-400 mt-2 text-center">Standard OTP is 123456</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-200"
          >
            {isCitizen ? (showOtp ? 'Verify & Continue' : 'Send OTP') : 'Continue to Dashboard'}
          </button>
        </form>

        <button 
          onClick={() => navigate('/role-selection')}
          className="w-full mt-6 text-gray-500 text-sm font-medium hover:text-gray-800 transition"
        >
          Change Role
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
