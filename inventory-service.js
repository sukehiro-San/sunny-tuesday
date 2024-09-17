const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://localhost";
let channel, connection;

async function connectRabbitMQ() {
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  // Create or connect to the order queue
  await channel.assertQueue("ORDER_QUEUE");
  await channel.assertQueue("NOTIFICATION_QUEUE");

  console.log("Connected to RabbitMQ - Inventory Service");

  channel.consume("ORDER_QUEUE", async (msg) => {
    const order = JSON.parse(msg.content.toString());
    const isAvailable = checkInventory(order);

    if (isAvailable) {
      // Send message to Notification Service to trigger email
      channel.sendToQueue(
        "NOTIFICATION_QUEUE",
        Buffer.from(JSON.stringify(order)),
        {
          persistent: true,
        }
      );

      channel.ack(msg); // Acknowledge message
    } else {
      console.log("Product not available, retrying...");
      // Retry logic if needed
      channel.nack(msg, false, true); // Reject and requeue
    }
  });
}

function checkInventory(order) {
  // Mock inventory check logic
  return true;
}

connectRabbitMQ();
