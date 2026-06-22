# import time
# import fitz
# import cv2
# import easyocr
# import numpy as np

# from fastapi import FastAPI
# from fastapi import UploadFile
# from fastapi import File
# from fastapi.responses import JSONResponse

# from crop_extractor import CropExtractor

# app = FastAPI(
#     title="BlockVerify Crop OCR"
# )

# # =====================================================
# # GLOBAL OCR MODEL
# # =====================================================

# reader = None
# extractor = None
# READY = False

# # =====================================================
# # STARTUP
# # =====================================================

# @app.on_event("startup")
# def startup():

#     global reader
#     global extractor
#     global READY

#     print("Loading EasyOCR...")

#     reader = easyocr.Reader(
#         ['en'],
#         gpu=False,
#         verbose=False
#     )

#     extractor = CropExtractor(
#         reader
#     )

#     READY = True

#     print("EasyOCR Ready")


# # =====================================================
# # PDF TO IMAGE
# # =====================================================

# def pdf_to_image(pdf_bytes):

#     document = fitz.open(
#         stream=pdf_bytes,
#         filetype="pdf"
#     )

#     page = document[0]

#     pix = page.get_pixmap(
#         matrix=fitz.Matrix(1.5, 1.5),
#         alpha=False
#     )

#     img = np.frombuffer(
#         pix.samples,
#         dtype=np.uint8
#     )

#     img = img.reshape(
#         pix.height,
#         pix.width,
#         pix.n
#     )

#     if pix.n == 4:

#         img = cv2.cvtColor(
#             img,
#             cv2.COLOR_RGBA2BGR
#         )

#     else:

#         img = cv2.cvtColor(
#             img,
#             cv2.COLOR_RGB2BGR
#         )

#     return img


# # =====================================================
# # IMAGE PREPROCESS
# # =====================================================

# def preprocess(img):

#     h, w = img.shape[:2]

#     # resize huge images only
#     if w > 1800:

#         scale = 1800 / w

#         img = cv2.resize(
#             img,
#             (
#                 int(w * scale),
#                 int(h * scale)
#             ),
#             interpolation=cv2.INTER_AREA
#         )

#     return img


# # =====================================================
# # OCR API
# # =====================================================

# @app.post("/ocr")
# async def ocr(
#     file: UploadFile = File(...)
# ):

#     global READY

#     if not READY:

#         return JSONResponse(
#             {
#                 "success": False,
#                 "error": "OCR not ready"
#             },
#             status_code=503
#         )

#     start = time.time()

#     try:

#         contents = await file.read()

#         filename = file.filename.lower()

#         # ==========================================
#         # PDF
#         # ==========================================

#         if filename.endswith(".pdf"):

#             img = pdf_to_image(
#                 contents
#             )

#         # ==========================================
#         # IMAGE
#         # ==========================================

#         else:

#             np_arr = np.frombuffer(
#                 contents,
#                 np.uint8
#             )

#             img = cv2.imdecode(
#                 np_arr,
#                 cv2.IMREAD_COLOR
#             )

#         if img is None:

#             return {
#                 "success": False,
#                 "error": "Invalid file"
#             }

#         img = preprocess(
#             img
#         )

#         fields = extractor.extract(
#             img
#         )

#         return {

#             "success": True,

#             "fields": fields,

#             "processing_time": round(
#                 time.time() - start,
#                 2
#             )
#         }

#     except Exception as e:

#         return JSONResponse(
#             {
#                 "success": False,
#                 "error": str(e)
#             },
#             status_code=500
#         )


# # =====================================================
# # RUN
# # =====================================================

# if __name__ == "__main__":

#     import uvicorn

#     uvicorn.run(
#         app,
#         host="0.0.0.0",
#         port=8000
#     )




# backend/ocr-service/main.py
import time
import fitz
import cv2
import easyocr
import numpy as np

from fastapi import FastAPI
from fastapi import UploadFile
from fastapi import File
from fastapi.responses import JSONResponse

from crop_extractor import CropExtractor

app = FastAPI(
    title="BlockVerify Crop OCR"
)

# =====================================================
# GLOBAL OCR MODEL
# =====================================================

reader = None
extractor = None
READY = False

# =====================================================
# STARTUP
# =====================================================

@app.on_event("startup")
def startup():

    global reader
    global extractor
    global READY

    print("Loading EasyOCR...")

    reader = easyocr.Reader(
        ['en'],
        gpu=False,
        verbose=False
    )

    extractor = CropExtractor(
        reader
    )

    READY = True

    print("EasyOCR Ready")


# =====================================================
# HEALTH CHECK ENDPOINT - ADD THIS
# =====================================================

@app.get("/health")
async def health_check():
    return {
        "status": "ready" if READY else "loading",
        "reader_loaded": READY,
        "service": "BlockVerify Crop OCR"
    }


# =====================================================
# PDF TO IMAGE
# =====================================================

def pdf_to_image(pdf_bytes):

    document = fitz.open(
        stream=pdf_bytes,
        filetype="pdf"
    )

    page = document[0]

    pix = page.get_pixmap(
        matrix=fitz.Matrix(1.5, 1.5),
        alpha=False
    )

    img = np.frombuffer(
        pix.samples,
        dtype=np.uint8
    )

    img = img.reshape(
        pix.height,
        pix.width,
        pix.n
    )

    if pix.n == 4:

        img = cv2.cvtColor(
            img,
            cv2.COLOR_RGBA2BGR
        )

    else:

        img = cv2.cvtColor(
            img,
            cv2.COLOR_RGB2BGR
        )

    return img


# =====================================================
# IMAGE PREPROCESS
# =====================================================

def preprocess(img):

    h, w = img.shape[:2]

    # resize huge images only
    if w > 1800:

        scale = 1800 / w

        img = cv2.resize(
            img,
            (
                int(w * scale),
                int(h * scale)
            ),
            interpolation=cv2.INTER_AREA
        )

    return img


# =====================================================
# OCR API
# =====================================================

@app.post("/ocr")
async def ocr(
    file: UploadFile = File(...)
):

    global READY

    if not READY:

        return JSONResponse(
            {
                "success": False,
                "error": "OCR not ready"
            },
            status_code=503
        )

    start = time.time()

    try:

        contents = await file.read()

        filename = file.filename.lower()

        # ==========================================
        # PDF
        # ==========================================

        if filename.endswith(".pdf"):

            img = pdf_to_image(
                contents
            )

        # ==========================================
        # IMAGE
        # ==========================================

        else:

            np_arr = np.frombuffer(
                contents,
                np.uint8
            )

            img = cv2.imdecode(
                np_arr,
                cv2.IMREAD_COLOR
            )

        if img is None:

            return {
                "success": False,
                "error": "Invalid file"
            }

        img = preprocess(
            img
        )

        fields = extractor.extract(
            img
        )

        return {

            "success": True,

            "fields": fields,

            "processing_time": round(
                time.time() - start,
                2
            )
        }

    except Exception as e:

        return JSONResponse(
            {
                "success": False,
                "error": str(e)
            },
            status_code=500
        )


# =====================================================
# RUN
# =====================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )