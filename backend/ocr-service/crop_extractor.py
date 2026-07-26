import re
import time

class CropExtractor:

    def __init__(self, reader):
        self.reader = reader

    def ocr_text(self, image):
        results = self.reader.readtext(
            image,
            detail=0,
            paragraph=True,
            decoder="greedy"
        )
        return " ".join(results).strip()

    def clean(self, text):
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def extract_registration(self, text):
        patterns = [
            r"\d{4}-[A-Za-z]{2,4}-\d{3,4}",
            r"\d{4}-[A-Za-z]+\d{3,4}",
            r"\d{4}-[A-Za-z]{2,4}-\d+",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group()
        return ""

    def extract_roll(self, text):
        match = re.search(r"\b\d{5,8}\b", text)
        if match:
            return match.group()
        return ""

    def extract_name_father(self, results):
        student_name = ""
        father_name = ""

        lines = []
        for item in results[:10]:
            item = self.clean(item)
            if len(item) > 2:
                lines.append(item)

        # Find "son of" pattern
        for i, text in enumerate(lines):
            lower = text.lower()
            if "son" in lower or "bin" in lower:
                if i > 0 and not student_name:
                    student_name = lines[i - 1]
                if i + 1 < len(lines) and not father_name:
                    father_name = lines[i + 1]
                break

        # If no "son of" found, try alternative
        if not student_name and len(lines) >= 2:
            for i, text in enumerate(lines):
                if re.search(r'^[A-Za-z\s\.]+$', text) and len(text.split()) >= 2:
                    if not student_name:
                        student_name = text
                    elif not father_name and i > 0:
                        father_name = text
                        break

        return student_name, father_name

    def extract_degree(self, text):
        
        text = self.clean(text)
        
        # Match with "degree of X" or "the degree of X"
        match = re.search(r'(?:degree of|the degree of)\s+([A-Z][A-Za-z\s\.]+?)(?:[,\.]|$)', text, re.IGNORECASE)
        if match:
            degree = match.group(1).strip()
            degree = self.clean_degree(degree)
            if degree:
                return degree
        
        # Now Match with "B.S" or "BS" followed by degree name
        match = re.search(r'(B\.S\.?|BS|B\.Sc\.?)\s+([A-Za-z\s]{2,30})(?=[,\.\s]|$)', text, re.IGNORECASE)
        if match:
            prefix = "B.S"
            degree = match.group(2).strip()
            degree = self.clean_degree(degree)
            if degree:
                return f"{prefix} {degree}"
        
        # Now match with "Bachelor of X" or "Master of X"
        match = re.search(r'(Bachelor|Master|Doctor)\s+of\s+([A-Za-z\s]{2,30})(?=[,\.\s]|$)', text, re.IGNORECASE)
        if match:
            level = match.group(1)
            degree = match.group(2).strip()
            degree = self.clean_degree(degree)
            if degree:
                if level.lower() == "bachelor":
                    return f"B.S {degree}"
                elif level.lower() == "master":
                    return f"M.S {degree}"
                else:
                    return f"PhD {degree}"
        
        # Now match with "M.S" or "MS" followed by degree name
        match = re.search(r'(M\.S\.?|MS|M\.Sc\.?)\s+([A-Za-z\s]{2,30})(?=[,\.\s]|$)', text, re.IGNORECASE)
        if match:
            prefix = "M.S"
            degree = match.group(2).strip()
            degree = self.clean_degree(degree)
            if degree:
                return f"{prefix} {degree}"
        
        # Now look for known degrees in the text
        known_degrees = {
            'business administration': 'B.S Business Administration',
            'computer science': 'B.S Computer Science',
            'software engineering': 'B.S Software Engineering',
            'information technology': 'B.S Information Technology',
            'electrical engineering': 'B.S Electrical Engineering',
            'mechanical engineering': 'B.S Mechanical Engineering',
            'civil engineering': 'B.S Civil Engineering',
            'english literature': 'B.S English Literature',
            'mathematics': 'B.S Mathematics',
            'physics': 'B.S Physics',
            'chemistry': 'B.S Chemistry',
            'biology': 'B.S Biology',
            'economics': 'B.S Economics',
            'psychology': 'B.S Psychology',
        }
        
        text_lower = text.lower()
        for key, degree in known_degrees.items():
            if key in text_lower:
                return degree
        
        # If nothing found, try to extract anything with "B.S" or "BS"
        match = re.search(r'(B\.S\.?|BS)\s+([A-Za-z\s]{2,20})', text, re.IGNORECASE)
        if match:
            degree = match.group(2).strip()
            degree = self.clean_degree(degree)
            if degree:
                return f"B.S {degree}"
        
        # Last resort: return empty string
        return ""

    def clean_degree(self, degree):
        # Remove extra spaces
        degree = re.sub(r'\s+', ' ', degree)
        degree = degree.strip()
        
        # Removing common unwanted phrases
        unwanted = [
            r'son of [A-Za-z\s]+',
            r'daughter of [A-Za-z\s]+',
            r'of the [A-Za-z\s]+ College',
            r'of the [A-Za-z\s]+ University',
            r'Government [A-Za-z\s]+',
            r'Graduate College',
            r'University of [A-Za-z\s]+',
            r'M\.A\.O\.',
            r'MAO',
            r'Lahore',
            r'Pakistan',
        ]
        
        for pattern in unwanted:
            degree = re.sub(pattern, '', degree, flags=re.IGNORECASE)
        
        # Remove any remaining "of" at the start
        degree = re.sub(r'^of\s+', '', degree)
        
        # Remove any punctuation at the end
        degree = re.sub(r'[,\.]$', '', degree)
        
        # Clean up extra spaces
        degree = re.sub(r'\s+', ' ', degree)
        degree = degree.strip()
        
        # Only return if it's a valid degree name
        if degree and len(degree) < 40 and not re.search(r'(son|daughter|college|university|government|graduate)', degree, re.IGNORECASE):
            return degree
        
        return ""

    def extract_academic(self, text):
        session = ""
        cgpa = ""

        # Session patterns
        session_match = re.search(r"20\d{2}[-\s]20\d{2}", text)
        if session_match:
            session = session_match.group()
            session = re.sub(r'\s', '-', session)

        # CGPA pattern
        cgpa_patterns = [
            r'C\.G\.P\.A\.?\s*[:.]?\s*([0-4]\.\d{1,2})',
            r'CGPA\s*[:.]?\s*([0-4]\.\d{1,2})',
            r'\b([0-4]\.\d{1,2})\b',
        ]
        
        for pattern in cgpa_patterns:
            cgpa_match = re.search(pattern, text, re.IGNORECASE)
            if cgpa_match:
                cgpa = cgpa_match.group(1) if '(' in pattern else cgpa_match.group(1)
                break

        return session, cgpa

    def extract(self, image):
        h, w = image.shape[:2]
       
        # Registration Number - Top left
        reg_crop = image[
            int(h * 0.03):int(h * 0.14),
            int(w * 0.08):int(w * 0.35)
        ]

        # Roll Number - Top right
        roll_crop = image[
            int(h * 0.03):int(h * 0.14),
            int(w * 0.75):int(w * 0.95)
        ]

        # Name area - Middle left (slightly lower So it helps to avoid header)
        name_crop = image[
            int(h * 0.22):int(h * 0.42),
            int(w * 0.10):int(w * 0.50)
        ]

        # The degree is typically on the line after "the degree of"
        degree_crop = image[
            int(h * 0.45):int(h * 0.58),  # Narrower vertical range
            int(w * 0.08):int(w * 0.52)
        ]

        # Academic info - Bottom
        academic_crop = image[
            int(h * 0.58):int(h * 0.72),
            int(w * 0.08):int(w * 0.50)
        ]

        crops = [reg_crop, roll_crop, degree_crop, academic_crop]
        ocr_results = []
        
        for crop in crops:
            result = self.reader.readtext(
                crop,
                detail=0,
                paragraph=True,
                decoder="greedy"
            )
            ocr_results.append(" ".join(result).strip())

        reg_text, roll_text, degree_text, academic_text = ocr_results

        # Name extraction separately
        name_results = self.reader.readtext(
            name_crop,
            detail=0,
            paragraph=False,
            decoder="greedy"
        )

        # Extracting all fields
        
        registration_number = self.extract_registration(reg_text)
        roll_number = self.extract_roll(roll_text)
        student_name, father_name = self.extract_name_father(name_results)
        degree = self.extract_degree(degree_text)
        session, cgpa = self.extract_academic(academic_text)

        return {
            "student_name": student_name,
            "father_name": father_name,
            "registration_number": registration_number,
            "roll_number": roll_number,
            "degree": degree,
            "session": session,
            "cgpa": cgpa
        }