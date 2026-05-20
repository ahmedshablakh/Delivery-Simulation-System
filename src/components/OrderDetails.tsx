import React from 'react';
import { MapPin, User, Store, Activity, Timer } from 'lucide-react';
import type { Order, Driver, Restaurant } from '../simulation/types';

interface Props {
  orderId: string | null;
  onSelectOrder: (id: string | null) => void;
  orders: Order[];
  drivers: Driver[];
  restaurants: Restaurant[];
  simulationTime: number;
}

export default function OrderDetails({ orderId, onSelectOrder, orders, drivers, restaurants, simulationTime }: Props) {
  // Eğer özel bir sipariş seçilmediyse, her zaman sistemdeki EN SON (en yeni) siparişi canlı olarak göster.
  const order = orderId ? orders.find(o => o.id === orderId) : orders[orders.length - 1]; 

  if (!order) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-500">
        <Activity size={32} className="mb-2 opacity-50" />
        <p className="text-xs text-center">Detayları görmek için bekleyin, sistemde aktif sipariş yok.</p>
      </div>
    );
  }

  const restaurant = restaurants.find(r => r.id === order.restaurantId);
  const driver = drivers.find(d => d.id === order.assignedDriverId);
  const customerName = order.customer?.name || 'Bilinmiyor';

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const waitTime = order.status === 'delivered' && order.deliveredTime 
     ? (order.deliveredTime - order.createdTime) 
     : (simulationTime - order.createdTime);

  const statusColor = 
     order.status === 'pending' ? 'text-neon-pink' :
     order.status === 'assigned' || order.status === 'picked_up' ? 'text-neon-yellow' :
     'text-neon-green';

  const statusText = 
     order.status === 'pending' ? 'Bekliyor' : 
     order.status === 'delivered' ? 'Teslim Edildi' : 'Yolda';

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-bold text-white mb-2 border-b border-dark-700 pb-1 flex justify-between items-center">
        <span>SİPARİŞ DETAYI {orderId ? '(SEÇİLİ)' : '(CANLI)'}</span>
        <div className="flex gap-2">
           {orderId && (
             <button onClick={() => onSelectOrder(null)} className="text-[9px] bg-dark-700 hover:bg-dark-600 px-1.5 py-0.5 rounded text-slate-300">
               Canlıya Dön
             </button>
           )}
           <span className="text-[10px] text-slate-400 bg-dark-900 px-2 py-0.5 rounded border border-dark-700">#{order.id}</span>
        </div>
      </h2>

      <div className="flex flex-col gap-2 mt-1 overflow-y-auto">
        <div className="flex items-start gap-3 bg-dark-900/50 p-2 rounded border border-dark-700/50">
          <Store className="text-neon-yellow mt-0.5" size={16} />
          <div>
            <div className="text-xs text-slate-400">Restoran</div>
            <div className="text-sm text-white font-medium">{restaurant?.name || 'Bilinmiyor'}</div>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-dark-900/50 p-2 rounded border border-dark-700/50">
          <User className="text-neon-green mt-0.5" size={16} />
          <div>
            <div className="text-xs text-slate-400">Müşteri</div>
            <div className="text-sm text-white font-medium">{customerName}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-900 p-2 rounded border border-dark-700">
            <div className="text-[10px] text-slate-400 mb-0.5">Sipariş Durumu</div>
            <div className={`text-xs font-bold uppercase ${statusColor}`}>
              {statusText}
            </div>
          </div>
          <div className="bg-dark-900 p-2 rounded border border-dark-700">
            <div className="text-[10px] text-slate-400 mb-0.5">Atanan Kurye</div>
            <div className="text-xs font-bold text-neon-blue">
              {driver?.name || '-'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-dark-900 p-2 rounded border border-dark-700 flex flex-col items-center justify-center">
             <Timer className="text-neon-purple mb-1" size={16} />
             <div className="text-lg font-mono font-bold text-white">{formatTime(waitTime)}</div>
             <div className="text-[9px] uppercase text-slate-400">{order.status === 'delivered' ? 'Toplam Teslimat Süresi' : 'Siparişin Geçen Süresi'}</div>
          </div>
          
          <div className="bg-dark-900 p-2 rounded border border-dark-700 flex flex-col items-center justify-center">
             <Activity className="text-neon-blue mb-1" size={16} />
             <div className="text-sm font-bold text-white uppercase">{order.priority}</div>
             <div className="text-[9px] uppercase text-slate-400">Öncelik Seviyesi</div>
          </div>
        </div>

        {/* Seçilebilir Sipariş Listesi */}
        <div className="mt-2 border-t border-dark-700 pt-2 flex-1">
           <div className="text-[10px] text-slate-400 mb-1.5 uppercase font-semibold">Tıklanabilir Son Siparişler</div>
           <div className="flex flex-col gap-1">
              {orders.slice(-6).reverse().map(o => (
                  <div 
                    key={o.id} 
                    onClick={() => onSelectOrder(o.id)} 
                    className={`cursor-pointer text-[11px] p-1.5 rounded flex justify-between items-center transition-colors ${o.id === order.id ? 'bg-neon-blue/20 border border-neon-blue' : 'bg-dark-900 border border-dark-700 hover:bg-dark-700'}`}
                  >
                     <span className="font-mono font-bold text-slate-300">#{o.id}</span>
                     <span className={`font-semibold ${o.status === 'delivered' ? 'text-neon-green' : (o.status === 'pending' ? 'text-neon-pink' : 'text-neon-yellow')}`}>
                        {o.status === 'pending' ? 'Bekliyor' : o.status === 'delivered' ? 'Teslim' : 'Yolda'}
                     </span>
                  </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
