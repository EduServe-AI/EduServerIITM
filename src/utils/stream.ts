import { StreamClient } from "@stream-io/node-sdk";
import config from "../config/constants";

const apiKey = config.STREAM_API_KEY;
const apiSecret = config.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("STREAM_API_KEY or STREAM_API_SECRET is missing");
}

const streamClient = new StreamClient(apiKey, apiSecret);

export default streamClient;
