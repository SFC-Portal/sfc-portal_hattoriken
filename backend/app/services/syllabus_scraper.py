"""
SFC PORTAL シラバス スクレイパー
Scrapes syllabus data from SFC PORTAL and upserts into the database.
"""


def scrape_syllabus(year: int) -> list[dict]:
    # TODO: fetch & parse SFC PORTAL syllabus pages for the given year
    raise NotImplementedError


def upsert_courses(courses: list[dict]) -> None:
    # TODO: bulk upsert into courses table via Supabase / SQLAlchemy
    raise NotImplementedError
