import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// This schema defines the data model and indexes for a code sharing platform 
// - users : Stores user details and subscription info.
// - codeExecution : Tracks code execution logs per suser.
// - snippets : Contains user-submitted code snippets
// - snippetComments : Stores comments on code snippets
// - stars : Track which users have starred with snippets 

export default defineSchema({
    users: defineTable({
        userId: v.string(),
        email: v.string(),
        name: v.string(),
        isPro: v.boolean(),
        proSince: v.optional(v.number()),
        lemonSqueezyCustomerId: v.optional(v.string()),
        lemonSqueezyOrderId: v.optional(v.string()),
    }).index("by_user_id", ['userId']),

    codeExecutions: defineTable({
        userId: v.string(),
        language: v.string(),
        code: v.string(),
        output: v.optional(v.string()),
        error: v.optional(v.string()),
    }).index("by_user_id", ["userId"]),

    snippets: defineTable({
        userId: v.string(),
        title: v.string(),
        language: v.string(),
        code: v.string(),
        userName: v.string()
    }).index("by_user_id", ['userId']),

    snippetComments: defineTable({
        snippetId: v.id('snippets'),
        userId: v.string(),
        userName: v.string(),
        content: v.string(),
    }).index('by_snippet_id', ['snippetId']),

    stars: defineTable({
        userId: v.string(),
        snippetId: v.id('snippets')
    }).index("by_user_id", ['userId'])
        .index('by_snippet_id', ['snippetId'])
        .index('by_user_id_and_snippet_id', ['userId', 'snippetId']),
})