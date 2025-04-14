import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mutation to create a new code snippet 
export const createSnippet = mutation({
    args: {
        title: v.string(), // Title 
        language: v.string(), // Programming language of the snippet
        code: v.string(), // Actual code
    },
    handler: async (ctx, args) => {
        // get the authenticated user's identity 
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            console.error("Authenticated failed");
            throw new Error("Not Authenticated");
        }

        // Fetch the authenticated user's identity
        const user = await ctx.db
            .query('users')
            .withIndex('by_user_id')
            .filter((q) => q.eq(q.field('userId'), identity.subject))
            .first();

        if (!user) {
            console.error(`User not found for subject : ${identity.subject}`)
            throw new Error("User not found");
        }

        // Insert the new snippet into the database
        const snippetId = await ctx.db.insert('snippets', {
            userId: identity.subject,
            userName: user.name,
            title: args.title,
            language: args.language,
            code: args.code,
        })
        return snippetId;
    }
})
// Query to retrieve all code snippets , stored by descending order
export const getSnippets = query({
    handler: async (ctx) => {
        const snippets = await ctx.db
            .query("snippets")
            .order('desc')
            .collect();
        return snippets;
    }
})
//  Query to check if a snippet is starred by authenticated user
export const isSnippetStarred = query({
    args: {
        snippetId: v.id('snippets'),
    },
    handler: async (ctx, args) => {
        // get the currently authenticated users identity 
        const identity = await ctx.auth.getUserIdentity();
        // if the user is not authenticated , return false 
        if (!identity) return false;

        // Query the stars table using a compound index in userId and snippetId 
        const star = await ctx.db
            .query("stars")
            .withIndex('by_user_id_and_snippet_id')
            .filter(
                (q) => q.eq(q.field("userId"), identity.subject)
                    && q.eq(q.field('snippetId'), args.snippetId)
            ).first();
        // return true if a star first matching record, if any
        return !!star;
    }
})
//  Query to get the number of stars for a given snippet
export const getSnippetStarCount = query({
    args: {
        snippetId: v.id('snippets'),
    },
    handler: async (ctx, args) => {
        // query the stars table using the "by_snippet_id" index
        // to fetch all stars related to the given snippet ID
        const stars = await ctx.db
            .query("stars")
            .withIndex('by_snippet_id')
            .filter((q) => q.eq(q.field('snippetId'), args.snippetId))
            .collect();
        // Return the total number of stars for the given snippet
        return stars.length;
    }
})
//  Deletes a snippet and its related comments and stars after verifying ownership.
export const deleteSnippet = mutation({
    args: {
        snippetId: v.id('snippets'),
    },
    handler: async (ctx, args) => {
        // Get the currently authenticated user
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not Authenticated");

        // fetch the snippet to ensure it exists
        const snippet = await ctx.db.get(args.snippetId);
        if (!snippet) throw new Error("Snippet not found");

        // Check if the current user is the owner of the snippet
        if (snippet.userId !== identity.subject) {
            throw new Error("Not authorized to delete this snippet");
        }

        // delete all comments associated with the snippet
        const comments = await ctx.db.query("snippetComments")
            .withIndex('by_snippet_id')
            .filter((q) => q.eq(q.field('snippetId'), args.snippetId))
            .collect();

        for (const comment of comments) {
            await ctx.db.delete(comment._id);
        }

        // delete all stars associated with the snippet
        const stars = await ctx.db
            .query("stars")
            .withIndex('by_snippet_id')
            .filter((q) => q.eq(q.field('snippetId'), args.snippetId))
            .collect();

        for (const star of stars) {
            await ctx.db.delete(star._id)
        }
        // finally , delete the snippet itself
        await ctx.db.delete(args.snippetId);
    }
})
//  Query for star the snippet
export const starSnippet = mutation({
    args: {
        snippetId: v.id('snippets'),
    },
    handler: async (ctx, args) => {
        // get the identity of the currently authenticated user
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not Authenticated");
        }

        // check if this has already starred the snippet
        const existing = await ctx.db
            .query("stars")
            .withIndex('by_user_id_and_snippet_id')
            .filter(
                (q) => q.eq(q.field('userId'), identity.subject) && q.eq(q.field('snippetId'), args.snippetId)
            ).first();

        if (existing) {
            // if a star exists , remove it (toggle off)
            await ctx.db.delete(existing._id);
        } else {
            // if no star exists, insert a new one (toggle on)
            await ctx.db.insert('stars', {
                userId: identity.subject,
                snippetId: args.snippetId
            })
        }
    }
})
//  Query for getting the snippet by id
export const getSnippetById = query({
    args: { snippetId: v.id('snippets') },
    handler: async (ctx, args) => {
        // Fetch the snippet document from the database using the given ID
        const snippet = await ctx.db.get(args.snippetId);

        // If no snippet is found , throw an error
        if (!snippet) {
            throw new Error("Snippet not found");
        }
        // Return the found snippet
        return snippet;
    }
})
//  Query for get the comments
export const getComments = query({
    args: { snippetId: v.id('snippets') },
    handler: async (ctx, args) => {
        // Query the 'snippetComments' table using the 'by_snippet_id' index
        // to fetch comments related to the provided snippetId
        const comments = await ctx.db
            .query('snippetComments')
            .withIndex('by_snippet_id')
            .filter((q) => q.eq(q.field('snippetId'), args.snippetId))
            .order('desc')
            .collect();
        // Return the array of comments
        return comments;
    }
})
// Query for add the comment 
export const addComment = mutation({
    args: {
        snippetId: v.id('snippets'),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        // Get the identity of the currently authenticated user
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Fetch the user record from the database using the user's unique identity
        const user = await ctx.db
            .query('users')
            .withIndex('by_user_id')
            .filter((q) => q.eq(q.field('userId'), identity.subject))
            .first();

        // Throw an error if the user is not found
        if (!user) throw new Error('User not found');

        // Insert a new comment into the 'snippetComments' table
        return await ctx.db.insert('snippetComments', {
            snippetId: args.snippetId,
            userId: identity.subject,
            userName: user.name,
            content: args.content,
        })
    }
})
// Query for delete the comments
export const deleteComment = mutation({
    args: {
        commentId: v.id('snippetComments')
    },
    handler: async (ctx, args) => {
        // Get the
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const comment = await ctx.db.get(args.commentId);
        if (!comment) throw new Error("Comment not found");

        //Check the user is the comment author of the comment
        if (comment.userId !== identity.subject)
            throw new Error("Not authorized to delete this comment");

        // Delete the comment from the database
        await ctx.db.delete(args.commentId);
    }
})
// Query for get the starredSnippet
export const getStarredSnippet = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // fetch all star records for the current user
        const stars = await ctx.db
            .query("stars")
            .withIndex("by_user_id")
            .filter((q) => q.eq(q.field('userId'), identity.subject))
            .collect();
        // For each star , get the corresponding snippet from the database
        const snippets = await Promise.all(stars.map((star) => ctx.db.get(star.snippetId)));

        // filter out any null values (in case a snippet was deleted)
        return snippets.filter((snippet) => snippet != null)
    }
})
