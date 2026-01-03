
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-2 rounded-lg">
            <i className="fas fa-biohazard text-white text-xl"></i>
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-800">RESQNET</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-2 rounded-full border border-gray-300 font-medium hover:bg-gray-100 transition"
        >
          Login
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-12 max-w-7xl mx-auto w-full">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
            Resilient Communities, <br/>
            <span className="text-red-600">Rapid Response.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            A unified platform for disaster management, connecting citizens with the help they need through efficient volunteer coordination and government oversight.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
            <button 
              onClick={() => navigate('/role-selection')}
              className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition shadow-lg shadow-red-200"
            >
              Get Started
            </button>
            <button className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition">
              View Live Map
            </button>
          </div>
          <div className="flex items-center gap-8 pt-8 justify-center lg:justify-start">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">5k+</p>
              <p className="text-sm text-gray-500 uppercase tracking-widest">Responders</p>
            </div>
            <div className="h-10 w-[1px] bg-gray-200"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">12k+</p>
              <p className="text-sm text-gray-500 uppercase tracking-widest">Lives Impacted</p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-xl">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-400 rounded-2xl blur opacity-25"></div>
            <img 
              src="https://picsum.photos/seed/disaster/800/600" 
              alt="Disaster Response" 
              className="relative rounded-2xl shadow-2xl object-cover h-[400px] w-full"
            />
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">Integrated Support Network</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon="fas fa-bullhorn" 
              title="Real-time Reporting" 
              desc="Citizens can instantly report disasters with location and severity tagging." 
            />
            <FeatureCard 
              icon="fas fa-users-gear" 
              title="Task Allocation" 
              desc="NGOs efficiently assign field tasks to available nearby volunteers." 
            />
            <FeatureCard 
              icon="fas fa-shield-halved" 
              title="Gov Oversight" 
              desc="Officials monitor the entire situation and approve critical resource requests." 
            />
            <FeatureCard 
              icon="fas fa-robot" 
              title="AI Briefing" 
              desc="Smart summaries help responders understand priorities in seconds." 
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
      <i className={`${icon} text-red-600 text-xl`}></i>
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
