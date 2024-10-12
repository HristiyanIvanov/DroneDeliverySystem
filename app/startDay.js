// IMPORTS
import jsonData from "../input.json" assert { type: "json" };
import { City } from "./city.js";
import { Warehouse } from "./warehouse.js";
import { Customers } from "./customers.js";
import { Orders } from "./orders.js";
import { Drone } from "./drones.js";

function runForDuration(minutes) {
  return minutes * 60 * 1000;
}

export function startDay(config) {
  const orders = new Orders();
  orders.importOrders(jsonData);
  checkAndAddNewOrders();
  function checkAndAddNewOrders() {
    const newOrders = config.newOrders || [];

    if (newOrders.length > 0) {
      newOrders.forEach((newOrder) => {
        if (newOrder.customerID && newOrder.productList) {
          const order = new Orders(newOrder.customerID, newOrder.productList);
          Orders.ordersArr.unshift(order);
          console.log(`New order added for customer ${newOrder.customerID}`);
        } else {
          console.log(`Invalid new order format: ${JSON.stringify(newOrder)}`);
        }
      });

      config.newOrders = [];
    }
  }
  // const workingDay = 720;
  const city = new City();
  city.importMap(jsonData);
  // city.printCity();
  const warehouse = new Warehouse();
  warehouse.importWarehouses(jsonData, city);

  const customer = new Customers();
  customer.importCustomers(jsonData, city);

  // const orders = new Orders();
  // orders.importOrders(jsonData);
  const drone = new Drone();

  // CALCULATE DISTANCE
  function calculateDistance(x1, y1, x2, y2) {
    if (
      typeof x1 !== "number" ||
      typeof y1 !== "number" ||
      typeof x2 !== "number" ||
      typeof y2 !== "number"
    ) {
      throw new Error("Invalid input: All parameters must be numbers");
    }
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  //FIND COORDINATES IN A CITY MAP
  function findCoordinatesInCityMap(matrix, targetValue) {
    const coordinates = [];
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] === targetValue) {
          coordinates.push([row + 1, col + 1]);
        }
      }
    }

    return coordinates;
  }

  // FIND CLOSEST WAREHOUSE BY CUSTOMER ID
  function findClosestWarehouse(customerID, log = true) {
    const customerCoordinatesList = Customers.customersArr.map((obj) => [
      obj.coordinates.x,
      obj.coordinates.y,
    ]);
    const warehouseCoordinatesList = Warehouse.warehousesArr.map((obj) => ({
      x: obj.x,
      y: obj.y,
      name: obj.name,
    }));

    const customerCoords = customerCoordinatesList[customerID - 1];

    let minDistance = Number.MAX_VALUE;
    let closestWarehouse = null;

    for (const warehouse of warehouseCoordinatesList) {
      const currDistance = calculateDistance(
        customerCoords[0],
        customerCoords[1],
        warehouse.x,
        warehouse.y
      );

      if (currDistance < minDistance) {
        minDistance = currDistance;
        closestWarehouse = {
          x: warehouse.x,
          y: warehouse.y,
          name: warehouse.name,
        };
      }
    }
    if (log) {
      console.log(
        `Closest warehouse near customer with ID ${customerID} is: ${closestWarehouse.name} with coordinates: ${closestWarehouse.x}, ${closestWarehouse.y}`
      );
    }
    return `${closestWarehouse.x}, ${closestWarehouse.y}`;
  }

  //FIND DISTANCE FROM CUSTOMER TO WAREHOUSE
  function findDistance(customerID) {
    const customerCoordinatesList = Customers.customersArr.map((obj) => [
      obj.coordinates.x,
      obj.coordinates.y,
    ]);
    const customerCoords = customerCoordinatesList[customerID - 1];
    let closestWarehouse = findClosestWarehouse(customerID, false)
      .split(", ")
      .map(Number);
    const minDistance = calculateDistance(
      customerCoords[0],
      customerCoords[1],
      closestWarehouse[0],
      closestWarehouse[1]
    );
    return Math.ceil(minDistance);
  }

  console.table(Customers.customersArr);
  console.table(Warehouse.warehousesArr);

  //GETTING CUSTOMER ORDERS IN DICT
  let customersOrders = {};
  function exportCustomerOrders(customerID) {
    const customerOrders = {};
    let orderCounter = 0;
    Customers.customersArr.forEach((customer) => {
      if (
        customer.id === customerID &&
        typeof customerID === "number" &&
        customerID > 0
      ) {
        Orders.ordersArr.forEach((order) => {
          if (order.id === customer.id) {
            orderCounter++;
            customerOrders[orderCounter] = order.productList;
            customersOrders[customer.id] = customerOrders;
          }
        });
      }
    });
    return customerOrders;
  }
  //CALCULATE WEIGHT OF GIVEN ORDER LIST
  function calcWeightOfOrder(customerOrders) {
    const arrOrders = [];
    for (let key in customerOrders) {
      let weight = 0;
      if (customerOrders.hasOwnProperty(key)) {
        let value = customerOrders[key];
        let configuredOrder = {};
        for (let productName in value) {
          if (value.hasOwnProperty(productName)) {
            let productQuantity = value[productName];
            // console.log(productQuantity, productName);
            for (let jsonProductName in jsonData.products) {
              if (jsonData.products.hasOwnProperty(jsonProductName)) {
                let jsonProductWeight = jsonData.products[jsonProductName];
                // console.log(jsonProductName);
                if (productName === jsonProductName) {
                  weight += jsonProductWeight * productQuantity;
                }
              }
            }
          }
        }
        configuredOrder["orderID"] = key;
        configuredOrder["weight"] = weight;
        arrOrders.push(configuredOrder);
      }
    }
    return arrOrders;
  }

  // CALCULATING DELIVERY TIME
  let totalOrders = 0;
  function droneDeliveryTime() {
    const exportOrders = customersOrders;

    // Customers.customersArr.forEach((customer) => {
    //   exportCustomerOrders(customer.id);
    // });

    let totalTime = 0;
    let processedOrders = new Set();
    for (let key in exportOrders) {
      let timePerOrder = findDistance(Number(key));

      if (exportOrders.hasOwnProperty(key)) {
        let item = exportOrders[key];

        for (let k of Object.keys(item)) {
          let combination = `${key}-${k}`;

          if (!processedOrders.has(combination)) {
            processedOrders.add(combination);
            totalOrders++;
          }
          // totalTime += ifEnoughBattery();
        }
        totalTime += timePerOrder + 5;
      }
    }

    return `Total time needed for all the orders is: ${totalTime}`;
  }

  function setWarehouseLocationToStarterDrones() {
    const warehouseCoordinatesList = Warehouse.warehousesArr.map((obj) => ({
      x: obj.x,
      y: obj.y,
      name: obj.name,
    }));

    let droneIndex = 0;
    for (let i = 0; i < warehouseCoordinatesList.length; i++) {
      const currentWarehouse = warehouseCoordinatesList[i];

      for (let type = 1; type <= 3; type++) {
        drone.createDrone(type, jsonData);
        Drone.drones[
          droneIndex
        ].location = `${currentWarehouse.x}, ${currentWarehouse.y}`;
        // droneIndex++;
      }
    }
    droneIndex++;
  }

  setWarehouseLocationToStarterDrones();

  function droneCheck(droneIndex, param) {
    if (droneIndex < 0 || droneIndex >= Drone.drones.length) {
      console.log(`Invalid drone index: ${droneIndex}`);
      return null;
    }
    const drone = Drone.drones[droneIndex];
    if (param in drone) {
      return drone[param];
    } else {
      console.log(`Invalid parameter: ${param}`);
      return null;
    }
  }

  let suitableDrones = new Set();
  let minDistance;

  function checkDroneCapacity(value, customerID) {
    suitableDrones.clear();
    const closestWarehouse = findClosestWarehouse(customerID, false);
    minDistance = findDistance(customerID);
    let droneType;
    if (value <= 3500) {
      droneType = "SMALL";
    } else if (value <= 5500) {
      droneType = "MEDIUM-SIZED";
    } else {
      droneType = "BIG";
    }

    for (let i = 0; i < Drone.drones.length; i++) {
      // Correct cargo
      const cargo = droneCheck(i, "cargo");
      // If standBy
      const status = droneCheck(i, "status");
      // Closest warehouse
      const location = droneCheck(i, "location");
      // Enough battery
      // const range = droneCheck(i, "range");
      if (
        cargo === droneType &&
        status === "standBy" &&
        location === closestWarehouse
      ) {
        suitableDrones.add(Drone.drones[i]);
      }
    }
    console.log(
      `Order will be delivered by drone with cargo: ${droneType}, Order weight is: ${value}`
    );
    return droneType;
  }

  function searchDrone(customerID) {
    const orderWeight = calcWeightOfOrder(exportCustomerOrders(customerID));
    orderWeight.forEach((order) => {
      for (let key in order) {
        let value = order[key];
        if (key === "weight") {
          const weight = value;
          checkDroneCapacity(weight, customerID);
          const processedOrderKey = findProcessedOrderKey(customerID, 0);
          if (processedOrderKey !== null) {
            removeOrder(customerID, processedOrderKey);
          }
        }
      }
    });
  }

  function findProcessedOrderKey(customerID, orderID) {
    for (let key in customersOrders[customerID]) {
      if (customersOrders[customerID][key].orderID === orderID) {
        return key;
      }
    }
    return null;
  }

  function removeOrder(customerID, orderKey) {
    delete customersOrders[customerID][orderKey];

    let newKey = 1;
    for (let key in customersOrders[customerID]) {
      customersOrders[customerID][newKey] = customersOrders[customerID][key];
      if (newKey !== key) {
        delete customersOrders[customerID][key];
      }
      newKey++;
    }
  }

  function simulateMovement(iteration) {
    console.log("Drone is delivering...");
    console.log("-".repeat(iteration + 1));
  }

  function sendDrone(customerID) {
    // const firstEl = suitableDrones.values().next().value;
    // suitableDrones.delete(firstEl);
    suitableDrones.clear();
    let customerOrders = exportCustomerOrders(customerID);
    let totalDeliveryTime = droneDeliveryTime();
    for (let key in customerOrders) {
      const order = customerOrders[key];
      console.log("Current order");
      console.log(order);

      const orderWeight = calcWeightOfOrder({ [key]: order });
      const droneType = checkDroneCapacity(orderWeight[0].weight, customerID);

      if (droneType && ifEnoughBattery()) {
        sendDroneToCustomer(customerID);
        const processedOrderKey = findProcessedOrderKey(customerID, key);
        if (processedOrderKey !== null) {
          removeOrder(customerID, processedOrderKey);
        }
      }
    }

    console.log(`${totalDeliveryTime}`);
  }
  function sendDroneToCustomer(customerID) {
    const customerCoordinatesList = Customers.customersArr.map((obj) => [
      obj.coordinates.x,
      obj.coordinates.y,
    ]);

    const customerCoords = customerCoordinatesList[customerID - 1];
    const timePerOrder = findDistance(customerID);
    for (let i = 0; i < Drone.drones.length; i++) {
      const cargo = droneCheck(i, "cargo");
      const location = droneCheck(i, "location");
      const status = droneCheck(i, "status");
      for (let drone of suitableDrones) {
        if (
          drone.cargo === cargo &&
          drone.location === location &&
          drone.status === status
        ) {
          drone.location = `${customerCoords[0]}, ${customerCoords[1]}`;
          drone.status = "Already Delivered";
          drone.range = drone.range - timePerOrder;
        }
        resetDroneAfterDelivery(customerID);
        suitableDrones.delete(drone);
        if (suitableDrones.size === 0) {
          suitableDrones.add(drone);
        }
        break;
      }
    }
    simulateMovement(timePerOrder);
    console.log("Order Delivered!");
    console.log(suitableDrones);
    totalOrders++;
  }

  function resetDroneAfterDelivery(customerID) {
    const closestWarehouse = findClosestWarehouse(customerID, false)
      .split(",")
      .map(Number);
    for (let i = 0; i < Drone.drones.length; i++) {
      const location = droneCheck(i, "location");
      const status = droneCheck(i, "status");
      for (let drone of suitableDrones) {
        if (drone.status === status && drone.location === location) {
          drone.location = `${closestWarehouse[0]}, ${closestWarehouse[1]}`;
          drone.status = "standBy";
        }
      }
    }
  }

  function ifEnoughBattery() {
    const distanceToCustomer = minDistance;
    for (let i = 0; i < Drone.drones.length; i++) {
      const cargo = droneCheck(i, "cargo");
      for (let drone of suitableDrones) {
        if (drone.cargo === cargo && distanceToCustomer > drone.range) {
          console.log(`Drone is out of range. Charging at the warehouse.`);
          chargeDrone(drone);
        }
      }
    }
    return true;
  }

  function chargeDrone(drone) {
    const convertedCapacity = Drone.convertToWatts(drone.capacity);
    drone.range = Math.floor(
      convertedCapacity.slice(0, -1) / drone.consumption.slice(0, -1)
    );
    drone.status = "Charging";
    console.log(drone);
    return false;
  }
  // function ifEnoughTime(customerID) {
  //   const timeForDelivery = findDistance(customerID);
  //   if (timeForDelivery <= workingDay) {
  //     return true;
  //   } else {
  //     console.log("Order can't be processed today!");
  //     return false;
  //   }
  // }

  function printAllOrders(customerID) {
    const customerOrders = exportCustomerOrders(customerID);
    console.log("");
    console.log("All orders of the current customer");

    console.table(customerOrders);
  }

  function processOrders() {
    console.table(Drone.drones);
    console.log("Processing orders...");
    Customers.customersArr.forEach((customer) => {
      console.log(`Processing customer ${customer.id}`);
      printAllOrders(customer.id);
      sendDrone(customer.id);
    });
  }

  if (config.output.poweredOn) {
    runForDuration(config.output.minutes.program);

    setTimeout(() => {
      processOrders();

      console.log("Program completed in real-time.");
    }, config.output.minutes.real);
  } else {
    runForDuration();
    console.log(
      "Orders from previous day are processed without intermediate drone movements and orders fulfilled."
    );
    processOrders();
  }
}
