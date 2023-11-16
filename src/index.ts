import Pusher from "pusher-js";
import { queryTokenHolder } from "./graphql";
require("dotenv").config();

const envVars = ["PUSHER_KEY", "PUSHER_CLUSTER", "PUSHER_CHANNEL", "PUSHER_EVENT", "GRAPHQL_API"];
const missingEnvVars = envVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing environment variables: ${missingEnvVars.join(", ")}`);
}

const initPusherClient = (): Promise<Pusher> => {
  return new Promise((resolve, reject) => {
    const pClient = new Pusher(process.env.PUSHER_KEY!, {
      cluster: process.env.PUSHER_CLUSTER!,
    });
    pClient.connection.bind("error", function (err: any) {
      if (err.error.data.code === 4004) {
        console.log("Pusher Service Over limit!");
        return;
      }
      console.log("Pusher Service ERR", err);
      reject("Pusher connect error=" + err?.error?.message);
    });

    pClient.connection.bind("connected", () => {
      console.log("pusher connected");
      resolve(pClient);
    });
  });
};

const dolphinToken = "0x2B28725Be49edd430BBAE307Ac8eFdaee29222D6";

const main = async () => {
  const pusher = await initPusherClient();
  const channel = pusher.subscribe(process.env.PUSHER_CHANNEL!);

  channel.bind(process.env.PUSHER_EVENT!, async (data: any) => {
    if (data.updatedAccounts?.REEF20Transfers?.length) {
      console.log("\nBlock", data.blockHeight);

      const updatedReef20Transfers = data.updatedAccounts.REEF20Transfers;
      for (const address of updatedReef20Transfers) {
        const tokenHolder = await queryTokenHolder(dolphinToken, address);
        console.log(`${address} => ${tokenHolder.balance}, ${tokenHolder.timestamp}`);
      }
    }
  });
}

main();