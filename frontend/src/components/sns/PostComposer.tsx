"use client";

interface PostComposerProps {
  onSubmit: (content: string) => void;
}

// Post creation form
export function PostComposer({ onSubmit }: PostComposerProps) {
  return (
    <div className="card p-4">
      <form className="space-y-3">
        <textarea
          className="input w-full resize-none"
          rows={3}
          placeholder="今何してる？"
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {/* Image upload button */}
          </div>
          <button type="submit" className="btn-primary">
            投稿
          </button>
        </div>
      </form>
    </div>
  );
}
