import { DronesType } from "./dronestype.js";

export class Drone extends DronesType {
  static drones = [];
  constructor(capacity, consumption, type, range, location, status, cargo) {
    super(capacity, consumption, type);
    this.range = range;
    this.location = location;
    this.status = status;
    this.cargo = cargo;
  }

  static convertToWatts(capacity) {
    if (capacity.slice(-2, -1) === "k") {
      let kWValue = parseFloat(capacity);
      return kWValue * 1000 + "W";
    } else if (capacity.slice(-1) === "W") {
      return capacity;
    } else {
      console.log(`Invalid capacity format: ${capacity}`);
      return null;
    }
  }

  calculateDroneRange(capacity, consumption) {
    const convertedCapacity = Drone.convertToWatts(capacity);
    return Math.floor(
      convertedCapacity.slice(0, -1) / consumption.slice(0, -1)
    );
  }

  getCargoBasedOnConsumption(consumption, typesOfDrones) {
    const highestConsumption = Math.max(
      ...typesOfDrones.map((drone) => parseInt(drone.consumption))
    );
    if (parseInt(consumption) === highestConsumption) {
      return "BIG";
    } else if (parseInt(consumption) > 0.5 * highestConsumption) {
      return "MEDIUM-SIZED";
    } else {
      return "SMALL";
    }
  }

  createDrone(type, jsonData) {
    const typesOfDrones = jsonData["typesOfDrones"];

    if (type < 1 || type > typesOfDrones.length) {
      console.log(
        `Invalid drone type: ${type} Available types(1-${typesOfDrones.length})`
      );
      return -1;
    }

    const selectedDroneType = typesOfDrones[type - 1];
    const capacityInWatts = Drone.convertToWatts(selectedDroneType.capacity);
    const cargo = this.getCargoBasedOnConsumption(
      selectedDroneType.consumption,
      typesOfDrones
    );
    const range = this.calculateDroneRange(
      selectedDroneType.capacity,
      selectedDroneType.consumption
    );
    const drone = new Drone(
      capacityInWatts,
      selectedDroneType.consumption,
      selectedDroneType.type,
      range,
      "Warehouse",
      "standBy",
      cargo
    );

    Drone.drones.unshift(drone);
    console.log(`Drone created successfully. | Cargo: ${cargo}`);
  }
}
