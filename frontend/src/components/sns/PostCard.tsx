"use client";

import type { Post } from "@/types/sns";

interface PostCardProps {
  post: Post;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
}

// Individual post card component
export function PostCard({ post, onLike, onComment }: PostCardProps) {
  return (
    <article className="card p-4 space-y-3">
      {/* Author header */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div>
          <p className="font-medium">{post.author.displayName}</p>
          <p className="text-sm text-gray-500">{post.createdAt}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-900">{post.content}</p>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="grid gap-2">
          {/* Image grid */}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t">
        {/* Like button */}
        <button className="text-sm text-gray-500 hover:text-sfc-blue">
          いいね {post.likesCount}
        </button>
        {/* Comment button */}
        <button className="text-sm text-gray-500 hover:text-sfc-blue">
          コメント {post.commentsCount}
        </button>
      </div>
    </article>
  );
}
