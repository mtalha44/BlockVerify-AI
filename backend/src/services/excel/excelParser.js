// backend/src/services/excel/excelParser.js
import xlsx from "xlsx";
import path from "path";

class ExcelParser {
  /**
   * Read Excel file and return student records.
   */
  parse(filePath, universityName = "Unknown") {
    // Validate file exists
    if (!filePath) {
      throw new Error("No file path provided");
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    const validExtensions = [".xlsx", ".xls", ".csv"];
    if (!validExtensions.includes(ext)) {
      throw new Error(
        `Invalid file type. Supported: ${validExtensions.join(", ")}`,
      );
    }

    let workbook;
    try {
      workbook = xlsx.readFile(filePath);
    } catch (error) {
      throw new Error(`Failed to read Excel file: ${error.message}`);
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("Spreadsheet contains no sheets");
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with empty string default
    const rows = xlsx.utils.sheet_to_json(worksheet, {
      defval: "",
    });

    if (!rows || rows.length === 0) {
      throw new Error("Spreadsheet is empty or has no data rows.");
    }

    // Validate headers
    const firstRow = rows[0];
    const requiredFields = ["Student Name", "Registration Number", "Degree"];
    const missingFields = requiredFields.filter(
      (field) => !(field in firstRow),
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required columns: ${missingFields.join(", ")}`);
    }

    const students = [];
    const errors = [];
    const registrations = new Set();

    rows.forEach((row, index) => {
      try {
        const student = this.normalizeRow(row, universityName);
        const validation = this.validateStudent(student);

        if (!validation.valid) {
          errors.push({
            row: index + 2, // +2 because Excel rows start at 1 and header is row 1
            error: validation.message,
            data: row,
          });
          return;
        }

        // Check for duplicate registration numbers
        if (registrations.has(student.registrationNumber)) {
          errors.push({
            row: index + 2,
            error: `Duplicate Registration Number: ${student.registrationNumber}`,
            data: row,
          });
          return;
        }

        registrations.add(student.registrationNumber);
        students.push(student);
      } catch (err) {
        errors.push({
          row: index + 2,
          error: err.message,
          data: row,
        });
      }
    });

    return {
      students,
      errors,
      total: rows.length,
      validCount: students.length,
      errorCount: errors.length,
    };
  }

  /**
   * Convert Excel row into standard student object.
   */
  normalizeRow(row, universityName) {
    return {
      studentName: (
        row["Student Name"] ||
        row["studentName"] ||
        row["Name"] ||
        ""
      ).trim(),
      fatherName: (row["Father Name"] || row["fatherName"] || "").trim(),
      registrationNumber: (
        row["Registration Number"] ||
        row["registrationNumber"] ||
        row["Reg No"] ||
        ""
      ).trim(),
      rollNumber: (row["Roll Number"] || row["rollNumber"] || "").trim(),
      degree: (row["Degree"] || row["degree"] || "").trim(),
      session: (row["Session"] || row["session"] || "").trim(),
      cgpa: String(row["CGPA"] || row["cgpa"] || "").trim(),
      universityName:
        universityName ||
        row["University Name"] ||
        row["universityName"] ||
        "Unknown",
    };
  }

  /**
   * Validate required student fields.
   */
  validateStudent(student) {
    if (!student.studentName) {
      return { valid: false, message: "Student Name missing" };
    }
    if (!student.registrationNumber) {
      return { valid: false, message: "Registration Number missing" };
    }
    if (!student.degree) {
      return { valid: false, message: "Degree missing" };
    }
    return { valid: true };
  }

  /**
   * Validate file size and type
   */
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!validTypes.includes(file.mimetype)) {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    return true;
  }
}

export default new ExcelParser();
