import type { Driver, Coordinate, WeatherType } from './types';

export const moveDriver = (driver: Driver, deltaTime: number, weather: WeatherType): Driver => {
  if (driver.status === 'idle' || driver.route.length === 0 || driver.pathIndex >= driver.route.length) {
    return driver;
  }

  const target = driver.route[driver.pathIndex];
  const dx = target.x - driver.x;
  const dy = target.y - driver.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Hava durumuna göre hız çarpanı
  let weatherMultiplier = 1.0;
  if (weather === 'rainy') weatherMultiplier = 0.8;
  if (weather === 'snowy') weatherMultiplier = 0.6;

  // Hız hesabı
  const step = driver.speed * 100 * (deltaTime / 1000) * weatherMultiplier;

  if (dist <= step) {
    return { 
      ...driver, 
      x: target.x, 
      y: target.y, 
      pathIndex: driver.pathIndex + 1,
      stats: { ...driver.stats, activeTime: driver.stats.activeTime + (deltaTime / 1000) }
    };
  }

  const ratio = step / dist;
  return {
    ...driver,
    x: driver.x + dx * ratio,
    y: driver.y + dy * ratio,
    stats: { ...driver.stats, activeTime: driver.stats.activeTime + (deltaTime / 1000) }
  };
};
