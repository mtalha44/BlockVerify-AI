// backend/src/services/hash/sha256Service.js
import crypto from "crypto";

class SHA256Service {
  /**
   * Normalize student data before hashing.
   * Ensures identical data always produces the same hash.
   */
  normalize(student) {
    return {
      student_name: (student.studentName || student.student_name || "")
        .trim()
        .toLowerCase(),
      father_name: (student.fatherName || student.father_name || "")
        .trim()
        .toLowerCase(),
      registration_number: (
        student.registrationNumber ||
        student.registration_number ||
        ""
      )
        .trim()
        .toLowerCase(),
      roll_number: (student.rollNumber || student.roll_number || "")
        .trim()
        .toLowerCase(),
      degree: (student.degree || "").trim().toLowerCase(),
      session: (student.session || "").trim().toLowerCase(),
      cgpa: String(student.cgpa || "").trim(),
      university_name: (student.universityName || student.university_name || "")
        .trim()
        .toLowerCase(),
    };
  }

  /**
   * Generate deterministic SHA-256 hash.
   * Returns 0x-prefixed hash.
   */
  generate(student) {
    const normalized = this.normalize(student);
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(normalized))
      .digest("hex");
    return "0x" + hash;
  }

  /**
   * Generate hash and return normalized data.
   */
  generateWithData(student) {
    const normalized = this.normalize(student);
    const hash =
      "0x" +
      crypto
        .createHash("sha256")
        .update(JSON.stringify(normalized))
        .digest("hex");
    return {
      hash,
      normalized,
    };
  }

  /**
   * Verify hash matches student data.
   */
  verify(student, hash) {
    return this.generate(student) === hash;
  }

  /**
   * Generate batch of hashes from students array.
   */
  generateBatch(students) {
    return students.map((student) => ({
      ...student,
      hash: this.generate(student),
    }));
  }
}

export default new SHA256Service();
