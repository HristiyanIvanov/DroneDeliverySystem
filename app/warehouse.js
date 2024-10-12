export class Warehouse {
  static warehousesArr = [];
  constructor(x, y, name) {
    this.x = x;
    this.y = y;
    this.name = name;
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  setName(name) {
    this.name = name;
  }

  importWarehouses(jsonData, city) {
    let counterOfWarehouses;
    for (let i = 0; i < jsonData["warehouses"].length; i++) {
      counterOfWarehouses = i + 1;
    }

    while (counterOfWarehouses != 0) {
      const warehouseValues = Object.values(
        jsonData["warehouses"][counterOfWarehouses - 1]
      );
      const newWarehouse = new Warehouse();
      Warehouse.warehousesArr.push(newWarehouse);
      newWarehouse.setX(warehouseValues[0]);
      newWarehouse.setY(warehouseValues[1]);
      newWarehouse.setName(warehouseValues[2]);
      for (let x = 0; x <= city.y; x++) {
        if (newWarehouse.x === x) {
          for (let y = 0; y <= city.y; y++) {
            if (newWarehouse.y === y) {
              city.cityMap[newWarehouse.x - 1][newWarehouse.y - 1] = "W";
            }
          }
        }
      }
      counterOfWarehouses--;
    }
  }
}
