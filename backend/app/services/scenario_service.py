import json
from app.services.ai_client_service import AIClientService
from app.core.config import settings
from app.prompts.templates import SYSTEM_PROMPT, build_user_prompt

class ScenarioService:
    def __init__(self, ai_clients: AIClientService):
        self.ai = ai_clients

    async def generate_test_cases(self, context_text: str, target_keyword: str, execution_notes: str = "", provider: str = "groq") -> list:
        """
        Orchestrates AI request submission and normalizes results into the standard UI grid layout.
        """
        user_content = build_user_prompt(target_keyword, context_text, execution_notes)
        provider_lower = provider.lower()

        # Engine selection routing
        if provider_lower == "sealion":
            client = self.ai.sealion_client
            model_target = settings.SEALION_MODEL
        else:
            client = self.ai.groq_client
            model_target = settings.GROQ_MODEL

        try:
            response = client.chat.completions.create(
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
            
        except Exception as e:
            # System error structural tracking fallback
            raw_cases = [{
                "Category": "システムエラー",
                "TextItem": f"Fallback recovery route triggered due to processing failure on engine {provider_lower}: {str(e)}",
                "Precondition": "None",
                "Steps": "1. Review server log streams.",
                "InputData": "None",
                "ExpectedResult": "Error is handled gracefully.",
                "Priority": "High"
            }]

        # Standardizing rows to match dashboard template keys perfectly
        final_ui_rows = []
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
            
        return final_ui_rows