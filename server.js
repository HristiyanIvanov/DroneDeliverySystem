import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { loadConfigFromFile } from "./app/main.js";
import { addNewOrder } from "./addNewOrder.js";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    try {
      const command = JSON.parse(message);

      if (command.action === "saveOrder") {
        try {
          const configFilePath = "./input.json";
          const config = await loadConfigFromFile(configFilePath);
          await addNewOrder(
            config,
            command.order.customerId,
            command.order.productList
          );

          ws.send(
            JSON.stringify({
              action: "statusUpdate",
              status: "Order saved successfully",
            })
          );
        } catch (error) {
          console.error("Error saving order:", error);
          ws.send(
            JSON.stringify({
              action: "statusUpdate",
              status: "Error saving order",
            })
          );
        }
      } else {
        console.log("Invalid command");
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
