const express = require("express");
const amqp = require("amqplib");
const app = express();
app.use(express.json());

const RABBITMQ_URL = "amqp://localhost";
let channel, connection;

async function connectRabbitMQ() {
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue("ORDER_QUEUE");
  console.log("Connected to RabbitMQ - Order Service");
}

app.post("/order", async (req, res) => {
  const order = req.body;

  // Send order to the RabbitMQ queue for Inventory service
  channel.sendToQueue("ORDER_QUEUE", Buffer.from(JSON.stringify(order)), {
    persistent: true,
  });

  res.status(200).json({ message: "Order created", order });
});

connectRabbitMQ();

app.listen(3000, () => {
  console.log("Order Service running on port 3000");
});
