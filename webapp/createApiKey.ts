import dotenv from "dotenv";
dotenv.config();
import { auth } from "./src/lib/server/auth"

const data = await auth.api.createApiKey({
    body: {
        name: `${process.env.API_USER_NAME}_API_KEY`,
        expiresIn: Number(process.env.API_KEY_EXPIRE),
        userId: process.env.API_USER_ID, // server-only
        prefix: 'APIKEY',
        remaining: 100, // server-only
        metadata: { someKey: 'someValue' },
        refillAmount: 100, 
        refillInterval: 1000,
        rateLimitTimeWindow: 1000,
        rateLimitMax: 100,
        rateLimitEnabled: true,
    },
});

console.log(data)