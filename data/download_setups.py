"""pagoda:ignore"""

"""
Download and optimize setup attachments from Discord CDN.

Reads data/setups.json, downloads all images/videos/audio to
public/setups/{id}/, optimizes images with Pillow, and updates
the JSON to use local paths instead of Discord CDN URLs.

Usage:
    python data/download_setups.py
"""

import json
import os
import shutil
import sys
import time
import re
from pathlib import Path
from urllib.parse import urlparse

import requests
from PIL import Image

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# ============================================================
#                   CONFIG
# ============================================================

SETUPS_JSON = "data/setups.json"
OUTPUT_DIR = "public/setups"
MAX_IMAGE_SIZE = 1200
JPEG_QUALITY = 80
REQUEST_TIMEOUT = 60
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

# ============================================================
#                   HELPERS
# ============================================================

def sanitize_filename(name: str) -> str:
    name = name.replace(" ", "_")
    name = re.sub(r'[<>:"/\\|?*]', "_", name)
    return name

def get_ext_from_url(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path
    ext = os.path.splitext(path)[1].lower()
    if "?" in ext:
        ext = ext.split("?")[0]
    return ext or ".bin"

def get_unique_path(dest_dir: Path, filename: str) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    base, ext = os.path.splitext(filename)
    candidate = dest_dir / filename
    counter = 1
    while candidate.exists():
        candidate = dest_dir / f"{base}_{counter}{ext}"
        counter += 1
    return candidate

# ============================================================
#                   DOWNLOAD
# ============================================================

def download_file(url: str, dest: Path) -> bool:
    try:
        response = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, stream=True)
        response.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"    [ERR] Download failed: {e}")
        return False

# ============================================================
#                   OPTIMIZATION
# ============================================================

def optimize_image(src: Path, dest: Path) -> bool:
    try:
        img = Image.open(src)

        if max(img.size) > MAX_IMAGE_SIZE:
            ratio = MAX_IMAGE_SIZE / max(img.size)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            img = img.resize(new_size, Image.LANCZOS)
            print(f"    resized to {img.size}")

        ext = dest.suffix.lower()
        if ext in (".jpg", ".jpeg"):
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True)
        elif ext == ".png":
            if img.mode == "RGBA":
                img.save(dest, "PNG", optimize=True)
            else:
                img = img.convert("RGB")
                dest_jpg = dest.with_suffix(".jpg")
                img.save(dest_jpg, "JPEG", quality=JPEG_QUALITY, optimize=True)
                return True
        elif ext == ".gif":
            shutil.copy2(src, dest)
        else:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            dest_jpg = dest.with_suffix(".jpg")
            img.save(dest_jpg, "JPEG", quality=JPEG_QUALITY, optimize=True)
            return True

        return True
    except Exception as e:
        print(f"    [ERR] Optimize failed: {e}")
        shutil.copy2(src, dest)
        return True

# ============================================================
#                   AVATAR
# ============================================================

def process_avatar(setup: dict, setup_dir: Path) -> str | None:
    avatar_url = setup.get("avatar", "")
    if not avatar_url:
        return None

    ext = get_ext_from_url(avatar_url)
    avatar_path = get_unique_path(setup_dir, f"avatar{ext}")
    avatar_tmp = setup_dir / f"_tmp_avatar{ext}"

    if avatar_path.exists():
        return avatar_path.as_posix()

    if not download_file(avatar_url, avatar_tmp):
        return None

    try:
        img = Image.open(avatar_tmp)
        if max(img.size) > 256:
            ratio = 256 / max(img.size)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            img = img.resize(new_size, Image.LANCZOS)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(avatar_path, "JPEG", quality=85, optimize=True)
        avatar_tmp.unlink()
    except Exception:
        avatar_tmp.rename(avatar_path)

    return avatar_path.as_posix()

# ============================================================
#                   ATTACHMENT
# ============================================================

def process_attachment(att: dict, setup_dir: Path, index: int, total: int) -> str | None:
    url = att.get("url", "")
    fname = att.get("fileName", f"file_{index}")
    atype = att.get("type", "image")

    ext = get_ext_from_url(url)
    if ext == ".bin":
        ext = os.path.splitext(fname)[1].lower() or ".bin"

    safe_fname = sanitize_filename(fname)
    if not safe_fname.lower().endswith(ext):
        safe_fname = os.path.splitext(safe_fname)[0] + ext

    dest_path = get_unique_path(setup_dir, safe_fname)
    tmp_path = setup_dir / f"_tmp_{safe_fname}"

    if dest_path.exists():
        return dest_path.as_posix()

    print(f"  [{index+1}/{total}] {fname} ({atype})", end="", flush=True)

    if not download_file(url, tmp_path):
        print()
        return None

    original_size = tmp_path.stat().st_size

    if atype == "image":
        print(" -> optimize...", end="", flush=True)
        optimize_image(tmp_path, dest_path)
        if tmp_path.exists():
            tmp_path.unlink()
        final_path = dest_path
    elif atype == "video":
        print(" -> video (as-is)...", end="", flush=True)
        tmp_path.rename(dest_path)
        final_path = dest_path
    elif atype == "audio":
        print(" -> audio...", end="", flush=True)
        tmp_path.rename(dest_path)
        final_path = dest_path
    else:
        tmp_path.rename(dest_path)
        final_path = dest_path

    final_size = final_path.stat().st_size if final_path.exists() else 0
    reduction = ""
    if original_size > 0 and final_size > 0:
        pct = (1 - final_size / original_size) * 100
        if abs(pct) > 1:
            direction = "down" if pct > 0 else "up"
            reduction = f" ({direction} {abs(pct):.0f}%)"

    print(f" OK{reduction}")
    return final_path.as_posix()

# ============================================================
#                   MAIN
# ============================================================

def main():
    script_start = time.time()

    print("=== Setup Rate - Download & Optimize ===\n")

    print("[1/3] Loading data/setups.json...")
    with open(SETUPS_JSON, "r", encoding="utf-8") as f:
        setups = json.load(f)
    print(f"      {len(setups)} setups found\n")

    print("[2/3] Creating backup...")
    backup_path = SETUPS_JSON + ".bak"
    shutil.copy2(SETUPS_JSON, backup_path)
    print(f"      {backup_path}\n")

    outdir = Path(OUTPUT_DIR)
    outdir.mkdir(parents=True, exist_ok=True)

    total_downloaded = 0
    total_skipped = 0
    total_failed = 0

    print("[3/3] Processing setups...\n")

    for s_idx, setup in enumerate(setups):
        sid = str(setup["id"])
        name = setup.get("nickname") or setup.get("name", "unknown")
        setup_dir = outdir / sid
        num_att = len(setup.get("attachments", []))

        print(f"[{s_idx+1}/{len(setups)}] {name} ({num_att} files)")

        avatar_path = process_avatar(setup, setup_dir)
        if avatar_path:
            setup["avatar"] = f"/{avatar_path.removeprefix('public/')}"

        attachments = setup.get("attachments", [])
        for a_idx, att in enumerate(attachments):
            old_url = att.get("url", "")
            local_path = process_attachment(att, setup_dir, a_idx, len(attachments))
            if local_path:
                att["url"] = f"/{local_path.removeprefix('public/')}"
                if old_url == att["url"]:
                    total_skipped += 1
                else:
                    total_downloaded += 1
            else:
                total_failed += 1

    print(f"\n[4/4] Saving updated {SETUPS_JSON}...")
    with open(SETUPS_JSON, "w", encoding="utf-8") as f:
        json.dump(setups, f, indent=2, ensure_ascii=False)

    elapsed = time.time() - script_start
    print(f"\n{'='*50}")
    print(f"Done in {elapsed:.1f}s")
    print(f"  Downloaded: {total_downloaded}")
    print(f"  Skipped:    {total_skipped}")
    print(f"  Failed:     {total_failed}")
    print(f"  Setups:     {len(setups)}")
    print(f"  Backup:     {backup_path}")
    print(f"  Files in:   public/setups/<id>/")

if __name__ == "__main__":
    main()
