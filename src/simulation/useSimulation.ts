import { useState, useEffect, useRef, useCallback } from 'react';
import type { 
  SimulationSettings, SimulationStats, Driver, Order, Restaurant, 
  TrafficZone
} from './types';

const WS_URL = 'ws://localhost:8765/ws';

const DEFAULT_SETTINGS: SimulationSettings = {
  driverCount: 5,
  maxOrders: 50,
  driverSpeedPercent: 100,
  trafficLevel: 'low',
  algorithm: 'smart',
  weather: 'sunny',
  orderPriority: 'normal',
  orderFrequency: 'normal'
};

const DEFAULT_STATS: SimulationStats = {
  totalOrders: 0,
  completedOrders: 0,
  delayedOrders: 0,
  canceledOrders: 0,
  pendingOrders: 0,
  avgDeliveryTime: 0,
  fastestDelivery: 0,
  slowestDelivery: 0,
  driverStatuses: { idle: 5, busy: 0, returning: 0 },
  algorithmComparison: {
    random: { avgDeliveryTime: 0, completedCount: 0, delayedCount: 0, utilizationRate: 0, totalDeliveryTimeSum: 0 },
    nearest: { avgDeliveryTime: 0, completedCount: 0, delayedCount: 0, utilizationRate: 0, totalDeliveryTimeSum: 0 },
    smart: { avgDeliveryTime: 0, completedCount: 0, delayedCount: 0, utilizationRate: 0, totalDeliveryTimeSum: 0 },
  }
};

export const useSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [settings, setSettings] = useState<SimulationSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<SimulationStats>(DEFAULT_STATS);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [trafficZones, setTrafficZones] = useState<TrafficZone[]>([
    { id: 'tz1', x: 300, y: 250, radius: 80, intensity: 0.7 }
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<any>(null);

  // Connect to Python WebSocket server
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('✅ Python simülasyon motoruna bağlandı');
      // Send current settings on connect
      ws.send(JSON.stringify({ type: 'updateSettings', settings }));
    };

    ws.onmessage = (event) => {
      try {
        const state = JSON.parse(event.data);
        
        // Update all state from Python backend
        if (state.simulationTime !== undefined) setSimulationTime(state.simulationTime);
        if (state.isRunning !== undefined) setIsRunning(state.isRunning);
        if (state.drivers) setDrivers(state.drivers);
        if (state.orders) setOrders(state.orders);
        if (state.restaurants) setRestaurants(state.restaurants);
        if (state.stats) setStats(state.stats);
        if (state.settings) {
          setSettings(prev => ({ ...prev, ...state.settings }));
        }
        if (state.trafficZones) setTrafficZones(state.trafficZones);
      } catch (e) {
        console.error('WebSocket mesaj hatası:', e);
      }
    };

    ws.onclose = () => {
      console.log('⚠️ Python bağlantısı koptu, yeniden bağlanılıyor...');
      reconnectTimerRef.current = setTimeout(connect, 2000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket hatası:', err);
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  // Send command helper
  const sendCommand = useCallback((command: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(command));
    }
  }, []);

  // Sync settings changes to Python backend
  const updateSettings = useCallback((newSettings: SimulationSettings) => {
    setSettings(newSettings);
    sendCommand({ type: 'updateSettings', settings: newSettings });
  }, [sendCommand]);

  // Override setIsRunning to send start/stop to Python backend
  const handleSetIsRunning = useCallback((running: boolean) => {
    setIsRunning(running);
    sendCommand({ type: running ? 'start' : 'stop' });
  }, [sendCommand]);

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    sendCommand({ type: 'reset' });
  }, [sendCommand]);

  return {
    isRunning,
    setIsRunning: handleSetIsRunning,
    simulationTime,
    settings,
    setSettings: updateSettings,
    stats,
    setStats,
    drivers,
    setDrivers,
    orders,
    setOrders,
    restaurants,
    customers: orders
      .filter((o: Order) => o.status !== 'delivered' && o.status !== 'canceled' && o.customer)
      .map((o: Order) => o.customer!),
    trafficZones,
    resetSimulation
  };
};
