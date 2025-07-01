import * as amqp from "amqplib";
import { createPlayground } from "./deployment";

interface Playground {
  name: string;
  environment: string;
  port: number;
}

export async function Consumer() {
    console.log("Consumer started");
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queue = "playground";
  await channel.assertQueue(queue, { durable: true });

  try{
        channel.consume(queue, async (message) => {
            if(message){
                const playground: Playground = JSON.parse(message.content.toString());

                createPlayground(playground.name, playground.environment, playground.port);
                console.log(playground);
                channel.ack(message);
            }
        });
    }catch(e){
        console.log(e);
    }
}