import * as amqp from "amqplib";

export interface Playground {
  name: string;
  environment: string;
  port: number;
}

export async function PublishMessage(
  name: string,
  environment: string,
  port: number,
) {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queue = "playground";
  await channel.assertQueue(queue, { durable: true });

  const playground: Playground = {
    name,
    environment,
    port,
  };

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(playground)));

  setTimeout(() => {
    connection.close();
  }, 1000);
}