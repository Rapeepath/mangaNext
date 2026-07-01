import os
import re
import sys
import json
import cv2
import numpy as np
import requests
from PIL import Image, ImageDraw, ImageFont

# Environment & Console setup
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
sys.stdout.reconfigure(encoding='utf-8')

# pyrefly: ignore [missing-import]
from paddleocr import PaddleOCR

# Load SimpleLama for high-quality inpainting
try:
    # pyrefly: ignore [missing-import]
    from simple_lama_inpainting import SimpleLama
    print("LaMa inpainting library loaded successfully.")
except ImportError:
    SimpleLama = None
    print("LaMa inpainting library not found. Falling back to OpenCV.")


def fallback_translate(texts):
    """Translates a list of texts to Thai using deep-translator (GoogleTranslator)."""
    print("Falling back to Deep Translator (GoogleTranslator)...")
    try:
        # pyrefly: ignore [missing-import]
        from deep_translator import GoogleTranslator
        translator = GoogleTranslator(source='en', target='th')
        
        def safe_translate(txt):
            try:
                return translator.translate(txt)
            except Exception:
                return txt
        return [safe_translate(t) for t in texts]
    except Exception as e:
        print(f"Could not use deep-translator: {e}")
        return texts


def group_blocks_geometrically(all_boxes_with_text, max_x_dist=80, max_y_dist=120):
    """Groups text blocks together using Union-Find based on distance thresholds."""
    blocks = []
    for idx, (pts, text) in enumerate(all_boxes_with_text):
        x, y, w, h = cv2.boundingRect(pts)
        blocks.append({"id": idx, "bbox": (x, y, w, h), "pts": pts, "text": text})
        
    parent = list(range(len(blocks)))
    
    def find(i):
        if parent[i] == i:
            return i
        parent[i] = find(parent[i])
        return parent[i]
        
    def union(i, j):
        root_i, root_j = find(i), find(j)
        if root_i != root_j:
            parent[root_i] = root_j

    for i in range(len(blocks)):
        for j in range(i + 1, len(blocks)):
            x1, y1, w1, h1 = blocks[i]["bbox"]
            x2, y2, w2, h2 = blocks[j]["bbox"]
            dx = max(0, x1 - (x2 + w2), x2 - (x1 + w1))
            dy = max(0, y1 - (y2 + h2), y2 - (y1 + h1))
            if dx < max_x_dist and dy < max_y_dist:
                union(i, j)
                
    group_map = {}
    for i in range(len(blocks)):
        group_map.setdefault(find(i), []).append(blocks[i])
        
    sorted_groups = []
    for grp in group_map.values():
        grp.sort(key=lambda b: b["bbox"][1])  # Sort top-to-bottom
        gx, gy, gw, gh = cv2.boundingRect(np.vstack([b["pts"] for b in grp]))
        sorted_groups.append({
            "bbox": (gx, gy, gw, gh),
            "text": " ".join([b["text"] for b in grp])
        })
        
    # Sort by manga reading order: Right-to-Left, Top-to-Bottom
    sorted_groups.sort(key=lambda g: (-g["bbox"][0] - g["bbox"][2]/2, g["bbox"][1]))
    return sorted_groups


def translate_bubbles_gemini(bubbles):
    """Translates speech bubbles to Thai using Gemini API with fallback to deep-translator."""
    if not bubbles:
        return []

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY environment variable not found. Falling back to Deep Translator.")
        return fallback_translate([b["text"] for b in bubbles])

    texts = [b["text"] for b in bubbles]
    prompt = (
        "You are a professional manga translator. Translate the following list of speech bubbles from English to Thai.\n"
        "Keep the tone natural, engaging, and appropriate for a manga. Preserve any formatting or punctuation.\n"
        "Return the translations ONLY as a JSON list of strings, in the exact same order as the input list.\n\n"
        f"Input bubbles:\n{json.dumps(texts, ensure_ascii=False)}"
    )

    for model in ["gemini-3.5-flash", "gemini-3.1-flash-lite"]:
        try:
            print(f"Sending translation request to Gemini API ({model})...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            response = requests.post(
                url, 
                json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseMimeType": "application/json"}},
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            if response.status_code == 200:
                raw_text = response.json()['candidates'][0]['content']['parts'][0]['text'].strip()
                if raw_text.startswith("```"):
                    raw_text = "\n".join(raw_text.splitlines()[1:-1]).strip() if raw_text.endswith("```") else raw_text.strip("`").strip()
                
                translated_list = json.loads(raw_text)
                if isinstance(translated_list, list) and len(translated_list) == len(bubbles):
                    print(f"Gemini translation successful using {model}.")
                    return translated_list
            else:
                print(f"Gemini API ({model}) failed with status {response.status_code}")
        except Exception as e:
            print(f"Error querying Gemini API ({model}): {e}")
            
    print("All Gemini API attempts failed. Falling back to Deep Translator.")
    return fallback_translate(texts)


def wrap_text(text, font, max_width, draw):
    """Wraps text to fit max_width, keeping Thai combining characters attached."""
    if draw.textbbox((0, 0), text, font=font)[2] <= max_width:
        return text
        
    words = text.split(" ") if " " in text else re.findall(r'[^\u0e30-\u0e4e][\u0e30-\u0e4e]*', text)
    join_char = " " if " " in text else ""
    lines, current_line = [], []
    
    for word in words:
        test_line = join_char.join(current_line + [word])
        if draw.textbbox((0, 0), test_line, font=font)[2] <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(join_char.join(current_line))
                current_line = [word]
            else:
                lines.append(word)
                current_line = []
    if current_line:
        lines.append(join_char.join(current_line))
    return "\n".join(lines)


def inpaint_image(img, mask):
    """Inpaints image text regions using LaMa or OpenCV fallback."""
    if SimpleLama is not None:
        try:
            print("Using LaMa model to clean image...")
            pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            pil_mask = Image.fromarray(mask).convert("L")
            pil_clean = SimpleLama()(pil_img, pil_mask)
            return cv2.cvtColor(np.array(pil_clean), cv2.COLOR_RGB2BGR)
        except Exception as e:
            print(f"LaMa error: {e}. Falling back to OpenCV.")
    return cv2.inpaint(img, mask, 5, cv2.INPAINT_NS)


def run_translation_pipeline(img_path="page_038.png", font_path="Itim-Regular.ttf"):
    """Main execution pipeline."""
    img = cv2.imread(img_path)
    if img is None:
        print(f"Error: Could not load image from '{img_path}'")
        return

    print("Running OCR on image...")
    result = PaddleOCR(use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False).predict(img_path)

    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    all_boxes_with_text = []

    for res in result:
        for box, text in zip(res.get("dt_polys", []), res.get("rec_texts", [])):
            if not text.strip() or not re.search(r'[A-Za-z0-9]', text):
                continue
            if re.search(r'[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]', text):
                continue
            pts = np.array(box, dtype=np.int32)
            all_boxes_with_text.append((pts, text))
            cv2.fillPoly(mask, [pts], 255)

    print(f"Detected {len(all_boxes_with_text)} text blocks.")
    mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=1)
    clean = inpaint_image(img, mask)

    grouped_bubbles = group_blocks_geometrically(all_boxes_with_text)
    translated_texts = translate_bubbles_gemini(grouped_bubbles)

    pil_img = Image.fromarray(cv2.cvtColor(clean, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)

    for idx, bubble in enumerate(grouped_bubbles):
        x, y, w, h = bubble["bbox"]
        translated_text = translated_texts[idx] if idx < len(translated_texts) else bubble["text"]
        print(f"Group {idx+1}: '{bubble['text']}' -> '{translated_text}'")
        
        pad_w, pad_h = int(w * 0.08), int(h * 0.10)
        target_w, target_h = max(w - 2 * pad_w, 25), max(h - 2 * pad_h, 25)
        
        font_size = min(54, max(14, int(target_h * 0.5)))
        while True:
            font = ImageFont.truetype(font_path, font_size)
            wrapped_text = wrap_text(translated_text, font, target_w, draw)
            bbox = draw.multiline_textbbox((0, 0), wrapped_text, font=font)
            text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
            if (text_w <= target_w and text_h <= target_h) or font_size <= 12:
                break
            font_size -= 1
            
        text_x = max(x, min(x + pad_w + (target_w - text_w) // 2, x + w - text_w))
        text_y = max(y, min(y + pad_h + (target_h - text_h) // 2, y + h - text_h))
        
        draw.multiline_text((text_x, text_y), wrapped_text, font=font, fill=(0, 0, 0), align="center", spacing=4)

    final_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    cv2.imwrite("mask.png", mask)
    cv2.imwrite("clean.png", clean)
    cv2.imwrite("translated_test.png", final_img)
    print("DONE\nSaved: mask.png, clean.png, translated_test.png")


if __name__ == "__main__":
    run_translation_pipeline()