
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>

      <div className="relative flex flex-col items-center text-center px-6">
        {/* Animated Logo Container */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-4 bg-red-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition duration-1000 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-200 transform animate-bounce">
            <i className="fas fa-biohazard text-white text-5xl"></i>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          RESQNET
        </h1>
        <div className="h-1 w-12 bg-red-600 rounded-full mb-4 animate-in fade-in zoom-in duration-1000 delay-300"></div>
        <p className="text-lg font-medium text-gray-500 max-w-xs leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
          Emergency Response & <br/> Community Support Network
        </p>
      </div>

      {/* Loading Bar at bottom */}
      <div className="absolute bottom-12 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-red-600 rounded-full animate-[progress_3s_ease-in-out_infinite]"></div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; left: 0%; }
          50% { width: 70%; left: 15%; }
          100% { width: 0%; left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
