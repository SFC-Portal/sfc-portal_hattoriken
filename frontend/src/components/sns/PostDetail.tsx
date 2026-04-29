"use client";

interface PostDetailProps {
  postId: string;
}

// Post detail view with comments
export function PostDetail({ postId }: PostDetailProps) {
  return (
    <div className="space-y-4">
      {/* Post content */}
      <div className="card p-4">
        {/* PostCard content here */}
        <p className="text-gray-500">投稿を読み込み中...</p>
      </div>

      {/* Comments section */}
      <div className="space-y-4">
        <h2 className="font-semibold">コメント</h2>
        {/* Comment list */}
        {/* Comment form */}
      </div>
    </div>
  );
}
