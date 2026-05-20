import React from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function LiveStats({ stats }: { stats: any }) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold text-white mb-4 border-b border-dark-700 pb-2">CANLI İSTATİSTİKLER</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-dark-900 border border-dark-700 rounded p-3 flex flex-col items-center justify-center">
          <Package className="text-neon-blue mb-1" size={24} />
          <span className="text-xl font-bold text-white">{stats.totalOrders}</span>
          <span className="text-[10px] text-slate-400 uppercase">Toplam Sipariş</span>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded p-3 flex flex-col items-center justify-center">
          <CheckCircle className="text-neon-green mb-1" size={24} />
          <span className="text-xl font-bold text-white">{stats.completedOrders}</span>
          <span className="text-[10px] text-slate-400 uppercase">Teslim Edilen</span>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded p-3 flex flex-col items-center justify-center">
          <Clock className="text-neon-yellow mb-1" size={24} />
          <span className="text-xl font-bold text-white">{stats.pendingOrders}</span>
          <span className="text-[10px] text-slate-400 uppercase">Bekleyen</span>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded p-3 flex flex-col items-center justify-center">
          <XCircle className="text-[#FF0055] mb-1" size={24} />
          <span className="text-xl font-bold text-white">{stats.canceledOrders || 0}</span>
          <span className="text-[10px] text-slate-400 uppercase">İptal Edilen</span>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded p-3 flex flex-col items-center justify-center">
          <Truck className="text-neon-purple mb-1" size={24} />
          <span className="text-xl font-bold text-white">{stats.avgDeliveryTime.toFixed(1)}s</span>
          <span className="text-[10px] text-slate-400 uppercase">Ortalama Süre</span>
        </div>
      </div>

      <div className="flex-1 border border-dark-700 bg-dark-900 rounded p-4 flex flex-col items-center justify-center">
        <h3 className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Kurye Durumu</h3>
        {/* Placeholder for Donut Chart */}
        <div className="w-32 h-32 rounded-full border-8 border-dark-700 border-t-neon-blue border-r-neon-yellow relative flex items-center justify-center">
           <span className="text-sm font-bold text-white">{stats.driverStatuses.idle + stats.driverStatuses.busy} Aktif</span>
        </div>
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-blue"></span> Boş: {stats.driverStatuses.idle}</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-yellow"></span> Meşgul: {stats.driverStatuses.busy}</div>
        </div>
      </div>
    </div>
  );
}
