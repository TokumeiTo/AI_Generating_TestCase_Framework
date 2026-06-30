import json
import asyncio
from app.services.ai_client_service import AIClientService
from app.services.excel_service import ExcelParserService
from app.services.word_service import WordParserService
from app.core.config import settings
from app.prompts.templates import SYSTEM_PROMPT, build_user_prompt

class ScenarioService:
    def __init__(
        self, ai_clients: AIClientService,
        excel_parser: ExcelParserService,
        word_parser: WordParserService
    ):
        self.ai = ai_clients
        self.excel_parser = excel_parser
        self.word_parser = word_parser

    async def generate_test_cases(
        self,
        base64_data: str,
        file_name: str,
        target_keyword: str,
        execution_notes: str = "",
        provider: str = "groq") -> list:
        """
        Orchestrates document parsing (Excel or Word), AI request submission, 
        and normalizes results into the standard UI grid layout.
        """
        provider_lower = provider.lower()
        file_name_lower = file_name.strip().lower()
        final_ui_rows = []

        try:
            # 1. Parse Document
            if file_name_lower.endswith('.xlsx'):
                context_text = await self.excel_parser.parse_and_filter_spec(base64_data, target_keyword)
            elif file_name_lower.endswith('.docx') or file_name_lower.endswith('.doc'):
                context_text = await self.word_parser.parse_and_filter_spec(base64_data, target_keyword)
            else:
                raise ValueError("Unsupported file format. Please upload an Excel (.xlsx) or Word (.docx) document.")
            
            user_content = build_user_prompt(target_keyword, context_text, execution_notes)
                
            # 2. Engine selection routing
            if provider_lower == "sealion":
                client = self.ai.sealion_client
                model_target = settings.SEALION_MODEL
            else:
                client = self.ai.groq_client
                model_target = settings.GROQ_MODEL

            # 3. Non-blocking AI Execution
            # Using to_thread ensures synchronous SDK clients don't stall the async event loop
            response = await asyncio.to_thread(
                client.chat.completions.create,
                model=model_target,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            raw_content = response.choices[0].message.content.strip()
            ai_json = json.loads(raw_content)
            raw_cases = ai_json.get("test_cases", [])

            # 4. Standardizing rows to match dashboard template keys perfectly
            for idx, case in enumerate(raw_cases):
                final_ui_rows.append({
                    "No": idx + 1,
                    "Category": case.get("Category", "未分類"),
                    "TextItem": case.get("TextItem", ""),
                    "Precondition": case.get("Precondition", ""),
                    "Steps": case.get("Steps", ""),
                    "InputData": case.get("InputData", ""),
                    "ExpectedResult": case.get("ExpectedResult", ""),
                    "Priority": case.get("Priority", "Medium")
                })
                
        except Exception as e:
            # System error structural tracking fallback
            final_ui_rows = [{
                "No": 1,
                "Category": "システムエラー",
                "TextItem": f"Fallback recovery route triggered due to processing failure on engine {provider_lower}: {str(e)}",
                "Precondition": "None",
                "Steps": "1. Review server log streams.",
                "InputData": "None",
                "ExpectedResult": "Error is handled gracefully.",
                "Priority": "High"
            }]
            
        return final_ui_rows