"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { createHmac } from "crypto";


// Load Webhook secret from environment 
const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;
// Verify HMAC-SHA256 signature
function verifySignature(payload: string, signature: string): boolean {
    const hmac = createHmac("sha256", webhookSecret);
    const computedSignature = hmac.update(payload).digest("hex");
    return signature === computedSignature;
}
//Internal action to validate and parse Lemon Squeezy webhook
export const verifyWebhook = internalAction({
    args: {
        payload: v.string(), // Raw request body
        signature: v.string(), // X-Signature header
    },
    handler: async (ctx, args) => {
        const isValid = verifySignature(args.payload, args.signature);

        if (!isValid) {
            throw new Error("Invalid signature"); // reject if signature mismatch
        }

        return JSON.parse(args.payload); // Return parsed JSON on success
    },
});