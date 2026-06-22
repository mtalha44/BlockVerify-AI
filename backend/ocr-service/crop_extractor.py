import re


class CropExtractor:

    def __init__(self, reader):
        self.reader = reader

    # ==================================================
    # OCR HELPER
    # ==================================================

    def ocr_text(self, image):

        results = self.reader.readtext(
            image,
            detail=0,
            paragraph=True,
            decoder="greedy"
        )

        return " ".join(results).strip()

    # ==================================================
    # CLEAN
    # ==================================================

    def clean(self, text):

        text = re.sub(r"\s+", " ", text)

        return text.strip()

    # ==================================================
    # REGISTRATION
    # ==================================================

    def extract_registration(self, text):

        match = re.search(
            r"\d{4}-[A-Za-z]{2,4}-\d{3,4}",
            text
        )

        if match:
            return match.group()

        return ""

    # ==================================================
    # ROLL NUMBER
    # ==================================================

    def extract_roll(self, text):

        match = re.search(
            r"\d{5,8}",
            text
        )

        if match:
            return match.group()

        return ""

    # ==================================================
    # STUDENT + FATHER
    # ==================================================

    def extract_name_father(self, results):

        lines = []

        for item in results:

            item = self.clean(item)

            if len(item) < 3:
                continue

            lines.append(item)

        student_name = ""
        father_name = ""

        for i, text in enumerate(lines):

            lower = text.lower()

            if "son" in lower:

                if i > 0:
                    student_name = lines[i - 1]

                if i + 1 < len(lines):
                    father_name = lines[i + 1]

                break

        return student_name, father_name

    # ==================================================
    # DEGREE
    # ==================================================

    def extract_degree(self, text):

        allowed = [

            "B.S Business Administration",
            "BS Business Administration",

            "B.S Computer Science",
            "BS Computer Science",

            "B.S Software Engineering",
            "BS Software Engineering",

            "B.S Information Technology",
            "BS Information Technology",

            "BS IT",
            "B.S IT"
        ]

        text_lower = text.lower()

        for degree in allowed:

            if degree.lower() in text_lower:
                return degree

        return text

    # ==================================================
    # SESSION + CGPA
    # ==================================================

    def extract_academic(self, text):

        session = ""
        cgpa = ""

        session_match = re.search(
            r"20\d{2}-20\d{2}",
            text
        )

        if session_match:
            session = session_match.group()

        cgpa_match = re.search(
            r"\b[0-4]\.\d{1,2}\b",
            text
        )

        if cgpa_match:
            cgpa = cgpa_match.group()

        return session, cgpa

    # ==================================================
    # MAIN
    # ==================================================

    def extract(self, image):

        h, w = image.shape[:2]

        # -----------------------------------------
        # CROPS
        # -----------------------------------------

        reg_crop = image[
            int(h * 0.04):int(h * 0.16),
            int(w * 0.08):int(w * 0.30)
        ]

        roll_crop = image[
            int(h * 0.04):int(h * 0.16),
            int(w * 0.78):int(w * 0.96)
        ]

        name_crop = image[
            int(h * 0.24):int(h * 0.45),
            int(w * 0.12):int(w * 0.48)
        ]

        degree_crop = image[
            int(h * 0.38):int(h * 0.56),
            int(w * 0.12):int(w * 0.55)
        ]

        academic_crop = image[
            int(h * 0.50):int(h * 0.72),
            int(w * 0.10):int(w * 0.50)
        ]

        # -----------------------------------------
        # OCR ONCE PER CROP
        # -----------------------------------------

        reg_text = self.clean(
            self.ocr_text(reg_crop)
        )

        roll_text = self.clean(
            self.ocr_text(roll_crop)
        )

        degree_text = self.clean(
            self.ocr_text(degree_crop)
        )

        academic_text = self.clean(
            self.ocr_text(academic_crop)
        )

        name_results = self.reader.readtext(
            name_crop,
            detail=0,
            paragraph=False,
            decoder="greedy"
        )

        # -----------------------------------------
        # EXTRACTION
        # -----------------------------------------

        registration_number = self.extract_registration(
            reg_text
        )

        roll_number = self.extract_roll(
            roll_text
        )

        student_name, father_name = self.extract_name_father(
            name_results
        )

        degree = self.extract_degree(
            degree_text
        )

        session, cgpa = self.extract_academic(
            academic_text
        )

        return {

            "student_name": student_name,

            "father_name": father_name,

            "registration_number": registration_number,

            "roll_number": roll_number,

            "degree": degree,

            "session": session,

            "cgpa": cgpa
        }