import Link from "next/link";
import { Search, Calendar, CheckSquare, Users, Bus } from "lucide-react";

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
    icon: CheckSquare,
    title: "タスク管理",
    description: "課題・レポートの締切を管理",
    href: "/tasks",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Users,
    title: "SFC SNS",
    description: "キャンパス仲間と情報交換",
    href: "/sns",
    color: "bg-pink-50 text-pink-600",
  },
  {
    icon: Bus,
    title: "バス時刻表",
    description: "湘南台・辻堂行きの次のバスを確認",
    href: "/bus",
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
