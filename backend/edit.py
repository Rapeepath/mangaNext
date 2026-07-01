from numpy import dtype
import cv2
import numpy as np
import re
# pyrefly: ignore [missing-import]
from paddleocr import PaddleOCR
from PIL import Image, ImageDraw, ImageFont
import os
import json
import requests
import sys

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
sys.stdout.reconfigure(encoding ='utf-8')


def run_translation_pipeline():
    img_path="page_038.png"
    font_path="Itim-Regular.ttf"
    img = cv2.imread(img_path)
    
    print("running on ocn")
    result = PaddleOCR(use_doc_orientation_classify = False,use_doc_unwarping = False).predict(img_path)


    mask = np.zeros(img.shape[:2],dtype = np.uint8)
    all_boxes_with_text = []
    for res in result: 
        for box , text in zip(res.get("dt_polys",[]), res.get("rec_texts",[])):
            if not text.strip() or not re.search(r"[A-Za-z0-9]",text):
                continue
            if re.search(r'[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]',text):
                continue
            pts = np.array(box,dtype=np.int32)
            all_boxes_with_text.append((pts,text))
            cv2.fillPoly(mask,[pts],255)
    print(f"Detected {len(all_boxes_with_text)} text blocks.")


if __name__ == "__main__":
    run_translation_pipeline()
