export class Customers {
  static customersArr = [];
  constructor(id, name, coordinates) {
    this.id = id;
    this.name = name;
    this.coordinates = coordinates;
  }

  importCustomers(jsonData, city) {
    let customersCounter;
    for (let i = 0; i < jsonData["customers"].length; i++) {
      customersCounter = i + 1;
    }
    while (customersCounter != 0) {
      const customersValues = Object.values(
        jsonData["customers"][customersCounter - 1]
      );
      const customer = new Customers(
        customersValues[0],
        customersValues[1],
        customersValues[2]
      );
      Customers.customersArr.unshift(customer);
      const customerCoordiantesObj = customer.coordinates;
      const customerX = Object.values(customerCoordiantesObj)[0];
      const customerY = Object.values(customerCoordiantesObj)[1];
      for (let x = 0; x <= city.x; x++) {
        if (customerX === x) {
          for (let y = 0; y <= city.y; y++) {
            if (customerY === y) {
              city.cityMap[x - 1][y - 1] = "C";
            }
          }
        }
      }
      customersCounter--;
    }
  }
}
