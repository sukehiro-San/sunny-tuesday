const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://localhost";
let channel, connection;

async function connectRabbitMQ() {
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  await channel.assertQueue("NOTIFICATION_QUEUE");

  console.log("Connected to RabbitMQ - Notification Service");

  channel.consume("NOTIFICATION_QUEUE", (msg) => {
    const order = JSON.parse(msg.content.toString());

    sendEmailNotification(order);

    channel.ack(msg); // Acknowledge message
  });
}

function sendEmailNotification(order) {
  // Simulate sending an email notification
  console.log(`Sending email notification for order: ${JSON.stringify(order)}`);
}

connectRabbitMQ();
