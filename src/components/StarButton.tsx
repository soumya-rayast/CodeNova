import React from 'react';
import { Id } from '../../convex/_generated/dataModel';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Star } from 'lucide-react';

const StarButton = ({ snippetId }: { snippetId: Id<'snippets'> }) => {
  const { isSignedIn } = useAuth();
  const isStared = useQuery(api.snippets.isSnippetStarred, { snippetId });
  const starCount = useQuery(api.snippets.getSnippetStarCount, { snippetId });
  const star = useMutation(api.snippets.starSnippet);

  const handleStar = async () => {
    if (!isSignedIn) return;
    await star({ snippetId });
  };

  return (
    <button
      onClick={handleStar}
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200
        ${isStared
          ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
          : "bg-gray-800/40 text-gray-400 hover:bg-gray-700/60"}`}
    >
      <Star
        className={`w-4 h-4 transition-transform duration-200 ${
          isStared ? 'fill-cyan-400 text-cyan-400' : 'fill-none group-hover:fill-gray-400'
        }`}
      />
      <span className={`text-sm font-medium ${isStared ? 'text-cyan-300' : 'text-gray-400'}`}>
        {starCount}
      </span>
    </button>
  );
};

export default StarButton;
