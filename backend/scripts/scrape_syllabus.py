"""
SFCシラバス スクレイピングスクリプト

使い方 (backend/ ディレクトリで実行):
    python scripts/scrape_syllabus.py [year]

例:
    python scripts/scrape_syllabus.py 2025
"""

import json
import sys
import time
import tempfile
from pathlib import Path
from urllib.parse import urlparse, parse_qs

# backend/ を sys.path に追加して app モジュールをインポートできるようにする
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

from app.db.session import SessionLocal
from app.models.course import Course


# === スクレイパー ===

class SyllabusScraper:
    """Seleniumで授業一覧ページをスクレイピングしてリンク・基本情報を収集する"""

    def __init__(self, headless: bool = True):
        self.base_url = "https://gslbs.keio.jp/pub-syllabus/"
        self.search_url = self.base_url + "search"
        self.dow_ids = ["dow1", "dow2", "dow3", "dow4", "dow5", "dow6", "dow9"]
        self.results: list[dict] = []

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".json")
        self.output_path = tmp.name
        tmp.close()

        options = Options()
        if headless:
            options.add_argument("--headless")
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            from selenium.webdriver.chrome.service import Service
            self.driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()), options=options
            )
        except ImportError:
            self.driver = webdriver.Chrome(options=options)

    def run(self) -> None:
        try:
            self.driver.get(self.search_url)
            WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located((By.NAME, "KEYWORD_PRGANDFCD"))
            )
            # 総合政策学部/環境情報学部を選択
            Select(self.driver.find_element(By.NAME, "KEYWORD_PRGANDFCD")).select_by_value("11__23")
            self.driver.find_element(
                By.CSS_SELECTOR,
                "button[data-action_id='SYLLABUS_SEARCH_KEYWORD_EXECUTE']",
            ).click()

            for dow in self.dow_ids:
                tab_selector = f'a[href="#{dow}"]'
                time.sleep(1.5)
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, tab_selector))
                )
                self.driver.execute_script(
                    "arguments[0].click();",
                    self.driver.find_element(By.CSS_SELECTOR, tab_selector),
                )
                time.sleep(1.5)
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, f"#{dow} .search-result-item")
                    )
                )

                soup = BeautifulSoup(self.driver.page_source, "html.parser")
                for item in soup.select(f"#{dow} .search-result-item"):
                    sbjtnm_tag = item.select_one(".sbjtnm")
                    lctnm_tag = item.select_one(".lctnm")
                    credit_tag = item.select_one(".credit")
                    link_tag = item.select_one("a.syllabus-detail")
                    if not link_tag or not link_tag.get("href"):
                        continue
                    self.results.append({
                        "name": sbjtnm_tag.text.strip() if sbjtnm_tag else "N/A",
                        "teacher": lctnm_tag.text.strip() if lctnm_tag else "N/A",
                        "credit": credit_tag.text.strip() if credit_tag else "N/A",
                        "link": self.base_url + link_tag["href"],
                    })
        finally:
            self.driver.quit()

        Path(self.output_path).write_text(
            json.dumps(self.results, ensure_ascii=False, indent=2), encoding="utf-8"
        )


class _DuplicateRemover:
    def __init__(self, input_path: str):
        self.input_path = input_path
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".json")
        self.output_path = tmp.name
        tmp.close()

    def run(self) -> None:
        data = json.loads(Path(self.input_path).read_text(encoding="utf-8"))
        seen: set[str] = set()
        uniq = []
        for row in data:
            key = row.get("link")
            if key in seen:
                continue
            seen.add(key)
            uniq.append(row)
        Path(self.output_path).write_text(
            json.dumps(uniq, ensure_ascii=False, indent=2), encoding="utf-8"
        )


class _SyllabusDetailFetcher:
    def __init__(self, input_path: str):
        self.input_path = input_path
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".json")
        self.output_path = tmp.name
        tmp.close()

    def run(self) -> None:
        data = json.loads(Path(self.input_path).read_text(encoding="utf-8"))
        credit_map = {item["link"]: item.get("credit") for item in data}
        links = [item["link"] for item in data]

        all_results = []
        for i, url in enumerate(links):
            try:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "html.parser")

                title = soup.title.string.strip() if soup.title else "No title"

                teacher_th = soup.find("th", string="担当者名")
                teacher_text = (
                    teacher_th.find_next_sibling("td").get_text(strip=True)
                    if teacher_th
                    else "N/A"
                )
                teachers = teacher_text.split(",") if teacher_text != "N/A" else []

                dp_th = soup.find("th", string="曜日時限")
                dp_text = (
                    dp_th.find_next_sibling("td").get_text(strip=True) if dp_th else "N/A"
                )
                date_period = dp_text.split("/") if dp_text != "N/A" else []

                all_results.append({
                    "url": url,
                    "title": title,
                    "teachers": teachers,
                    "datePeriod": date_period,
                    "credit": credit_map.get(url),
                })
                print(f"[{i + 1}/{len(links)}] {title}")
                time.sleep(1)

            except requests.exceptions.RequestException as e:
                all_results.append({
                    "url": url,
                    "title": "ERROR",
                    "teachers": [],
                    "datePeriod": [],
                    "error": str(e),
                })
                print(f"ERROR: {url} ({e})")

        Path(self.output_path).write_text(
            json.dumps(all_results, ensure_ascii=False, indent=2), encoding="utf-8"
        )


# === ヘルパー ===

def _extract_course_id(url: str) -> str | None:
    return parse_qs(urlparse(url).query).get("entno", [None])[0]


def _extract_year(url: str) -> int | None:
    yr = parse_qs(urlparse(url).query).get("ttblyr", [None])[0]
    return int(yr) if yr else None


def _parse_day_period(date_period: list[str]) -> tuple[str | None, str | None]:
    if not date_period:
        return None, None
    first = date_period[0].strip()
    if not first:
        return None, None
    return first[0], first[1:] or None


# === パイプライン ===

def run_pipeline(year: int) -> None:
    scraper = SyllabusScraper()
    scraper.run()
    print(f"スクレイピング完了: {len(scraper.results)} 件")

    remover = _DuplicateRemover(scraper.output_path)
    remover.run()

    fetcher = _SyllabusDetailFetcher(remover.output_path)
    fetcher.run()

    courses = json.loads(Path(fetcher.output_path).read_text(encoding="utf-8"))

    db = SessionLocal()
    try:
        for course in courses:
            if course.get("title") == "ERROR":
                continue

            course_id = _extract_course_id(course["url"])
            if not course_id:
                continue

            yr = _extract_year(course["url"]) or year
            day, period = _parse_day_period(course.get("datePeriod", []))
            instructor = ", ".join(t.strip() for t in course.get("teachers", []))
            credit_raw = course.get("credit")
            try:
                credits = int(credit_raw) if credit_raw else None
            except (ValueError, TypeError):
                credits = None

            existing = db.get(Course, course_id)
            if existing:
                existing.name = course["title"]
                existing.instructor = instructor
                existing.day = day
                existing.period = period
                existing.syllabus_url = course["url"]
                existing.year = yr
                existing.credits = credits
            else:
                db.add(Course(
                    id=course_id,
                    name=course["title"],
                    instructor=instructor,
                    day=day,
                    period=period,
                    syllabus_url=course["url"],
                    year=yr,
                    credits=credits,
                ))

        db.commit()
        ok = [c for c in courses if c.get("title") != "ERROR"]
        err = [c for c in courses if c.get("title") == "ERROR"]
        print(f"\n完了: DB書き込み {len(ok)} 件 / エラー {len(err)} 件")
    finally:
        db.close()


if __name__ == "__main__":
    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2025
    print(f"=== {year}年度 SFCシラバス スクレイピング開始 ===")
    run_pipeline(year)
