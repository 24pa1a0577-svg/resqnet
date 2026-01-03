
import React, { ReactNode } from 'react';
import { User, UserRole } from '../../types';

interface NavItem {
  icon: string;
  label: string;
  id: string;
  description?: string;
  color?: string;
}

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: string | null;
  setActiveTab: (id: string | null) => void;
  navItems: NavItem[];
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  navItems, 
  children 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => setActiveTab(null)}
        >
          <div className="bg-red-600 p-2 rounded-lg">
            <i className="fas fa-biohazard text-white"></i>
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">RESQNET</span>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded uppercase tracking-wider ml-2">
            {user.role}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <p className="text-sm font-bold text-gray-900">{user.name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Active Session</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt text-lg"></i>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {!activeTab ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome Back, {user.name.split(' ')[0]}</h1>
                <p className="text-lg text-gray-500">Select an option below to manage disaster response activities.</p>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="group flex flex-col items-start p-8 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:scale-[1.02] transition-all text-left relative overflow-hidden"
                  >
                    <div className={`w-14 h-14 ${item.color || 'bg-red-600'} rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white group-hover:scale-110 transition-transform`}>
                      <i className={`${item.icon} text-2xl`}></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.label}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{item.description}</p>
                    <div className="mt-auto flex items-center text-red-600 font-bold text-sm">
                      Open Tool <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-red-50 transition-colors -z-10"></div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab(null)}
                  className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 transition shadow-sm"
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {navItems.find(n => n.id === activeTab)?.label}
                  </h1>
                  <p className="text-gray-500 text-sm">Return to main menu at any time using the back button.</p>
                </div>
              </div>
              {children}
            </div>
          )}
        </main>
      </div>

      {/* Quick Access Mobile Nav (When activeTab is selected) */}
      {activeTab && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full px-4 py-2 shadow-2xl flex items-center gap-2 z-50 md:hidden">
           {navItems.map(item => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-10 h-10 flex items-center justify-center rounded-full transition ${activeTab === item.id ? 'bg-red-600 text-white' : 'text-gray-400'}`}
             >
               <i className={item.icon}></i>
             </button>
           ))}
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
