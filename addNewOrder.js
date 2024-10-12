import fs from "fs/promises";

export async function addNewOrder(config, customerID, productList) {
  try {
    config.newOrders = config.newOrders || [];
    config.newOrders.push({
      customerID,
      productList,
    });

    const configFilePath = "./input.json";
    await fs.writeFile(
      configFilePath,
      JSON.stringify(config, null, 2),
      "utf-8"
    );
    console.log("Order added successfully");
  } catch (error) {
    console.error("Error adding order:", error);
    throw error;
  }
}
