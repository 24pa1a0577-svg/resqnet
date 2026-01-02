
import React, { useState, useEffect } from 'react';
import { User, Disaster, Task, UserRole, ResourceRequest, ChatMessage } from '../../types';
import DashboardLayout from './DashboardLayout';
import { storage, DISASTERS_KEY, TASKS_KEY, USERS_KEY, REQUESTS_KEY, CHATS_KEY } from '../../services/mockData';

const NGODashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  
  // Chat specific states
  const [selectedVolunteer, setSelectedVolunteer] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [selectedDisaster, setSelectedDisaster] = useState('');

  useEffect(() => {
    setDisasters(storage.get<Disaster[]>(DISASTERS_KEY, []));
    setTasks(storage.get<Task[]>(TASKS_KEY, []));
    setVolunteers(storage.get<User[]>(USERS_KEY, []).filter(u => u.role === UserRole.VOLUNTEER));
    setRequests(storage.get<ResourceRequest[]>(REQUESTS_KEY, []));
    setChats(storage.get<ChatMessage[]>(CHATS_KEY, []));
  }, []);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: `t-${Date.now()}`,
      disasterId: selectedDisaster,
      ngoId: user.id,
      description: newTaskDesc,
      status: 'Pending',
      createdAt: new Date()
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    storage.set(TASKS_KEY, updated);
    setNewTaskDesc('');
    setActiveTab('monitor');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedVolunteer) return;
    
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: selectedVolunteer.id,
      text: newMessage,
      timestamp: new Date()
    };
    
    const updated = [...chats, msg];
    setChats(updated);
    storage.set(CHATS_KEY, updated);
    setNewMessage('');
  };

  const navItems = [
    { icon: 'fas fa-plus-circle', label: 'Create Disaster Tasks', id: 'create', description: 'Define specific field operations based on reported disaster data.', color: 'bg-red-600' },
    { icon: 'fas fa-user-plus', label: 'Assign Volunteers', id: 'assign', description: 'Match open tasks with nearby available volunteers.', color: 'bg-blue-600' },
    { icon: 'fas fa-comments', label: 'Communicate with Volunteer', id: 'chat', description: 'Tactical messaging with field teams for mission updates.', color: 'bg-indigo-600' },
    { icon: 'fas fa-clipboard-list', label: 'Monitor Task Progress', id: 'monitor', description: 'Track the status of all missions assigned by your organization.', color: 'bg-green-600' },
    { icon: 'fas fa-users-viewfinder', label: 'Volunteer Availability', id: 'availability', description: 'View real-time deployment status of field volunteers.', color: 'bg-purple-600' },
    { icon: 'fas fa-box-open', label: 'Request Govt Resources', id: 'resources', description: 'Submit requisitions for official government aid and logistics.', color: 'bg-orange-600' },
  ];

  const filteredChats = chats.filter(c => 
    (c.senderId === user.id && c.receiverId === selectedVolunteer?.id) ||
    (c.senderId === selectedVolunteer?.id && c.receiverId === user.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <DashboardLayout user={user} onLogout={onLogout} activeTab={activeTab} setActiveTab={setActiveTab} navItems={navItems}>
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
           <h3 className="text-2xl font-bold mb-8">New Mission Definition</h3>
           <form onSubmit={handleCreateTask} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Disaster</label>
                <select value={selectedDisaster} onChange={(e) => setSelectedDisaster(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl" required>
                  <option value="">Select Disaster Event</option>
                  {disasters.map(d => <option key={d.id} value={d.id}>{d.type} at {d.location}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Field Task Description</label>
                <textarea value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} rows={4} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl" placeholder="Describe mission..." required></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition shadow-xl shadow-red-100">Deploy Task</button>
           </form>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-[650px]">
          {/* Volunteer Sidebar */}
          <div className="md:col-span-1 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-black text-xl text-indigo-900 tracking-tight">Field Personnel</h3>
              <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-widest">Active Volunteers</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {volunteers.map(v => (
                <button 
                  key={v.id} 
                  onClick={() => setSelectedVolunteer(v)}
                  className={`w-full flex items-center gap-4 p-6 hover:bg-indigo-50 transition border-b border-gray-50 text-left ${selectedVolunteer?.id === v.id ? 'bg-indigo-50/50 border-indigo-100' : ''}`}
                >
                  <div className="relative">
                    <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-black text-lg">
                      {v.name.charAt(0)}
                    </div>
                    {v.isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-sm"></div>}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-900 truncate">{v.name}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                      {v.isOnline ? 'Online • In Field' : 'Offline • On Standby'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Messaging Canvas */}
          <div className="md:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col overflow-hidden">
            {selectedVolunteer ? (
              <>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black">
                      {selectedVolunteer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-lg leading-tight">{selectedVolunteer.name}</h4>
                      <p className="text-[10px] opacity-70 uppercase font-black tracking-widest">Tactical Coordinator Link</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition">
                      <i className="fas fa-phone"></i>
                    </button>
                    <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition">
                      <i className="fas fa-video"></i>
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                  {filteredChats.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-5 rounded-3xl text-sm shadow-sm ${
                        msg.senderId === user.id 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center gap-2 mt-3 text-[9px] font-black uppercase ${msg.senderId === user.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.senderId === user.id && <i className="fas fa-check-double"></i>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredChats.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i className="fas fa-paper-plane text-2xl"></i>
                      </div>
                      <p className="font-bold">No tactical messages yet.</p>
                      <p className="text-xs">Send a direct message to coordinate with {selectedVolunteer.name}.</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-100 bg-white flex gap-4">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Update ${selectedVolunteer.name.split(' ')[0]} on mission goals...`} 
                    className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                  />
                  <button type="submit" className="px-8 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">
                    <i className="fas fa-paper-plane mr-2"></i>
                    <span className="font-bold uppercase text-xs tracking-widest">Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-gray-50/20">
                <div className="w-32 h-32 bg-indigo-50 rounded-[3rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                  <i className="fas fa-comments-medical text-indigo-400 text-5xl"></i>
                </div>
                <h3 className="font-black text-gray-900 text-3xl tracking-tighter uppercase mb-4">Field Command Center</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-lg leading-relaxed">
                  Select a volunteer from the deployment list to open a secure tactical channel.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'assign' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {tasks.filter(t => !t.volunteerId).map(t => (
            <div key={t.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <h4 className="font-bold text-xl text-gray-900 mb-2">{t.description}</h4>
                <p className="text-sm text-gray-500 mb-6">Mission ID: #{t.id.slice(-5)}</p>
                <div className="flex flex-wrap gap-3">
                   {volunteers.filter(v => v.isOnline).map(v => (
                     <button key={v.id} className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-600 hover:text-white transition">Assign {v.name}</button>
                   ))}
                </div>
              </div>
              <div className="w-full md:w-48 p-4 bg-gray-50 rounded-2xl text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                 <span className="text-xs font-bold text-red-600">Pending Assignment</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'monitor' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-[0.2em]"><tr className="border-b border-gray-100"><th className="px-8 py-6">Mission</th><th className="px-8 py-6">Personnel</th><th className="px-8 py-6">Status</th><th className="px-8 py-6">Date</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition"><td className="px-8 py-6"><p className="font-bold text-gray-900">{t.description}</p></td><td className="px-8 py-6 text-sm text-gray-600">{volunteers.find(v => v.id === t.volunteerId)?.name || 'Deployment Pending'}</td><td className="px-8 py-6"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.status === 'Completed' ? 'bg-green-100 text-green-700' : t.status === 'Accepted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{t.status}</span></td><td className="px-8 py-6 text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'availability' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {volunteers.map(v => (
            <div key={v.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
               <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center relative">
                 <i className="fas fa-user-tie text-gray-400 text-2xl"></i>
                 <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white ${v.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
               </div>
               <div><p className="font-bold text-gray-900">{v.name}</p><p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{v.isOnline ? 'On Duty' : 'Resting'}</p></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="max-w-4xl mx-auto space-y-10">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
              <h3 className="font-bold text-xl mb-6">Request Government Resources</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Item Type" className="px-4 py-3 bg-gray-50 rounded-xl" />
                <input placeholder="Quantity" className="px-4 py-3 bg-gray-50 rounded-xl" />
                <button className="md:col-span-2 py-3 bg-orange-600 text-white font-bold rounded-xl">Submit Requisition</button>
              </form>
           </div>
           <div className="space-y-4">
              <h4 className="font-bold text-lg">Active Requisitions</h4>
              {requests.map(r => (
                <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center">
                   <div>
                     <p className="font-bold text-gray-900">{r.quantity} {r.type}</p>
                     <p className="text-xs text-gray-400">{r.description}</p>
                   </div>
                   <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${r.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
                </div>
              ))}
           </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default NGODashboard;
