import Link from "next/link";
import { Search, Calendar, MapPin, Bell, Coffee } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "シラバス検索",
    description: "科目名・教員名・曜日・時限で授業を絞り込み",
    href: "/syllabus",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Calendar,
    title: "時間割",
    description: "履修中の授業を時間割形式で確認",
    href: "/timetable",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: MapPin,
    title: "キャンパスマップ",
    description: "教室・施設の場所を地図で確認",
    href: "/map",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: Bell,
    title: "お知らせ",
    description: "SFC関連の最新情報をチェック",
    href: "/news",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Coffee,
    title: "食堂メニュー",
    description: "本日のランチメニューを確認",
    href: "/cafeteria",
    color: "bg-orange-50 text-orange-600",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-sfc-blue mb-2">SFC Portal</h1>
        <p className="text-gray-500 text-sm">
          慶應義塾大学 湘南藤沢キャンパスの学生生活をサポート
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(({ icon: Icon, title, description, href, color }) => (
          <Link
            key={href}
            href={href}
            className="group card p-6 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex rounded-lg p-3 mb-4 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="font-semibold text-gray-800 group-hover:text-sfc-blue transition-colors">
              {title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
