#!/usr/bin/env python3
"""Download public-domain novels and make book-specific vocabulary candidates."""

from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
import time
from collections import Counter
from pathlib import Path

TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z'-]{2,}")
SENTENCE_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z\"'])")
STOPWORDS = set(
    "about after again against almost also always among another any are around because been before being both but can cannot could did does doing down each either enough every few for from further had has have having her here herself him himself his how into its itself just least like may more most much must my myself neither never no nor not now off often once one only or other our ours ourselves out over own same she should since so some still such than that the their theirs them themselves then there these they this those through to too under until up upon us very was we were what when where which while who whom why will with would you your yours yourself yourselves".split()
)


def download_text(book_id: int) -> str:
    urls = [
        f"https://www.gutenberg.org/files/{book_id}/{book_id}-0.txt",
        f"https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.txt",
    ]
    for url in urls:
        try:
            response = subprocess.run(
                ["curl", "--fail", "--location", "--silent", "--show-error", "--max-time", "90", "-A", "InRead vocabulary research", url],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            return response.stdout.decode("utf-8", errors="replace")
        except subprocess.CalledProcessError:
            continue
    raise RuntimeError(f"Could not download Gutenberg book {book_id}")


def remove_gutenberg_boilerplate(text: str) -> str:
    start = re.search(r"\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*", text, re.I | re.S)
    end = re.search(r"\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*", text, re.I | re.S)
    if start:
        text = text[start.end():]
    if end:
        text = text[:end.start()]
    return re.sub(r"\s+", " ", text).strip()


def sentences_for(text: str) -> list[str]:
    return [sentence.strip() for sentence in SENTENCE_RE.split(text) if 30 <= len(sentence.strip()) <= 360]


def make_candidates(text: str, limit: int) -> list[dict]:
    sentences = sentences_for(text)
    counts: Counter[str] = Counter()
    examples: dict[str, list[str]] = {}
    for sentence in sentences:
        seen = set()
        for raw_word in TOKEN_RE.findall(sentence):
            word = raw_word.lower().strip("'-")
            if len(word) < 4 or word in STOPWORDS or word in seen:
                continue
            seen.add(word)
            counts[word] += 1
            if len(examples.setdefault(word, [])) < 3:
                examples[word].append(sentence)

    ranked = []
    for word, frequency in counts.items():
        if frequency < 3 or len(examples.get(word, [])) < 2:
            continue
        score = math.log1p(frequency) * min(1.0, len(examples[word]) / 3)
        ranked.append((score, word, frequency))
    ranked.sort(reverse=True)
    return [
        {"word": word, "frequency": frequency, "score": round(score, 3), "examples": examples[word]}
        for score, word, frequency in ranked[:limit]
    ]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--books", type=Path, default=Path(__file__).with_name("books.json"))
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--candidates-per-book", type=int, default=500)
    args = parser.parse_args()

    books = json.loads(args.books.read_text(encoding="utf-8"))
    args.output.mkdir(parents=True, exist_ok=True)
    manifest = []
    for index, book in enumerate(books, start=1):
        book_dir = args.output / str(book["id"])
        book_dir.mkdir(parents=True, exist_ok=True)
        raw_path = book_dir / "book.txt"
        if raw_path.exists():
            text = raw_path.read_text(encoding="utf-8")
        else:
            text = remove_gutenberg_boilerplate(download_text(book["id"]))
            raw_path.write_text(text, encoding="utf-8")
        candidates = make_candidates(text, args.candidates_per_book)
        payload = {**book, "source": f"Project Gutenberg #{book['id']}", "word_count": len(TOKEN_RE.findall(text)), "candidates": candidates}
        (book_dir / "candidates.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        manifest.append({k: payload[k] for k in ("id", "title", "author", "source", "word_count")})
        print(f"[{index}/{len(books)}] {book['title']}: {len(candidates)} candidates")
        time.sleep(1)
    (args.output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
