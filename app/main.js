import { startDay } from "./startDay.js";
import { addNewOrder } from "../addNewOrder.js";
import fs from "fs/promises";
import readlineSync from "readline-sync";

export async function loadConfigFromFile(filePath) {
  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading config file:", error);
    throw error;
  }
}

async function main() {
  try {
    const configFilePath = "./input.json";
    const config = await loadConfigFromFile(configFilePath);
    startDay(config);

    while (readlineSync.keyInYNStrict("Do you want to add a new order?")) {
      const customerID = readlineSync.questionInt("Enter customer ID: ");
      const productCount = readlineSync.questionInt(
        "Enter the number of products: "
      );

      const productList = {};
      for (let i = 1; i <= productCount; i++) {
        const productName = readlineSync.question(`Enter product ${i} name: `);
        const productQuantity = readlineSync.questionInt(
          `Enter quantity for ${productName}: `
        );
        productList[productName] = productQuantity;
      }

      await addNewOrder(config, customerID, productList);
    }
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();
