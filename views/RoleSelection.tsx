
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectRole = (role: UserRole) => {
    localStorage.setItem('resqnet_selected_role', role);
    navigate(`/login?role=${role.toLowerCase().replace(' ', '-')}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-4 mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900">Select Your Role</h1>
        <p className="text-lg text-gray-600">Choose how you want to contribute to the RESQNET ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <RoleCard 
          icon="fas fa-house-user" 
          role={UserRole.CITIZEN} 
          desc="Report emergencies and request immediate assistance."
          onClick={() => handleSelectRole(UserRole.CITIZEN)}
          color="bg-blue-500"
        />
        <RoleCard 
          icon="fas fa-hand-holding-heart" 
          role={UserRole.VOLUNTEER} 
          desc="Accept tasks and provide on-ground field support."
          onClick={() => handleSelectRole(UserRole.VOLUNTEER)}
          color="bg-green-500"
        />
        <RoleCard 
          icon="fas fa-building-ngo" 
          role={UserRole.NGO} 
          desc="Manage resources and coordinate volunteer efforts."
          onClick={() => handleSelectRole(UserRole.NGO)}
          color="bg-orange-500"
        />
        <RoleCard 
          icon="fas fa-landmark" 
          role={UserRole.GOVERNMENT} 
          desc="Monitor entire regions and approve resource requests."
          onClick={() => handleSelectRole(UserRole.GOVERNMENT)}
          color="bg-purple-500"
        />
      </div>
      
      <button 
        onClick={() => navigate('/')}
        className="mt-12 text-gray-500 hover:text-gray-800 font-medium transition"
      >
        <i className="fas fa-arrow-left mr-2"></i> Back to Home
      </button>
    </div>
  );
};

const RoleCard = ({ icon, role, desc, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="group relative flex flex-col items-center p-8 bg-white rounded-3xl border-2 border-transparent hover:border-gray-200 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center"
  >
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-gray-200`}>
      <i className={`${icon} text-white text-2xl`}></i>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{role}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    <div className="mt-6 w-full py-3 bg-gray-50 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors text-gray-600 font-semibold text-sm">
      Select Role
    </div>
  </button>
);

export default RoleSelection;
