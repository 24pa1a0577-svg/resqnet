
import React, { useState, useEffect } from 'react';
import { User, Disaster, UserRole, ResourceRequest, EmergencyAlert, Severity, ChatMessage, Task } from '../../types';
import DashboardLayout from './DashboardLayout';
import { storage, DISASTERS_KEY, REQUESTS_KEY, USERS_KEY, ALERTS_KEY, CHATS_KEY, TASKS_KEY } from '../../services/mockData';
import { getAIInsights } from '../../services/geminiService';

const GovernmentDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [ngos, setNgos] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [aiBriefing, setAiBriefing] = useState('Initializing AI intelligence nodes...');
  
  // Chat state
  const [selectedNGO, setSelectedNGO] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Alert state
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const dData = storage.get<Disaster[]>(DISASTERS_KEY, []);
    setDisasters(dData);
    setRequests(storage.get<ResourceRequest[]>(REQUESTS_KEY, []));
    setNgos(storage.get<User[]>(USERS_KEY, []).filter(u => u.role === UserRole.NGO));
    setChats(storage.get<ChatMessage[]>(CHATS_KEY, []));
    setTasks(storage.get<Task[]>(TASKS_KEY, []));
    getAIInsights(dData).then(setAiBriefing);
  }, []);

  const handleIssueAlert = () => {
    if (!alertMsg) return;
    const newAlert: EmergencyAlert = {
      id: `a-${Date.now()}`,
      title: 'OFFICIAL GOVERNMENT ADVISORY',
      message: alertMsg,
      severity: Severity.HIGH,
      issuer: user.name,
      createdAt: new Date()
    };
    const current = storage.get<EmergencyAlert[]>(ALERTS_KEY, []);
    storage.set(ALERTS_KEY, [newAlert, ...current]);
    setAlertMsg('');
    alert('Public Alert Dispatched Successfully!');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedNGO) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: selectedNGO.id,
      text: newMessage,
      timestamp: new Date()
    };
    const updated = [...chats, msg];
    setChats(updated);
    storage.set(CHATS_KEY, updated);
    setNewMessage('');
  };

  const navItems = [
    { icon: 'fas fa-chart-line', label: 'Real-Time Disaster Overview', id: 'overview', description: 'Global view of all active disasters and response statuses.', color: 'bg-red-600' },
    { icon: 'fas fa-comments', label: 'Communicate with NGOs', id: 'ngo-chat', description: 'Direct strategic coordination with registered NGO leaders.', color: 'bg-purple-600' },
    { icon: 'fas fa-stopwatch-20', label: 'Track Report Time & Coverage', id: 'metrics', description: 'Monitor reporting efficiency and geographical resource coverage.', color: 'bg-indigo-600' },
    { icon: 'fas fa-truck-ramp-box', label: 'Approve Resource Requests', id: 'requests', description: 'Review and authorize supply requisitions from NGOs.', color: 'bg-orange-500' },
    { icon: 'fas fa-satellite-dish', label: 'Issue Public Alerts', id: 'alerts', description: 'Broadcast emergency safety warnings to the entire population.', color: 'bg-pink-600' },
  ];

  const filteredChats = chats.filter(c => 
    (c.senderId === user.id && c.receiverId === selectedNGO?.id) ||
    (c.senderId === selectedNGO?.id && c.receiverId === user.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Logic for Metrics
  const getMetricsData = () => {
    return disasters.map(d => {
      const relatedTasks = tasks.filter(t => t.disasterId === d.id);
      const coverage = d.severity === Severity.CRITICAL ? Math.min(relatedTasks.length * 35, 100) : Math.min(relatedTasks.length * 50, 100);
      const reportTime = "12m 4s"; // Mocked calculation
      return { ...d, coverage, reportTime };
    });
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout} activeTab={activeTab} setActiveTab={setActiveTab} navItems={navItems}>
      {activeTab === 'overview' && (
        <div className="space-y-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Zones', value: disasters.length, icon: 'fa-map-pin', color: 'text-red-600' },
              { label: 'NGOs Live', value: ngos.length, icon: 'fa-building', color: 'text-blue-600' },
              { label: 'Field Responders', value: 892, icon: 'fa-users', color: 'text-green-600' },
              { label: 'Reports Today', value: 45, icon: 'fa-bullhorn', color: 'text-orange-600' },
            ].map((s, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${s.color}`}><i className={`fas ${s.icon} text-xl`}></i></div>
                <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{s.label}</p><p className={`text-2xl font-black ${s.color}`}>{s.value}</p></div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-br from-red-600 to-red-800 p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
            <h3 className="font-bold text-2xl mb-3 flex items-center gap-3"><i className="fas fa-robot"></i> AI Situational Briefing</h3>
            <p className="text-red-50 text-xl leading-relaxed italic">"{aiBriefing}"</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl mb-8 flex items-center gap-3"><i className="fas fa-satellite text-red-600"></i> Active Crisis Feeds</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
              {disasters.map(d => (
                <div key={d.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group">
                  <div><p className="font-black text-gray-900 group-hover:text-red-600">{d.type}</p><p className="text-xs text-gray-500 font-medium">{d.location}</p></div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${d.severity === Severity.CRITICAL ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{d.severity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ngo-chat' && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-[650px]">
          <div className="md:col-span-1 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-black text-xl text-purple-900 tracking-tight">NGO Leaders</h3>
              <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-widest">Authorized Entities</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {ngos.map(ngo => (
                <button 
                  key={ngo.id} 
                  onClick={() => setSelectedNGO(ngo)}
                  className={`w-full flex items-center gap-4 p-6 hover:bg-purple-50 transition border-b border-gray-50 text-left ${selectedNGO?.id === ngo.id ? 'bg-purple-50 border-purple-100' : ''}`}
                >
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner">
                    {ngo.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{ngo.name}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase">Registered NGO</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col overflow-hidden">
            {selectedNGO ? (
              <>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-700 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black">
                      {selectedNGO.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-lg leading-tight">{selectedNGO.name}</h4>
                      <p className="text-[10px] opacity-70 uppercase font-black tracking-widest">Strategic Link: Gov Official Mike</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                  {filteredChats.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-5 rounded-3xl text-sm shadow-sm ${
                        msg.senderId === user.id 
                          ? 'bg-purple-700 text-white rounded-tr-none' 
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center gap-2 mt-3 text-[9px] font-black uppercase ${msg.senderId === user.id ? 'text-purple-200' : 'text-gray-400'}`}>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-100 bg-white flex gap-4">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Direct directive to ${selectedNGO.name}...`} 
                    className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-50 outline-none transition-all"
                  />
                  <button type="submit" className="px-8 bg-purple-700 text-white rounded-2xl flex items-center justify-center hover:bg-purple-800 transition shadow-xl shadow-purple-100">
                    <i className="fas fa-paper-plane mr-2"></i>
                    <span className="font-bold uppercase text-xs tracking-widest">Dispatch</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-gray-50/20">
                <div className="w-32 h-32 bg-purple-50 rounded-[3rem] flex items-center justify-center mb-10">
                  <i className="fas fa-handshake-angle text-purple-400 text-5xl"></i>
                </div>
                <h3 className="font-black text-gray-900 text-3xl tracking-tighter uppercase mb-4">NGO Strategic Channel</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-lg leading-relaxed">
                  Select an NGO from the registry to open a high-level coordination channel.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Efficiency Monitoring</h3>
                <p className="text-sm text-gray-500">Tracking response lag and personnel coverage across sectors.</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Avg Report Lag</p>
                  <p className="text-xl font-black text-indigo-600">8m 12s</p>
                </div>
                <div className="w-[1px] h-10 bg-gray-100"></div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase">System Integrity</p>
                  <p className="text-xl font-black text-green-600">99.8%</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-6">Incident</th>
                    <th className="px-8 py-6">Report Lag</th>
                    <th className="px-8 py-6">Coverage Status</th>
                    <th className="px-8 py-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {getMetricsData().map(d => (
                    <tr key={d.id} className="hover:bg-indigo-50/30 transition">
                      <td className="px-8 py-6">
                        <p className="font-bold text-gray-900">{d.type}</p>
                        <p className="text-xs text-gray-400">{d.location}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${d.severity === Severity.CRITICAL ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700'}`}>
                          {d.reportTime}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                            <div className={`h-full rounded-full ${d.coverage > 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${d.coverage}%` }}></div>
                          </div>
                          <span className="text-xs font-black text-gray-700">{d.coverage}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Sector Audit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="max-w-5xl mx-auto space-y-6">
           <h3 className="text-2xl font-bold mb-6">NGO Resource Requisitions</h3>
           {requests.map(r => (
             <div key={r.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded">{ngos.find(n => n.id === r.ngoId)?.name}</span>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-xl text-gray-900">{r.quantity} {r.type}</h4>
                  <p className="text-gray-500 text-sm mt-1">{r.description}</p>
                </div>
                <div className="flex gap-3">
                  {r.status === 'Pending' ? (
                    <>
                      <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100">Approve</button>
                      <button className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl">Reject</button>
                    </>
                  ) : (
                    <span className="px-6 py-3 bg-green-50 text-green-600 font-bold rounded-2xl">Fulfilled Request</span>
                  )}
                </div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] shadow-xl border-4 border-pink-50 text-center">
          <div className="w-20 h-20 bg-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-pink-200"><i className="fas fa-broadcast-tower text-white text-3xl"></i></div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Mass Emergency Broadcast</h2>
          <textarea value={alertMsg} onChange={(e) => setAlertMsg(e.target.value)} rows={6} className="w-full px-8 py-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] focus:ring-8 focus:ring-pink-50 focus:border-pink-600 transition outline-none text-lg font-medium" placeholder="Compose emergency advisory details..."></textarea>
          <button onClick={handleIssueAlert} className="w-full py-6 bg-pink-600 text-white rounded-[2rem] font-black text-xl hover:bg-pink-700 transition flex items-center justify-center gap-4 shadow-2xl shadow-pink-200 mt-6 uppercase">Dispatch Alert</button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default GovernmentDashboard;
