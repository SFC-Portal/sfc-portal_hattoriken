import { Metadata } from "next";
import { Feed } from "@/components/sns/Feed";

export const metadata: Metadata = {
  title: "SFC SNS",
  description: "SFC生のためのソーシャルネットワーク",
};

export default function SnsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">タイムライン</h1>
      {/* PostComposer will go here */}
      <Feed />
    </div>
  );
}
