import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api, internal } from "./_generated/api"

const http = httpRouter();
// Define a HTTP route for handling Clerk webHooks
http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        // Get the webhook secret from environment variables
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
        }

        // Retrieve necessary Svix from the request
        const svix_id = request.headers.get("svix-id");
        const svix_signature = request.headers.get("svix-signature");
        const svix_timestamp = request.headers.get("svix-timestamp");

        // Ensure all required headers are present
        if (!svix_id || !svix_signature || !svix_timestamp) {
            return new Response("Error Occurred -- missing svix headers", {
                status: 400,
            });
        }

        // Parse and stringify the request body
        const payload = await request.json();
        const body = JSON.stringify(payload);

        // Create a svix webhook for verifying the event
        const wh = new Webhook(webhookSecret);
        let evt: WebhookEvent;

        // Attempt to verify the webHook signature
        try {
            evt = wh.verify(body, {
                'svix-id': svix_id,
                "svix-timestamp": svix_timestamp,
                'svix-signature': svix_signature
            }) as WebhookEvent;

        } catch (error) {
            console.error('Error verifying webhook:', error);
            return new Response("Error occurred", { status: 400 })
        }

        // Handle The 'user created' event from clerk
        const eventType = evt.type;
        if (eventType === 'user.created') {
            const { id, email_addresses, first_name, last_name } = evt.data

            const email = email_addresses[0].email_address
            const name = `${first_name || ''} ${last_name || ''}`.trim();

            // Sync the new user to the database using mutation
            try {
                await ctx.runMutation(api.users.syncUser, {
                    userId: id,
                    email,
                    name
                })
            } catch (error) {
                console.log('Error creating user:', error)
                return new Response("Error creating user", { status: 400 })
            }
        }

        // Return a success response
        return new Response("Webhook processed successfully", { status: 200 })
    }),
});
// Define a HTTP route for handling Lemon Squeezy Webhooks
http.route({
    path: "/lemon-squeezy-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        // Read the raw request body (as a string)
        const payloadString = await request.text();

        // Retrieve the webhook signature from the request headers
        const signature = request.headers.get("X-Signature");

        // Return an error response if the signature is missing
        if (!signature) {
            return new Response("Missing X-Signature header", { status: 400 });
        }

        try {
            // Verify the webhook's authenticity using Lemon Squeezy's verification logic
            const payload = await ctx.runAction(internal.lemonSqueezy.verifyWebhook, {
                payload: payloadString,
                signature,
            });

            // Check if the webhook event is for a newly created order
            if (payload.meta.event_name === "order_created") {
                const { data } = payload;

                // Run a mutation to upgrade the user to a Pro account
                const { success } = await ctx.runMutation(api.users.upgradeToPro, {
                    email: data.attributes.user_email, // User's email from the order data
                    lemonSqueezyCustomerId: data.attributes.customer_id.toString(), // Convert customer ID to string
                    lemonSqueezyOrderId: data.id, // The unique order ID
                    amount: data.attributes.total, // Total amount paid
                });

                if (success) {
                    // Optional: Do something after successful upgrade, like logging or sending a confirmation email
                }
            }

            // Respond with success after processing the webhook
            return new Response("Webhook processed successfully", { status: 200 });
        } catch (error) {
            // Log the error for debugging purposes
            console.log("Webhook error:", error);
            return new Response("Error processing webhook", { status: 500 });
        }
    }),
});

export default http;