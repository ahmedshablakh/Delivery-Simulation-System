# python_simulation/simulate.py
"""
Python simulation for Delivery Simulation System
------------------------------------------------
This script runs completely independent of the React/TypeScript project.
It generates drivers, restaurants, customers and orders using the same
conceptual model as the web app, but writes the simulation state to a JSON
file that can be consumed by the frontend if desired.

Features:
- Configurable number of drivers, orders, and simulation steps.
- Simple movement logic (random walk) for drivers.
- Order lifecycle: pending -> assigned -> delivered.
- Statistics aggregation (total orders, completed, average delivery time).
- No side‑effects on the existing JS codebase.

Usage:
    python simulate.py [options]

Example:
    python simulate.py --drivers 5 --steps 200 --order-rate 0.5

The generated `simulation_state.json` will be placed in the same folder.
"""
import json, random, argparse, math, time
from pathlib import Path

# ---------------------------------------------------------------------------
# Data structures (mirroring the TS types for clarity)
# ---------------------------------------------------------------------------
class Coordinate:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    def distance(self, other: "Coordinate") -> float:
        return math.hypot(self.x - other.x, self.y - other.y)

class Driver:
    def __init__(self, driver_id: str, start: Coordinate):
        self.id = driver_id
        self.status = "idle"  # idle | busy
        self.pos = start
        self.assigned_order_id = None
        self.stats = {"deliveredCount": 0, "totalDeliveryTime": 0.0, "activeTime": 0.0}
        self.route = []  # List[Coordinate]
        self.route_idx = 0

    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status,
            "x": self.pos.x,
            "y": self.pos.y,
            "assignedOrderId": self.assigned_order_id,
            "stats": self.stats,
        }

class Order:
    def __init__(self, order_id: str, restaurant: Coordinate, customer: Coordinate, created_time: float):
        self.id = order_id
        self.restaurant = restaurant
        self.customer = customer
        self.status = "pending"  # pending | assigned | delivered
        self.created_time = created_time
        self.delivered_time = None
        self.assigned_driver_id = None

    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status,
            "createdTime": self.created_time,
            "deliveredTime": self.delivered_time,
            "restaurant": {"x": self.restaurant.x, "y": self.restaurant.y},
            "customer": {"x": self.customer.x, "y": self.customer.y},
            "assignedDriverId": self.assigned_driver_id,
        }

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------
def random_coordinate(max_x=500, max_y=500):
    return Coordinate(random.uniform(0, max_x), random.uniform(0, max_y))

def move_towards(src: Coordinate, dst: Coordinate, speed: float = 5.0):
    """Move `src` towards `dst` by `speed` units (or stop if we arrive)."""
    dist = src.distance(dst)
    if dist <= speed:
        src.x, src.y = dst.x, dst.y
    else:
        ratio = speed / dist
        src.x += (dst.x - src.x) * ratio
        src.y += (dst.y - src.y) * ratio

# ---------------------------------------------------------------------------
# Simulation core
# ---------------------------------------------------------------------------
class Simulation:
    def __init__(self, driver_count: int, max_steps: int, order_rate: float):
        self.driver_count = driver_count
        self.max_steps = max_steps
        self.order_rate = order_rate  # probability of new order each step
        self.time = 0.0
        self.drivers = []
        self.orders = []
        self.stats = {"totalOrders": 0, "completedOrders": 0, "avgDeliveryTime": 0.0}
        self._init_drivers()
        self._restaurant_coords = [random_coordinate() for _ in range(5)]  # fixed restaurants

    def _init_drivers(self):
        start = Coordinate(250, 250)  # central hub
        for i in range(self.driver_count):
            self.drivers.append(Driver(f"d{i+1}", start))

    def _generate_order(self):
        rest = random.choice(self._restaurant_coords)
        cust = random_coordinate()
        order_id = f"ORD-{int(time.time()*1000)}-{random.randint(1000,9999)}"
        order = Order(order_id, rest, cust, self.time)
        self.orders.append(order)
        self.stats["totalOrders"] += 1

    def _assign_orders(self):
        # simple nearest‑driver assignment for pending orders
        pending = [o for o in self.orders if o.status == "pending"]
        idle_drivers = [d for d in self.drivers if d.status == "idle"]
        for order in pending:
            if not idle_drivers:
                break
            # find driver closest to the restaurant
            best = min(idle_drivers, key=lambda d: d.pos.distance(order.restaurant))
            # build a simple route: restaurant -> customer
            best.route = [order.restaurant, order.customer]
            best.route_idx = 0
            best.status = "busy"
            best.assigned_order_id = order.id
            order.status = "assigned"
            order.assigned_driver_id = best.id
            idle_drivers.remove(best)

    def _move_drivers(self):
        for driver in self.drivers:
            if driver.status != "busy":
                continue
            target = driver.route[driver.route_idx]
            move_towards(driver.pos, target)
            # check arrival
            if driver.pos.distance(target) < 1e-2:
                driver.route_idx += 1
                if driver.route_idx >= len(driver.route):
                    # delivery finished
                    driver.status = "idle"
                    driver.assigned_order_id = None
                    driver.route = []
                    driver.route_idx = 0
                    driver.stats["activeTime"] += 1  # count one simulation step as active
                    # find the order and mark delivered
                    for o in self.orders:
                        if o.id == driver.assigned_order_id:
                            o.status = "delivered"
                            o.delivered_time = self.time
                            delivery_time = o.delivered_time - o.created_time
                            driver.stats["deliveredCount"] += 1
                            driver.stats["totalDeliveryTime"] += delivery_time
                            self.stats["completedOrders"] += 1
                            # update avg delivery time incrementally
                            completed = self.stats["completedOrders"]
                            prev_avg = self.stats["avgDeliveryTime"]
                            self.stats["avgDeliveryTime"] = ((prev_avg * (completed - 1)) + delivery_time) / completed
                            break

    def step(self):
        self.time += 1  # each step = 1 second for simplicity
        # possibly add a new order
        if random.random() < self.order_rate:
            self._generate_order()
        self._assign_orders()
        self._move_drivers()

    def run(self):
        for _ in range(self.max_steps):
            self.step()
        # final state dump
        output = {
            "time": self.time,
            "drivers": [d.to_dict() for d in self.drivers],
            "orders": [o.to_dict() for o in self.orders],
            "stats": self.stats,
        }
        out_path = Path(__file__).with_name("simulation_state.json")
        out_path.write_text(json.dumps(output, indent=2))
        print(f"Simulation finished – state written to {out_path}")

# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run a lightweight Python delivery simulation.")
    parser.add_argument("--drivers", type=int, default=5, help="Number of drivers (default: 5)")
    parser.add_argument("--steps", type=int, default=200, help="Number of simulation steps (default: 200)")
    parser.add_argument("--order-rate", type=float, default=0.5, help="Probability of a new order each step (0‑1, default: 0.5)")
    args = parser.parse_args()
    sim = Simulation(driver_count=args.drivers, max_steps=args.steps, order_rate=args.order_rate)
    sim.run()
