#!/usr/bin/env python3
"""Export HDW_企业策划书: MD with rendered flowchart PNGs -> DOCX -> PDF."""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

import export_business_plan as bp

DOCS = bp.DOCS
SRC_MD = bp.SRC_MD
ASSETS = bp.ASSETS
FLOW_DIR = ASSETS / "flowcharts"
OUT_MD = DOCS / "HDW_企业策划书.md"
OUT_DOCX = DOCS / "HDW_企业策划书.docx"
OUT_PDF = DOCS / "HDW_企业策划书.pdf"
MERMAID_CLI = "@mermaid-js/mermaid-cli@11.4.0"


def log(msg: str) -> None:
    sys.stdout.buffer.write((msg + "\n").encode("utf-8", errors="replace"))


def render_mermaid_png(mmd_text: str, png_path: Path) -> None:
    FLOW_DIR.mkdir(parents=True, exist_ok=True)
    mmd_path = png_path.with_suffix(".mmd")
    mmd_path.write_text(mmd_text.strip(), encoding="utf-8")
    cmd = (
        f'npx --yes {MERMAID_CLI} -i "{mmd_path}" -o "{png_path}" '
        f'-b white -s 2 -w 1200'
    )
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if not png_path.exists() or png_path.stat().st_size < 100:
        raise RuntimeError(f"Mermaid render failed for {png_path.name}:\n{result.stderr[-600:]}")


def mermaid_to_images(text: str) -> str:
    counter = 0

    def replacer(match: re.Match) -> str:
        nonlocal counter
        counter += 1
        png_path = FLOW_DIR / f"flow-{counter:02d}.png"
        log(f"  Rendering flowchart {counter} -> {png_path.name}")
        render_mermaid_png(match.group(1), png_path)
        rel = png_path.relative_to(DOCS).as_posix()
        return f"\n\n![流程图 {counter}]({rel})\n\n"

    return re.sub(r"```mermaid\n(.*?)```", replacer, text, flags=re.DOTALL)


def preprocess_enterprise_md(text: str, url_map: dict[str, str]) -> str:
    for url, rel_path in url_map.items():
        text = text.replace(url, rel_path)
    text = mermaid_to_images(text)
    text = re.sub(r"\[([^\]]+)\]\(#[^)]+\)", r"\1", text)
    text = bp.add_chapter_page_breaks(text)
    return text


def build_cover(paths: dict[str, Path]) -> str:
    return f"""# HDW 建材城 · 企业策划书

**HDW LLC — 构筑理想空间，智造美好生活**

![封面 Hero]({bp.rel(paths['hero'])})

**总部：** 5134 Biloxi Ave., North Hollywood, CA 91601  
**联系人：** Duke Wang · 323-853-3333 · dukewang@gmail.com  
**版本：** v1.0 · 2026年6月

```{{=openxml}}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

"""


def build_gallery(paths: dict[str, Path]) -> str:
    gallery = "\n\n" + bp.PAGE_BREAK + "## 附录 B · 品牌与产品视觉图库\n\n"
    for i, (name, _, caption) in enumerate(bp.IMAGE_URLS):
        if i > 0:
            gallery += bp.PAGE_BREAK
        gallery += f"### {caption}\n\n![{caption}]({bp.rel(paths[name])})\n\n"
    return gallery


def safe_write(target: Path, writer) -> Path:
    try:
        writer(target)
        return target
    except PermissionError:
        alt = target.with_stem(target.stem + "_新")
        writer(alt)
        log(f"File locked — saved as: {alt.name}")
        return alt


def main() -> int:
    if not SRC_MD.exists():
        log(f"Missing source: {SRC_MD}")
        return 1

    log("Step 1: Download brand images...")
    paths = bp.download_images()
    url_map = {url: bp.rel(paths[name]) for name, url, _ in bp.IMAGE_URLS}

    log("Step 2: Render Mermaid flowcharts to PNG...")
    body = preprocess_enterprise_md(SRC_MD.read_text(encoding="utf-8"), url_map)
    content = build_cover(paths) + body + build_gallery(paths)
    OUT_MD.write_text(content, encoding="utf-8")
    log(f"MD OK: {OUT_MD}")

    log("Step 3: Pandoc -> DOCX...")
    tmp_docx = OUT_DOCX.with_suffix(".tmp.docx")

    def write_docx(path: Path) -> None:
        bp.export_docx(OUT_MD, tmp_docx)
        shutil.move(str(tmp_docx), str(path))

    out_docx = safe_write(OUT_DOCX, write_docx)
    log(f"DOCX OK: {out_docx} ({out_docx.stat().st_size // 1024} KB)")

    log("Step 4: Word -> PDF...")
    out_pdf = OUT_PDF
    if not bp.export_pdf_via_word(out_docx, out_pdf):
        out_pdf = DOCS / "HDW_企业策划书_新.pdf"
        if not bp.export_pdf_via_word(out_docx, out_pdf):
            log("PDF export failed — open DOCX in Word and Save As PDF.")
            return 2
        log(f"PDF locked — saved as: {out_pdf.name}")
    else:
        log(f"PDF OK: {out_pdf} ({out_pdf.stat().st_size // 1024} KB)")

    log("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
