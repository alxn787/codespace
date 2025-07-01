import * as amqp from "amqplib";
import { createCodeSpace } from "./deployment";

interface CodeSpace {
  name: string;
  environment: string;
  port: number;
}

export async function Consumer() {
    console.log("Consumer started");
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queue = "codespace";
  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (message) => {
      if(message){
          const CodeSpace: CodeSpace = JSON.parse(message.content.toString());
            try{

                await createCodeSpace(CodeSpace.name, CodeSpace.environment, CodeSpace.port);
                // console.log(CodeSpace);
                channel.ack(message);
            }catch(e){
                console.log("Error consuming message", e);
            }
        }
    });
}