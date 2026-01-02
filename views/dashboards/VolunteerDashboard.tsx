
import React, { useState, useEffect } from 'react';
import { User, Task, Disaster, EmergencyAlert, Severity, ChatMessage, UserRole } from '../../types';
import DashboardLayout from './DashboardLayout';
import { storage, TASKS_KEY, DISASTERS_KEY, ALERTS_KEY, CHATS_KEY, USERS_KEY } from '../../services/mockData';

const VolunteerDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(user.isOnline || false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [citizens, setCitizens] = useState<User[]>([]);
  const [selectedCitizen, setSelectedCitizen] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setTasks(storage.get<Task[]>(TASKS_KEY, []));
    setDisasters(storage.get<Disaster[]>(DISASTERS_KEY, []));
    setAlerts(storage.get<EmergencyAlert[]>(ALERTS_KEY, []));
    setChats(storage.get<ChatMessage[]>(CHATS_KEY, []));
    setCitizens(storage.get<User[]>(USERS_KEY, []).filter(u => u.role === UserRole.CITIZEN));
  }, []);

  const toggleOnline = () => setIsOnline(!isOnline);

  const updateTaskStatus = (taskId: string, status: any) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status, volunteerId: status === 'Accepted' ? user.id : t.volunteerId } : t);
    setTasks(updated);
    storage.set(TASKS_KEY, updated);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCitizen) return;
    
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: selectedCitizen.id,
      text: newMessage,
      timestamp: new Date()
    };
    
    const updated = [...chats, msg];
    setChats(updated);
    storage.set(CHATS_KEY, updated);
    setNewMessage('');
  };

  const navItems = [
    { 
      icon: 'fas fa-tasks', 
      label: 'View Available Tasks', 
      id: 'tasks', 
      description: 'Check for new emergency dispatch requests in your vicinity.',
      color: 'bg-green-600'
    },
    { 
      icon: 'fas fa-spinner', 
      label: 'Active Missions', 
      id: 'active', 
      description: 'Log progress and mark missions as completed in the field.',
      color: 'bg-orange-500'
    },
    { 
      icon: 'fas fa-comments', 
      label: 'Communicate with Citizen', 
      id: 'chat', 
      description: 'Direct messaging with citizens for rescue coordination.',
      color: 'bg-teal-600'
    },
    { 
      icon: 'fas fa-bell', 
      label: 'Emergency Alerts', 
      id: 'alerts', 
      description: 'Receive real-time critical warnings and mobilization calls.',
      color: 'bg-red-600'
    },
    { 
      icon: 'fas fa-clock-rotate-left', 
      label: 'Mission History', 
      id: 'history', 
      description: 'Review your past contributions and mission records.',
      color: 'bg-blue-600'
    },
    { 
      icon: 'fas fa-user-circle', 
      label: 'Volunteer Profile', 
      id: 'profile', 
      description: 'Manage your credentials, availability, and skills.',
      color: 'bg-indigo-600'
    },
  ];

  const activeMissions = tasks.filter(t => t.volunteerId === user.id && t.status === 'Accepted');
  const completedMissions = tasks.filter(t => t.volunteerId === user.id && t.status === 'Completed');

  const filteredChats = chats.filter(c => 
    (c.senderId === user.id && c.receiverId === selectedCitizen?.id) ||
    (c.senderId === selectedCitizen?.id && c.receiverId === user.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <DashboardLayout 
      user={{...user, isOnline}} 
      onLogout={onLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      navItems={navItems}
    >
      {!activeTab && (
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between bg-white p-8 rounded-3xl shadow-lg border border-gray-100 gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isOnline ? 'bg-green-50' : 'bg-gray-50'}`}>
                <i className={`fas fa-user-check text-2xl ${isOnline ? 'text-green-600' : 'text-gray-400'}`}></i>
              </div>
              <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            </div>
            <div>
              <p className="font-bold text-xl text-gray-900">Deployment Readiness</p>
              <p className="text-sm text-gray-500">{isOnline ? 'Your location is being shared with NGOs' : 'NGOs cannot assign tasks to you while offline'}</p>
            </div>
          </div>
          <button onClick={toggleOnline} className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-lg ${isOnline ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-gray-200' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'}`}>
            {isOnline ? 'Go Offline' : 'Set as Available'}
          </button>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tasks.filter(t => !t.volunteerId && t.status === 'Pending').map(t => {
            const disaster = disasters.find(d => d.id === t.disasterId);
            return (
              <div key={t.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-green-200 transition-all flex flex-col group">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-widest">Immediate Dispatch</span>
                  <span className="text-xs text-gray-400"><i className="fas fa-calendar-alt mr-2"></i>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-4">{t.description}</h3>
                <div className="space-y-3 mb-8 text-sm text-gray-600">
                  <p><i className="fas fa-location-dot w-6"></i> {disaster?.location || 'Unknown'}</p>
                  <p><i className="fas fa-fire w-6"></i> Event: {disaster?.type || 'General Emergency'}</p>
                </div>
                <button onClick={() => updateTaskStatus(t.id, 'Accepted')} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition">Accept Assignment</button>
              </div>
            );
          })}
          {tasks.filter(t => !t.volunteerId && t.status === 'Pending').length === 0 && (
             <div className="lg:col-span-2 text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
               No pending tasks at the moment.
             </div>
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {activeMissions.length > 0 ? activeMissions.map(t => (
             <div key={t.id} className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-orange-500">
               <h3 className="font-extrabold text-2xl text-gray-900 mb-1">{t.description}</h3>
               <p className="text-orange-600 font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-6">
                 <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span> Mission in Progress
               </p>
               <button onClick={() => updateTaskStatus(t.id, 'Completed')} className="w-full py-5 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-3">
                 <i className="fas fa-check-circle"></i> Mark Mission as Completed
               </button>
             </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 text-gray-400">No active missions. Accept a task to get started!</div>
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Citizen List */}
          <div className="md:col-span-1 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 text-teal-700">Conversations</h3>
              <p className="text-xs text-gray-500 mt-1">Chatting with citizens in need</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {citizens.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setSelectedCitizen(c)}
                  className={`w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition border-b border-gray-50 text-left ${selectedCitizen?.id === c.id ? 'bg-teal-50 border-teal-100' : ''}`}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                    {c.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tight">Reported Incident</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
            {selectedCitizen ? (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-teal-600 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                    {selectedCitizen.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{selectedCitizen.name}</h4>
                    <p className="text-[10px] opacity-80 uppercase tracking-widest">Citizen - Requester</p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                  {filteredChats.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
                        msg.senderId === user.id 
                          ? 'bg-teal-600 text-white rounded-tr-none' 
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        <p className={`text-[9px] mt-2 font-black uppercase ${msg.senderId === user.id ? 'text-teal-200' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredChats.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm opacity-60">
                      <i className="fas fa-comment-dots text-4xl mb-4"></i>
                      <p>Start a coordination message with {selectedCitizen.name}</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Provide updates or ask for details..." 
                    className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                  <button type="submit" className="w-12 h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center hover:bg-teal-700 transition shadow-lg shadow-teal-100">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50/30">
                <div className="w-24 h-24 bg-teal-50 rounded-[2rem] flex items-center justify-center mb-8">
                  <i className="fas fa-messages text-teal-500 text-4xl"></i>
                </div>
                <h3 className="font-black text-gray-900 text-2xl tracking-tighter uppercase mb-2">Citizen Messaging</h3>
                <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                  Select a citizen from the sidebar to provide real-time updates on rescue missions or resource delivery.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {alerts.map(a => (
            <div key={a.id} className={`bg-white p-6 rounded-3xl shadow-lg border-l-8 ${a.severity === Severity.CRITICAL ? 'border-red-600' : 'border-orange-500'}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <i className={`fas fa-exclamation-triangle ${a.severity === Severity.CRITICAL ? 'text-red-600' : 'text-orange-500'}`}></i>
                  {a.title}
                </h3>
                <span className="text-[10px] text-gray-400 font-black uppercase">{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">{a.message}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issuer: {a.issuer}</span>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${a.severity === Severity.CRITICAL ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                   {a.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Mission Accomplishments</h3>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">{completedMissions.length} Missions Total</span>
          </div>
          {completedMissions.map(t => (
             <div key={t.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                   <i className="fas fa-medal"></i>
                 </div>
                 <div>
                   <p className="font-bold text-gray-900">{t.description}</p>
                   <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{new Date(t.createdAt).toLocaleDateString()} • Task Verified</p>
                 </div>
               </div>
               <div className="text-green-600 font-black text-xs uppercase flex items-center gap-1">
                 <i className="fas fa-check-double"></i> SUCCESS
               </div>
             </div>
          ))}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
            <div className="h-32 bg-indigo-600 relative">
               <div className="absolute -bottom-12 left-12 w-24 h-24 bg-white rounded-3xl p-1 shadow-lg">
                  <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
                     <i className="fas fa-user-ninja text-3xl text-gray-400"></i>
                  </div>
               </div>
            </div>

            <div className="pt-16 pb-12 px-12">
               <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div>
                     <h2 className="text-3xl font-black text-gray-900 tracking-tight">{user.name}</h2>
                     <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1">Certified Field Volunteer</p>
                     <div className="flex items-center gap-4 mt-6">
                        <div className="text-center px-6 border-r border-gray-100">
                           <p className="text-2xl font-black text-gray-900">{completedMissions.length}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Missions</p>
                        </div>
                        <div className="text-center px-6 border-r border-gray-100">
                           <p className="text-2xl font-black text-gray-900">128</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Hours</p>
                        </div>
                        <div className="text-center px-6">
                           <p className="text-2xl font-black text-gray-900">4.9</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">Rating</p>
                        </div>
                     </div>
                  </div>
                  <button className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition">
                     Edit Profile
                  </button>
               </div>

               <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <h3 className="font-black text-sm uppercase tracking-[0.2em] text-gray-400">Personal Details</h3>
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <i className="fas fa-envelope text-gray-400 w-5"></i>
                           <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
                              <p className="text-sm font-bold text-gray-900">{user.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <i className="fas fa-id-card text-gray-400 w-5"></i>
                           <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Volunteer ID</p>
                              <p className="text-sm font-bold text-gray-900">RESQ-V-{user.id.padStart(4, '0')}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h3 className="font-black text-sm uppercase tracking-[0.2em] text-gray-400">Skills & Expertise</h3>
                     <div className="flex flex-wrap gap-2">
                        {['First Aid', 'Search & Rescue', 'Navigation', 'CPR Certified', 'Logistics'].map(skill => (
                           <span key={skill} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">
                              {skill}
                           </span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
