import base64
import io
from docx import Document

class WordParserService:
    def __init__(self):
        pass

    async def parse_and_filter_spec(self, base64_data: str, target_keyword: str) -> str:
        """
        Decodes base64 Word files (.docx) and extracts sections/paragraphs 
        matching the target keyword to optimize token usage.
        """
        # 1. Decode Base64 back into raw bytes
        file_bytes = base64.b64decode(base64_data)
        word_stream = io.BytesIO(file_bytes)
        
        # 2. Open Word Document in-memory
        doc = Document(word_stream)
        compiled_paragraphs = []
        keyword = target_keyword.strip().lower()
        
        # Extract all text blocks safely
        all_paras = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        
        # 3. Search and extract keyword context matching blocks
        for idx, text in enumerate(all_paras):
            if keyword in text.lower():
                # Grab a little surrounding context (1 paragraph before and 1 after) if possible
                start_idx = max(0, idx - 1)
                end_idx = min(len(all_paras), idx + 2)
                
                compiled_paragraphs.append(f"--- Document Excerpt Segment ---")
                for context_text in all_paras[start_idx:end_idx]:
                    if context_text not in compiled_paragraphs:
                        compiled_paragraphs.append(context_text)
        
        # 4. Fallback if the keyword is not explicitly written in the paragraphs
        if not compiled_paragraphs:
            compiled_paragraphs.append("--- Document Sample (Keyword Not Explicitly Found) ---")
            # Return first 30 paragraphs as baseline text
            compiled_paragraphs.extend(all_paras[:30])
                        
        return "\n\n".join(compiled_paragraphs)