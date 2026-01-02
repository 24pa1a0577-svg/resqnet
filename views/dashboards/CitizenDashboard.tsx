
import React, { useState, useEffect, useRef } from 'react';
import { User, Disaster, DisasterStatus, Severity, EmergencyAlert, HelpRequest, ChatMessage, UserRole } from '../../types';
import DashboardLayout from './DashboardLayout';
import { storage, DISASTERS_KEY, ALERTS_KEY, HELP_REQUESTS_KEY, USERS_KEY, CHATS_KEY } from '../../services/mockData';
import { evaluateDisasterSeverity } from '../../services/geminiService';

declare const L: any; // Leaflet global

const CitizenDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Form states
  const [reportType, setReportType] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoc, setReportLoc] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  // Map state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setDisasters(storage.get<Disaster[]>(DISASTERS_KEY, []));
    setAlerts(storage.get<EmergencyAlert[]>(ALERTS_KEY, []));
    setHelpRequests(storage.get<HelpRequest[]>(HELP_REQUESTS_KEY, []));
    setVolunteers(storage.get<User[]>(USERS_KEY, []).filter(u => u.role === UserRole.VOLUNTEER));
    setChats(storage.get<ChatMessage[]>(CHATS_KEY, []));
  }, []);

  // Initialize Real Map
  useEffect(() => {
    if (activeTab === 'nearby' && mapContainerRef.current && !mapRef.current) {
      // Initialize map centered on a hypothetical location
      mapRef.current = L.map(mapContainerRef.current).setView([40.7128, -74.0060], 13);
      
      // Use CartoDB Positron for a clean, professional "Real Map" look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);

      // Add Disaster Markers
      disasters.forEach((d, index) => {
        // Distribute markers slightly for demo purposes
        const lat = 40.7128 + (Math.random() - 0.5) * 0.04;
        const lng = -74.0060 + (Math.random() - 0.5) * 0.04;

        const severityClass = d.severity === Severity.CRITICAL ? 'marker-critical' : 
                            d.severity === Severity.HIGH ? 'marker-high' : 'marker-medium';
        
        const iconHtml = `
          <div class="relative">
            ${d.severity === Severity.CRITICAL ? '<div class="pulse-ring"></div>' : ''}
            <div class="custom-marker ${severityClass}">
              <i class="fas ${d.type === 'Flood' ? 'fa-water' : 'fa-fire'} text-xs"></i>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-leaflet-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const popupContent = `
          <div class="p-2">
            <h4 class="font-black text-sm text-gray-900 uppercase tracking-tight mb-1">${d.type}</h4>
            <p class="text-[10px] text-gray-500 mb-2">${d.location}</p>
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-bold px-2 py-0.5 rounded ${severityClass.replace('marker-', 'bg-')} bg-opacity-10 ${severityClass.replace('marker-', 'text-')}">${d.severity}</span>
              <span class="text-[9px] text-gray-400 font-medium">${new Date(d.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        `;

        L.marker([lat, lng], { icon: customIcon })
          .addTo(mapRef.current)
          .bindPopup(popupContent);
      });

      // Simulated Evacuation Route
      const routePoints = [
        [40.7300, -74.0200],
        [40.7200, -74.0100],
        [40.7100, -73.9900]
      ];
      L.polyline(routePoints, {
        color: '#10b981',
        weight: 5,
        opacity: 0.6,
        dashArray: '10, 10',
        lineJoin: 'round'
      }).addTo(mapRef.current);
    }

    return () => {
      if (activeTab !== 'nearby' && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab, disasters]);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReporting(true);
    const severity = await evaluateDisasterSeverity(reportDesc) as Severity;
    const newDisaster: Disaster = {
      id: `d-${Date.now()}`,
      type: reportType,
      description: reportDesc,
      location: reportLoc,
      severity: severity,
      status: DisasterStatus.REPORTED,
      reportedBy: user.id,
      createdAt: new Date()
    };
    const updated = [newDisaster, ...disasters];
    storage.set(DISASTERS_KEY, updated);
    setDisasters(updated);
    setReportType('');
    setReportDesc('');
    setReportLoc('');
    setIsReporting(false);
    setActiveTab('track');
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
    { 
      icon: 'fas fa-plus-circle', 
      label: 'Report Disaster', 
      id: 'report', 
      description: 'Notify emergency services about a new disaster in your area.',
      color: 'bg-red-600'
    },
    { 
      icon: 'fas fa-hand-holding-medical', 
      label: 'Request Help', 
      id: 'help', 
      description: 'Ask for medical, food, or rescue assistance for yourself or others.',
      color: 'bg-orange-500'
    },
    { 
      icon: 'fas fa-comments', 
      label: 'Communicate with Volunteer', 
      id: 'chat', 
      description: 'Connect directly with field volunteers for real-time status updates.',
      color: 'bg-teal-600'
    },
    { 
      icon: 'fas fa-list-check', 
      label: 'Track My Requests', 
      id: 'track', 
      description: 'Monitor the real-time status of your reports and help requests.',
      color: 'bg-blue-600'
    },
    { 
      icon: 'fas fa-map-location-dot', 
      label: 'Nearby Disasters', 
      id: 'nearby', 
      description: 'View active disaster zones and evacuation routes on a real interactive map.',
      color: 'bg-green-600'
    },
    { 
      icon: 'fas fa-triangle-exclamation', 
      label: 'Emergency Alerts', 
      id: 'alerts', 
      description: 'Receive official safety broadcasts and storm warnings.',
      color: 'bg-purple-600'
    },
  ];

  const filteredChats = chats.filter(c => 
    (c.senderId === user.id && c.receiverId === selectedVolunteer?.id) ||
    (c.senderId === selectedVolunteer?.id && c.receiverId === user.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <DashboardLayout 
      user={user} 
      onLogout={onLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      navItems={navItems}
    >
      {activeTab === 'report' && (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <form onSubmit={handleReport} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Disaster Type</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 transition" required>
                  <option value="">Select Type</option>
                  <option value="Flood">Flood</option>
                  <option value="Fire">Fire</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Structural Damage">Structural Damage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                <input type="text" value={reportLoc} onChange={(e) => setReportLoc(e.target.value)} placeholder="e.g. Street 5, Downtown" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 transition" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea rows={4} value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} placeholder="Briefly describe the situation..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 transition" required></textarea>
            </div>
            <button disabled={isReporting} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg shadow-red-200">
              {isReporting ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-paper-plane"></i>}
              {isReporting ? 'Submitting Report...' : 'Submit Emergency Report'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          <div className="md:col-span-1 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">Active Volunteers</h3>
              <p className="text-xs text-gray-500 mt-1">Available for live coordination</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {volunteers.map(v => (
                <button 
                  key={v.id} 
                  onClick={() => setSelectedVolunteer(v)}
                  className={`w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition border-b border-gray-50 text-left ${selectedVolunteer?.id === v.id ? 'bg-teal-50/50 border-teal-100' : ''}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                      {v.name.charAt(0)}
                    </div>
                    {v.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-900 truncate">{v.name}</p>
                    <p className="text-xs text-gray-400 font-medium tracking-tight uppercase">{v.isOnline ? 'Online' : 'Offline'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
            {selectedVolunteer ? (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-teal-600 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                    {selectedVolunteer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{selectedVolunteer.name}</h4>
                    <p className="text-[10px] opacity-80 uppercase tracking-widest">Field Personnel</p>
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
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.senderId === user.id ? 'text-teal-100' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..." 
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <button type="submit" className="w-12 h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center hover:bg-teal-700 transition shadow-lg shadow-teal-100">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-gray-50/30">
                <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mb-6">
                  <i className="fas fa-comments text-teal-400 text-3xl"></i>
                </div>
                <h3 className="font-bold text-gray-900 text-xl">Direct Messaging</h3>
                <p className="text-gray-500 mt-2 max-w-xs mx-auto">Select a volunteer from the left list to begin coordination in real-time.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'nearby' && (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 h-[600px] bg-slate-100 rounded-[2.5rem] relative overflow-hidden border-8 border-white shadow-2xl z-0" ref={mapContainerRef}>
             {/* Map renders here via Leaflet */}
          </div>

          <div className="lg:w-1/3 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Live Incidents</h3>
               <span className="px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">Global Sync</span>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
              {disasters.map(d => (
                <div key={d.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${d.severity === Severity.CRITICAL ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                          <i className={`fas ${d.type === 'Flood' ? 'fa-water' : 'fa-fire-flame-curved'} text-lg`}></i>
                       </div>
                       <div>
                          <p className="font-black text-gray-900 text-sm tracking-tight">{d.type}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">{d.status}</p>
                       </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{d.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                     <span className="text-[10px] font-bold text-teal-600 flex items-center gap-2">
                        <i className="fas fa-location-dot"></i> {d.location}
                     </span>
                     <button className="text-[10px] font-black text-red-600 hover:underline uppercase">View Ops</button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Real Map Legend */}
            <div className="mt-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-400">Map Intelligence Legend</h4>
               <div className="space-y-3">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 bg-red-600 rounded-full ring-4 ring-red-100"></div>
                     <span className="text-xs font-bold text-gray-700">Critical Threat Area</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-6 h-1 bg-green-500 rounded-full opacity-60"></div>
                     <span className="text-xs font-bold text-gray-700">Evacuation Pathway</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'help' && (
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex items-center justify-between">
             <p className="text-orange-800 font-medium">Need urgent supplies or rescue? Submit a help request below.</p>
             <button className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold text-sm">Create New Request</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {helpRequests.map(req => (
                <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${req.status === 'Fulfilled' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{req.status}</span>
                    <span className="text-xs text-gray-400">{req.type} Request</span>
                  </div>
                  <p className="font-bold text-gray-900 mb-1">{req.description}</p>
                  <p className="text-sm text-gray-500 mb-4"><i className="fas fa-location-dot mr-1"></i>{req.location}</p>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'track' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {disasters.filter(d => d.reportedBy === user.id).map(d => (
            <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${d.severity === Severity.CRITICAL ? 'bg-red-100 text-red-700' : d.severity === Severity.HIGH ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{d.severity}</span>
                  <span className="text-sm font-bold text-gray-800">{d.type}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{d.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span><i className="fas fa-location-dot mr-1"></i>{d.location}</span>
                  <span><i className="fas fa-clock mr-1"></i>{new Date(d.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-4 py-2 rounded-full text-xs font-bold ${d.status === DisasterStatus.RESOLVED ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{d.status}</span>
                <button className="text-red-600 text-xs font-bold mt-2 hover:underline">View Progress</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map(a => (
            <div key={a.id} className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-600">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-900">{a.title}</h3>
                <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="text-gray-600 mb-6">{a.message}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-xs font-medium text-gray-400">Issued by: {a.issuer}</span>
                <button className="text-red-600 text-xs font-bold hover:bg-red-50 px-3 py-1 rounded transition">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CitizenDashboard;
