// backend/src/controllers/certificate/excelController.js
import certificateBatchService from "../../services/certificate/certificateBatchService.js";

// BULK IMPORT FROM EXCEL
export const bulkImportFromExcel = async (req, res) => {
  try {
    const result = await certificateBatchService.importExcel(
      req.file,
      req.user,
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Bulk Import Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
