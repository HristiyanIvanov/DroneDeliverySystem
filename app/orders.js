export class Orders {
  static allProductsFromOrders = new Set();
  static ordersArr = [];
  constructor(id, productList) {
    this.id = id;
    this.productList = productList;
  }
  importOrders(jsonData) {
    let ordersCounter;
    for (let i = 0; i < jsonData["orders"].length; i++) {
      ordersCounter = i + 1;
    }
    while (ordersCounter != 0) {
      const orderValues = Object.values(jsonData["orders"][ordersCounter - 1]);
      const order = new Orders(orderValues[0], orderValues[1]);
      Orders.ordersArr.unshift(order);
      ordersCounter--;

      for (const [key, value] of Object.entries(order.productList)) {
        Orders.allProductsFromOrders.add(key);
        // console.log(`Customer ID: ${order.id} | ${key}: ${value}`);
      }
      // console.log("---");
    }
  }
}
