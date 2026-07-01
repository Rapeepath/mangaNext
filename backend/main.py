import requests
import os
import json
from pathlib import Path

TITLE = "Replica datte, Koi wo Suru."

# ==================================================
# Utility
# ==================================================

def sanitize_filename(name):
    invalid_chars = r'<>:"/\|?*'
    for char in invalid_chars:
        name = name.replace(char, "_")
    return name.strip()


# ==================================================
# Search Manga
# ==================================================

print(f"Searching: {TITLE}")

res = requests.get(
    "https://api.mangadex.org/manga",
    params={
        "title": TITLE,
        "limit": 10
    }
)

res.raise_for_status()

data = res.json()

if not data["data"]:
    raise Exception("Manga not found")

manga = data["data"][0]

manga_id = manga["id"]
manga_title = next(iter(manga["attributes"]["title"].values()))

print(f"\nFound Manga: {manga_title}")
print(f"Manga ID: {manga_id}")


# ==================================================
# Get Chapter List
# ==================================================

print("\nFetching chapters...")

res = requests.get(
    f"https://api.mangadex.org/manga/{manga_id}/feed",
    params={
        "translatedLanguage[]": ["en"],
        "order[chapter]": "asc",
        "limit": 500
    }
)

res.raise_for_status()

feed = res.json()

chapter_id = None
chapter_num = None
chapter_title = None

for chapter in feed["data"]:

    attrs = chapter["attributes"]

    external_url = attrs.get("externalUrl")

    if external_url is not None:
        continue

    if attrs.get("chapter") is None:
        continue

    chapter_id = chapter["id"]
    chapter_num = attrs.get("chapter")
    chapter_title = attrs.get("title")

    break

if chapter_id is None:
    raise Exception("No readable chapter found")

print("\nSelected Chapter")
print("Chapter:", chapter_num)
print("Title:", chapter_title)


# ==================================================
# Get Page Information
# ==================================================

print("\nFetching page list...")

res = requests.get(
    f"https://api.mangadex.org/at-home/server/{chapter_id}"
)

res.raise_for_status()

chapter_data = res.json()

if "baseUrl" not in chapter_data:
    print(chapter_data)
    raise Exception("Cannot get image server")

base_url = chapter_data["baseUrl"]
hash_value = chapter_data["chapter"]["hash"]
pages = chapter_data["chapter"]["data"]

print(f"Total Pages: {len(pages)}")


# ==================================================
# Create Folder
# ==================================================

safe_title = sanitize_filename(manga_title)

save_dir = Path(
    "downloads"
) / safe_title / f"chapter_{chapter_num}"

save_dir.mkdir(
    parents=True,
    exist_ok=True
)

print(f"\nSave Folder:")
print(save_dir)


# ==================================================
# Download Pages
# ==================================================

metadata = {
    "manga_id": manga_id,
    "manga_title": manga_title,
    "chapter_id": chapter_id,
    "chapter": chapter_num,
    "chapter_title": chapter_title,
    "total_pages": len(pages),
    "pages": []
}

print("\nDownloading pages...\n")

for index, page_file in enumerate(pages, start=1):

    image_url = (
        f"{base_url}/data/"
        f"{hash_value}/"
        f"{page_file}"
    )

    ext = page_file.split(".")[-1]

    filename = f"page_{index:03d}.{ext}"

    filepath = save_dir / filename

    print(f"[{index}/{len(pages)}] {filename}")

    image_res = requests.get(image_url)

    image_res.raise_for_status()

    with open(filepath, "wb") as f:
        f.write(image_res.content)

    metadata["pages"].append({
        "page_number": index,
        "filename": filename,
        "image_url": image_url
    })


# ==================================================
# Save Metadata
# ==================================================

metadata_path = save_dir / "chapter_metadata.json"

with open(
    metadata_path,
    "w",
    encoding="utf-8"
) as f:
    json.dump(
        metadata,
        f,
        ensure_ascii=False,
        indent=4
    )

print("\nDone!")
print(f"Metadata saved: {metadata_path}")