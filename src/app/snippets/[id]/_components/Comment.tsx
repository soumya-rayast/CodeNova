import React from 'react'
import { Id } from '../../../../../convex/_generated/dataModel';
import { TrashIcon, UserIcon } from 'lucide-react';
import CommentContent from './CommentContent';

interface CommentProps {
  comment: {
    _id: Id<"snippetComments">;
    _creationTime: number;
    userId: string;
    userName: string;
    snippetId: Id<"snippets">;
    content: string;
  };
  onDelete: () => void;
  isDeleting: boolean;
  currentUserId: string;
}
const Comment = ({ comment, currentUserId, isDeleting, onDelete }: CommentProps) => {
  return (
    <div className="group">
      <div className="bg-[#0a0a0f] rounded-xl p-6 border border-[#ffffff0a] hover:border-[#ffffff14] transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#ffffff08] flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <span className="block text-cyan-300 font-medium truncate">{comment.userName}</span>
            <span className="block text-sm text-cyan-500">
              {new Date(comment._creationTime).toLocaleDateString()}
            </span>
          </div>
        </div>
        {comment.userId === currentUserId && (
          <button
            onClick={() => onDelete(comment._id)}
            disabled={isDeleting}
            className="opacity-0 group-hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete Comment"
          >
            <TrashIcon className="w-4 h-4 text-cyan-500" />
          </button>
        )}
        <CommentContent content={comment.content} />
      </div>
    </div>
  )
}

export default Comment
