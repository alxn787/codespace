import { Queue } from "bullmq";
import IORedis from "ioredis";
export async function addToQueue(
    name: string,
    environment: string,
    port: number,
){

    const connection = new IORedis();

    const queue = new Queue('playground',{ connection })

    await queue.add("playground", {
        name,
        environment,
        port,
    });
    console.log("Job added to queue");

}