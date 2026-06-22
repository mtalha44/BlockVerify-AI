// backend/src/services/ocr/easyOcrService.js
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

class EasyOCRService {
  constructor() {
    this.ocrUrl = process.env.OCR_SERVICE_URL || "http://localhost:8000";
    this.initialized = false;
    this.cache = new Map();
    this.connectionAttempts = 0;
    this.maxAttempts = 3;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log(`🔗 Connecting to OCR Service at ${this.ocrUrl}...`);

      const response = await axios.get(`${this.ocrUrl}/health`, {
        timeout: 5000,
      });

      if (response.data && response.data.status === "ready") {
        this.initialized = true;
        this.connectionAttempts = 0;
        console.log("✅ OCR Service connected and ready");
        return true;
      }
      throw new Error("OCR service not ready");
    } catch (error) {
      console.warn(`⚠️ OCR Service not available: ${error.message}`);
      console.warn(`💡 Make sure OCR service is running on port 8000`);
      console.warn(
        `💡 Run: cd backend/ocr-service && venv\\Scripts\\activate && python main.py`,
      );

      this.connectionAttempts++;

      if (this.connectionAttempts < this.maxAttempts) {
        console.log(
          `🔄 Retry attempt ${this.connectionAttempts + 1}/${
            this.maxAttempts
          }...`,
        );
        // Wait 2 seconds and retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return this.initialize();
      }

      throw new Error("OCR Service not available after multiple attempts");
    }
  }

  async extractFields(imagePath) {
    try {
      await this.initialize();

      // Check cache
      const cacheKey = `${imagePath}_${fs.statSync(imagePath).mtimeMs}`;
      if (this.cache.has(cacheKey)) {
        console.log("📦 Using cached OCR result");
        return this.cache.get(cacheKey);
      }

      console.log(`🔍 Sending to OCR Service: ${path.basename(imagePath)}`);

      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found: ${imagePath}`);
      }

      const formData = new FormData();
      formData.append("file", fs.createReadStream(imagePath));

      const response = await axios.post(`${this.ocrUrl}/ocr`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60 seconds timeout
      });

      console.log(`📥 OCR Response Status: ${response.status}`);

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || "OCR processing failed");
      }

      // Cache result
      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(cacheKey, result);

      console.log(`✅ OCR complete (${result.processing_time?.toFixed(2)}s)`);
      console.log("📊 Fields:", result.fields);

      return {
        success: true,
        fields: result.fields,
        text: result.text,
        confidence: result.confidence,
        processingTime: result.processing_time,
      };
    } catch (error) {
      console.error("❌ OCR error:", error.message);

      // Check if it's a connection error
      if (error.code === "ECONNREFUSED" || error.code === "ECONNRESET") {
        console.error("💡 OCR Service is not running or not accessible");
        console.error(
          "💡 Start OCR service with: cd backend/ocr-service && venv\\Scripts\\activate && python main.py",
        );
      }

      return {
        success: false,
        error: error.message,
        fields: null,
      };
    }
  }

  async processImage(imagePath) {
    return this.extractFields(imagePath);
  }

  clearCache() {
    this.cache.clear();
    console.log("🗑️ OCR cache cleared");
  }
}

export default new EasyOCRService();
