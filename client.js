const PORT = 3001;
document.addEventListener("DOMContentLoaded", () => {
  const ws = new WebSocket(`ws://localhost:${PORT}`);

  ws.addEventListener("open", () => {
    console.log("Connected to the server");
  });

  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.action === "statusUpdate") {
      document.getElementById("statusOutput").innerText = data.status;
    } else {
      console.log("Invalid data received from server");
    }
  });

  ws.addEventListener("close", () => {
    console.log("Connection closed");
  });

  window.openAddOrderPopup = () => {
    const customerIdInput = document.getElementById("customerIdInput");
    currentCustomerId = customerIdInput.value;
    document.getElementById("addOrderPopup").style.display = "block";
  };

  window.closeAddOrderPopup = () => {
    document.getElementById("addOrderPopup").style.display = "none";
  };

  window.addProductInput = () => {
    const numOfProducts = document.getElementById("numOfProducts").value;
    const productDetails = document.getElementById("productDetails");
    productDetails.innerHTML = "";

    for (let i = 0; i < numOfProducts; i++) {
      const productName = prompt(`Enter name of product ${i + 1}:`);
      const productInput = document.createElement("input");
      productInput.type = "text";
      productInput.placeholder = `Enter quantity for ${productName}`;
      productDetails.appendChild(productInput);
    }
  };

  window.saveOrder = () => {
    const productList = {};
    const inputs = document
      .getElementById("productDetails")
      .querySelectorAll("input");

    inputs.forEach((input) => {
      const productName = input.placeholder.split(" ")[3];
      const quantity = input.value;
      productList[productName] = parseInt(quantity);
    });

    const currentCustomerId = parseInt(
      document.getElementById("customerIdInput").value
    );

    const newOrder = {
      customerId: currentCustomerId,
      productList: productList,
    };

    const command = { action: "saveOrder", order: newOrder };
    ws.send(JSON.stringify(command));

    closeAddOrderPopup();
  };
});
