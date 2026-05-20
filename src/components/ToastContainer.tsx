import React from 'react';
import { Bell } from 'lucide-react';

export default function ToastContainer() {
  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {/* Mock Toast */}
      <div className="bg-dark-800 border border-dark-700 shadow-lg rounded-lg p-3 w-64 flex items-start gap-3 transform transition-all pointer-events-auto">
        <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center border border-neon-blue shrink-0">
          <Bell size={14} className="text-neon-blue" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-0.5">Sistem Başlatıldı</h4>
          <p className="text-xs text-slate-400 leading-tight">Yemek teslimatı simülasyonu hazır.</p>
        </div>
      </div>
    </div>
  );
}
