// backend/test-ocr.js
import easyOCRService from "./src/services/ocr/easyOcrService.js";

async function testOCR() {
  const imagePath = "./test-image.png";

  console.log("Testing OCR...");
  const result = await easyOCRService.processCertificateImage(imagePath);

  console.log("Result:", JSON.stringify(result, null, 2));
}

testOCR();
