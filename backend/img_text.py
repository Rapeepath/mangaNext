from paddleocr import PaddleOCR

ocr = PaddleOCR(lang="en", device="cpu")

result = ocr.predict("page_001.png")

page = result[0]

for text, score in zip(
    page["rec_texts"],
    page["rec_scores"]
):
    print(f"{text} ({score:.2f})")