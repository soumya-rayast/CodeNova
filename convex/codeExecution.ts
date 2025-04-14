import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// Define a mutation : saveExecution
export const saveExecution = mutation({
    // expected arguments for the mutation
    args: {
        language: v.string(),
        code: v.string(),
        output: v.optional(v.string()),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // get the currently authenticated user's identity
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not Authenticated")

        // check if user is not Pro Subscriber and using non javascript language  
        const user = await ctx.db
            .query('users')
            .withIndex('by_user_id')
            .filter((q) => q.eq(q.field('userId'), identity.subject))
            .first();

        if (!user?.isPro && args.language !== 'javascript') {
            throw new ConvexError("Pro subscription required to use this language");
        }
        //  Save the code execution record to the database
        await ctx.db.insert('codeExecutions', {
            ...args,
            userId: identity.subject
        })
    }
})
// Query for get user execution
export const getUserExecutions = query({
    args: {
        userId: v.string(),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("codeExecutions")
            .withIndex('by_user_id')
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .order('desc')
            .paginate(args.paginationOpts);
    }
})
// Query for get user stats
export const getUserStats = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const executions = await ctx.db
            .query('codeExecutions')
            .withIndex('by_user_id')
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .collect();

        // Get starred snippets
        const starredSnippets = await ctx.db
            .query('stars')
            .withIndex('by_user_id')
            .filter(q => q.eq(q.field('userId'), args.userId))
            .collect();

        // get all starred snippet details to analyze language
        const snippetIds = starredSnippets.map((star) => star.snippetId);
        const snippetDetails = await Promise.all(snippetIds.map((id) => ctx.db.get(id)));

        // calculate most starred language 
        const starredLanguages = snippetDetails.filter(Boolean).reduce(
            (acc, curr) => {
                if (curr?.language) {
                    acc[curr.language] = (acc[curr.language] || 0) + 1;
                }
                return acc;
            },
            {} as Record<string, number>
        )
        const mostStarredLanguage = Object.entries(starredLanguages)
            .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "N/A";

        // calculate execution stats
        const last24Hours = executions.filter(
            (e) => e._creationTime > Date.now() - 24 * 60 * 60 * 1000
        ).length;

        const languageStats = executions.reduce(
            (acc, curr) => {
                acc[acc.language] = (acc[curr.language] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const languages = Object.keys(languageStats);

        const favoriteLanguage = languages.length
            ? languages.reduce((a, b) => (languageStats[a] > languageStats[b] ? a : b))
            : "N/A";

        return {
            totalExecutions: executions.length,
            languagesCount: languages.length,
            languages: languages,
            last24Hours,
            favoriteLanguage,
            languageStats,
            mostStarredLanguage,
        }
    }
})
