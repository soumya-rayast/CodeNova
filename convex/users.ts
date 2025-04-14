import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mutation  to sync a user {insert if they don't already exist}
export const syncUser = mutation({
    args: {
        userId: v.string(),
        email: v.string(),
        name: v.string(),
    },

    handler: async (ctx, args) => {
        // check if the user already exists in the database
        const existingUser = await ctx.db.query("users")
            .filter(q => q.eq(q.field("userId"), args.userId)).first();

        // If the user does not exist, insert them with default isPro = false
        if (!existingUser) {
            await ctx.db.insert("users", {
                userId: args.userId,
                email: args.email,
                name: args.name,
                isPro: false
            })
        }
    }
})
// Query to fetch a user by their userId
export const getUser = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        // If no userId is provided, return null
        if (!args.userId) return null;

        // Find user in the database using "by_user_id" index
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .first();

        // Return null if the user not found, otherwise return the user
        if (!user) return null;

        return user;
    }
})
// Mutation for User upgrade to pro
export const upgradeToPro = mutation({
    args: {
        email: v.string(),
        lemonSqueezyCustomerId: v.string(),
        lemonSqueezyOrderId: v.string(),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        // Find the user by email
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (!user) throw new Error("User not found");

        // Update the users record to mark them as Pro
        await ctx.db.patch(user._id, {
            isPro: true,
            proSince: Date.now(),
            lemonSqueezyCustomerId: args.lemonSqueezyCustomerId,
            lemonSqueezyOrderId: args.lemonSqueezyOrderId,
        });

        return { success: true };
    },
});