export type Coordinate = { x: number; y: number };

export type DriverStatus = 'idle' | 'busy' | 'returning';

export interface Driver {
  id: string;
  name: string;
  status: DriverStatus;
  x: number;
  y: number;
  speed: number;
  assignedOrderId: string | null;
  route: Coordinate[];
  pathIndex: number;
  stats: {
    deliveredCount: number;
    totalDeliveryTime: number;
    activeTime: number; 
  };
}

export type OrderPriority = 'normal' | 'vip';
export type OrderStatus = 'pending' | 'preparing' | 'assigned' | 'picked_up' | 'delivered' | 'delayed' | 'canceled';

export interface Order {
  id: string;
  restaurantId: string;
  customerId: string;
  customer?: Customer;
  status: OrderStatus;
  priority: OrderPriority;
  createdTime: number;
  preparedTime: number | null; 
  assignedTime: number | null;
  pickedUpTime: number | null;
  deliveredTime: number | null;
  estimatedDeliveryTime: number;
  type: string;
  assignedDriverId: string | null;
}

export interface Restaurant {
  id: string;
  name: string;
  x: number;
  y: number;
  cuisine: string;
  nodeId: string; 
}

export interface Customer {
  id: string;
  name: string;
  x: number;
  y: number;
  nodeId: string;
}

export interface TrafficZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number; // 1.0 (normal), 0.8 (medium traffic), 0.6 (high traffic) multiplier
}

export type AlgorithmType = 'random' | 'nearest' | 'smart';
export type TrafficLevel = 'low' | 'medium' | 'high';
export type WeatherType = 'sunny' | 'rainy' | 'snowy';
export type PrioritySetting = 'normal' | 'vip' | 'only_vip';
export type OrderFrequency = 'slow' | 'normal' | 'fast';

export interface SimulationSettings {
  driverCount: number;
  maxOrders: number;
  driverSpeedPercent: number; 
  trafficLevel: TrafficLevel;
  algorithm: AlgorithmType;
  weather: WeatherType;
  orderPriority: PrioritySetting;
  orderFrequency: OrderFrequency;
}

export interface AlgoStats {
  avgDeliveryTime: number;
  completedCount: number;
  delayedCount: number;
  utilizationRate: number;
  totalDeliveryTimeSum: number;
}

export interface SimulationStats {
  totalOrders: number;
  completedOrders: number;
  delayedOrders: number;
  canceledOrders: number;
  pendingOrders: number;
  avgDeliveryTime: number; 
  fastestDelivery: number;
  slowestDelivery: number;
  driverStatuses: { idle: number; busy: number; returning: number };
  algorithmComparison: Record<AlgorithmType, AlgoStats>;
}
