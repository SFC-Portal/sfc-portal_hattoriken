"""
モックデータ投入スクリプト
実行: cd backend && venv/Scripts/python scripts/seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine, Base, SessionLocal
import app.models  # noqa: F401 — Base にすべてのモデルを登録する

from app.models.user import User
from app.models.course import Course
from app.models.task import Task, TaskPriority, TaskStatus, TaskCategory
from app.models.sns import Post, Comment, PostLike, Follow
from app.models.timetable import TimetableEntry
from app.models.bus import BusSchedule, BusStop, BusRoute, DayType

from datetime import datetime, timezone, timedelta


def drop_and_create_tables():
    print("テーブルを再作成中...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("テーブル作成完了")


def seed(db):
    now = datetime.now(timezone.utc)

    # === ユーザー ===
    users = [
        User(
            id="u-001",
            email="tanaka@sfc.keio.ac.jp",
            display_name="田中 太郎",
            grade=3,
            faculty="総合政策学部",
            bio="SFC3年。政策とテクノロジーの交差点に興味あり。",
            interests=["政策", "AI", "まちづくり"],
            graduation_year=2026,
        ),
        User(
            id="u-002",
            email="suzuki@sfc.keio.ac.jp",
            display_name="鈴木 花子",
            grade=2,
            faculty="環境情報学部",
            bio="環境情報2年。デザインとコードが好き。",
            interests=["デザイン", "環境", "プログラミング"],
            graduation_year=2027,
        ),
        User(
            id="u-003",
            email="sato@sfc.keio.ac.jp",
            display_name="佐藤 一郎",
            grade=4,
            faculty="総合政策学部",
            bio="4年。卒論でスマートシティを研究中。",
            interests=["都市計画", "IoT", "データ分析"],
            graduation_year=2025,
        ),
    ]
    db.add_all(users)
    db.flush()

    # === 科目 ===
    courses = [
        Course(
            id="c-001",
            name="情報基礎",
            name_en="Fundamentals of Information",
            instructor="佐藤 誠",
            day="月",
            period="1",
            room="Ω21",
            credits=2,
            semester="前期",
            category="基礎科目",
            language="日本語",
            description="情報科学の基礎概念を学ぶ。アルゴリズム・データ構造を中心に扱う。",
            year=2025,
        ),
        Course(
            id="c-002",
            name="プログラミング入門",
            name_en="Introduction to Programming",
            instructor="田中 健",
            day="火",
            period="2",
            room="Δ201",
            credits=2,
            semester="前期",
            category="基礎科目",
            language="日本語",
            description="Pythonを使ったプログラミングの基礎を習得する。",
            year=2025,
        ),
        Course(
            id="c-003",
            name="社会調査論",
            name_en="Social Research Methods",
            instructor="山田 裕子",
            day="水",
            period="3",
            room="Λ104",
            credits=2,
            semester="前期",
            category="専門科目",
            language="日本語",
            description="フィールドワークとアンケート設計の実践的手法を学ぶ。",
            year=2025,
        ),
        Course(
            id="c-004",
            name="環境政策論",
            name_en="Environmental Policy",
            instructor="鈴木 陽介",
            day="木",
            period="4",
            room="Ω11",
            credits=2,
            semester="前期",
            category="専門科目",
            language="日本語",
            description="環境問題に対する政策アプローチを分析する。",
            year=2025,
        ),
        Course(
            id="c-005",
            name="データサイエンス",
            name_en="Data Science",
            instructor="中村 明",
            day="金",
            period="2",
            room="Δ301",
            credits=2,
            semester="前期",
            category="専門科目",
            language="日本語",
            description="統計・機械学習を活用したデータ分析の手法を学ぶ。",
            year=2025,
        ),
    ]
    db.add_all(courses)
    db.flush()

    # === タスク ===
    tasks = [
        Task(
            id="t-001",
            user_id="u-001",
            title="情報基礎 レポート提出",
            description="アルゴリズムの計算量についてA4で2枚にまとめる",
            course_id="c-001",
            due_date=now + timedelta(days=7),
            priority=TaskPriority.HIGH,
            status=TaskStatus.TODO,
            category=TaskCategory.ASSIGNMENT,
            tags=["レポート", "アルゴリズム"],
        ),
        Task(
            id="t-002",
            user_id="u-001",
            title="プログラミング課題 第3回",
            description="再帰関数を使ったFizzBuzzを実装する",
            course_id="c-002",
            due_date=now + timedelta(days=3),
            priority=TaskPriority.URGENT,
            status=TaskStatus.IN_PROGRESS,
            category=TaskCategory.ASSIGNMENT,
            tags=["Python", "再帰"],
        ),
        Task(
            id="t-003",
            user_id="u-001",
            title="データサイエンス 中間試験",
            description="第1〜4章の内容が出題範囲",
            course_id="c-005",
            due_date=now + timedelta(days=14),
            priority=TaskPriority.MEDIUM,
            status=TaskStatus.TODO,
            category=TaskCategory.EXAM,
            tags=["試験", "統計"],
        ),
        Task(
            id="t-004",
            user_id="u-002",
            title="社会調査論 アンケート設計",
            description="グループでアンケートを設計して提出",
            course_id="c-003",
            due_date=now + timedelta(days=10),
            priority=TaskPriority.MEDIUM,
            status=TaskStatus.TODO,
            category=TaskCategory.PROJECT,
            tags=["グループワーク", "アンケート"],
        ),
        Task(
            id="t-005",
            user_id="u-002",
            title="環境政策論 文献読み込み",
            description="指定文献3本を読んでコメントシートを提出",
            course_id="c-004",
            due_date=now + timedelta(days=5),
            priority=TaskPriority.LOW,
            status=TaskStatus.DONE,
            category=TaskCategory.READING,
            tags=["文献", "環境"],
        ),
    ]
    db.add_all(tasks)
    db.flush()

    # === 時間割 ===
    timetable_entries = [
        TimetableEntry(id="te-001", user_id="u-001", course_id="c-001"),
        TimetableEntry(id="te-002", user_id="u-001", course_id="c-002"),
        TimetableEntry(id="te-003", user_id="u-001", course_id="c-005"),
        TimetableEntry(id="te-004", user_id="u-002", course_id="c-003"),
        TimetableEntry(id="te-005", user_id="u-002", course_id="c-004"),
    ]
    db.add_all(timetable_entries)
    db.flush()

    # === SNS投稿 ===
    posts = [
        Post(
            id="p-001",
            author_id="u-001",
            content="データサイエンスの中間、範囲広すぎ😇 一緒に勉強する人いませんか？",
            tags=["勉強会", "データサイエンス"],
            likes_count=3,
            comments_count=1,
        ),
        Post(
            id="p-002",
            author_id="u-002",
            content="Ω棟前のベンチ、今日めちゃくちゃ気持ちいい☀️ SFCの春は最高",
            tags=["SFCライフ", "春"],
            likes_count=8,
            comments_count=2,
        ),
        Post(
            id="p-003",
            author_id="u-003",
            content="卒論の中間発表終わった！スマートシティの事例研究、思ったより突っ込まれた笑",
            tags=["卒論", "研究"],
            likes_count=5,
            comments_count=0,
        ),
        Post(
            id="p-004",
            author_id="u-002",
            content="湘南台→SFCのバス、朝8時台が激混みすぎる問題、なんとかならないかな",
            tags=["バス", "SFCあるある"],
            likes_count=12,
            comments_count=3,
        ),
    ]
    db.add_all(posts)
    db.flush()

    # === コメント ===
    comments = [
        Comment(
            id="cm-001",
            post_id="p-001",
            author_id="u-002",
            content="私も参加したい！図書館で一緒にやりましょう",
        ),
        Comment(
            id="cm-002",
            post_id="p-002",
            author_id="u-001",
            content="わかる、SFCの春は別格ですよね",
        ),
        Comment(
            id="cm-003",
            post_id="p-002",
            author_id="u-003",
            content="昼ごはんあそこで食べると最高",
        ),
        Comment(
            id="cm-004",
            post_id="p-004",
            author_id="u-001",
            content="辻堂から来るとマシな気がする",
        ),
    ]
    db.add_all(comments)
    db.flush()

    # === いいね ===
    likes = [
        PostLike(id="pl-001", post_id="p-001", user_id="u-002"),
        PostLike(id="pl-002", post_id="p-001", user_id="u-003"),
        PostLike(id="pl-003", post_id="p-002", user_id="u-001"),
        PostLike(id="pl-004", post_id="p-004", user_id="u-001"),
        PostLike(id="pl-005", post_id="p-004", user_id="u-003"),
    ]
    db.add_all(likes)
    db.flush()

    # === フォロー ===
    follows = [
        Follow(id="f-001", follower_id="u-001", following_id="u-002"),
        Follow(id="f-002", follower_id="u-001", following_id="u-003"),
        Follow(id="f-003", follower_id="u-002", following_id="u-001"),
    ]
    db.add_all(follows)
    db.flush()

    # === バス停 ===
    bus_stops = [
        BusStop(
            id="bs-001",
            name="湘南台駅",
            name_en="Shonandai Station",
            routes=["shonandai_to_sfc", "sfc_to_shonandai"],
        ),
        BusStop(
            id="bs-002",
            name="辻堂駅",
            name_en="Tsujido Station",
            routes=["tsujido_to_sfc", "sfc_to_tsujido"],
        ),
        BusStop(
            id="bs-003",
            name="慶應義塾大学SFC",
            name_en="Keio University SFC",
            routes=["shonandai_to_sfc", "sfc_to_shonandai", "tsujido_to_sfc", "sfc_to_tsujido"],
        ),
    ]
    db.add_all(bus_stops)
    db.flush()

    # === バス時刻表（平日） ===
    shonandai_to_sfc = [
        ("07:16", "07:40"), ("07:45", "08:09"), ("08:05", "08:29"),
        ("08:20", "08:44"), ("08:35", "08:59"), ("08:50", "09:14"),
        ("09:10", "09:34"), ("09:40", "10:04"), ("10:10", "10:34"),
        ("10:40", "11:04"), ("11:10", "11:34"), ("12:10", "12:34"),
        ("13:10", "13:34"), ("14:10", "14:34"), ("15:10", "15:34"),
        ("16:10", "16:34"), ("17:10", "17:34"), ("18:10", "18:34"),
    ]
    sfc_to_shonandai = [
        ("09:00", "09:24"), ("09:30", "09:54"), ("10:00", "10:24"),
        ("10:30", "10:54"), ("11:00", "11:24"), ("12:00", "12:24"),
        ("13:00", "13:24"), ("14:00", "14:24"), ("15:00", "15:24"),
        ("16:00", "16:24"), ("17:00", "17:24"), ("18:00", "18:24"),
        ("18:30", "18:54"), ("19:00", "19:24"), ("19:30", "19:54"),
        ("20:00", "20:24"), ("20:30", "20:54"), ("21:00", "21:24"),
    ]
    tsujido_to_sfc = [
        ("07:20", "07:55"), ("08:00", "08:35"), ("08:30", "09:05"),
        ("09:00", "09:35"), ("09:30", "10:05"), ("10:30", "11:05"),
        ("12:30", "13:05"), ("14:30", "15:05"), ("16:30", "17:05"),
    ]
    sfc_to_tsujido = [
        ("09:10", "09:45"), ("10:10", "10:45"), ("11:10", "11:45"),
        ("13:10", "13:45"), ("15:10", "15:45"), ("17:10", "17:45"),
        ("18:10", "18:45"), ("19:10", "19:45"), ("20:10", "20:45"),
    ]

    schedules = []
    for i, (dep, arr) in enumerate(shonandai_to_sfc):
        schedules.append(BusSchedule(
            id=f"bs-s2s-w-{i+1:02d}",
            route=BusRoute.SHONANDAI_TO_SFC,
            day_type=DayType.WEEKDAY,
            departure_time=dep,
            arrival_time=arr,
        ))
    for i, (dep, arr) in enumerate(sfc_to_shonandai):
        schedules.append(BusSchedule(
            id=f"bs-s2sh-w-{i+1:02d}",
            route=BusRoute.SFC_TO_SHONANDAI,
            day_type=DayType.WEEKDAY,
            departure_time=dep,
            arrival_time=arr,
        ))
    for i, (dep, arr) in enumerate(tsujido_to_sfc):
        schedules.append(BusSchedule(
            id=f"bs-t2s-w-{i+1:02d}",
            route=BusRoute.TSUJIDO_TO_SFC,
            day_type=DayType.WEEKDAY,
            departure_time=dep,
            arrival_time=arr,
        ))
    for i, (dep, arr) in enumerate(sfc_to_tsujido):
        schedules.append(BusSchedule(
            id=f"bs-s2t-w-{i+1:02d}",
            route=BusRoute.SFC_TO_TSUJIDO,
            day_type=DayType.WEEKDAY,
            departure_time=dep,
            arrival_time=arr,
        ))
    db.add_all(schedules)

    db.commit()
    print(f"  ユーザー: {len(users)}件")
    print(f"  科目: {len(courses)}件")
    print(f"  タスク: {len(tasks)}件")
    print(f"  時間割: {len(timetable_entries)}件")
    print(f"  SNS投稿: {len(posts)}件 / コメント: {len(comments)}件 / いいね: {len(likes)}件")
    print(f"  フォロー: {len(follows)}件")
    print(f"  バス停: {len(bus_stops)}件 / 時刻表: {len(schedules)}件")


if __name__ == "__main__":
    drop_and_create_tables()
    db = SessionLocal()
    try:
        print("モックデータを投入中...")
        seed(db)
        print("完了！")
    except Exception as e:
        db.rollback()
        print(f"エラー: {e}")
        raise
    finally:
        db.close()
