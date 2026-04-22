import { Metadata } from "next";
import { PostDetail } from "@/components/sns/PostDetail";

export const metadata: Metadata = {
  title: "投稿詳細",
};

interface Props {
  params: { postId: string };
}

export default function PostPage({ params }: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      <PostDetail postId={params.postId} />
    </div>
  );
}
