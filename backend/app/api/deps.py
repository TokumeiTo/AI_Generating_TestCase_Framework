from fastapi import Depends
from app.services.ai_client_service import AIClientService
from app.services.scenario_service import ScenarioService
from app.services.excel_service import ExcelParserService

# 1. Base HTTP Client Infrastructure Provider
def get_ai_client_service() -> AIClientService:
    """
    Provides a singleton-like instance of initialized AI clients 
    (Groq and SEA-LION) reading configuration parameters directly from core settings.
    """
    return AIClientService()

# 2. Excel Parsing Infrastructure Provider
def get_excel_parser_service() -> ExcelParserService:
    """
    Provides the execution instance for processing binary stream spreadsheet inputs
    and extracting design criteria tokens.
    """
    return ExcelParserService()

# 3. High-Level Orchestrator Service Provider
def get_scenario_service(
    ai_clients: AIClientService = Depends(get_ai_client_service)
) -> ScenarioService:
    """
    Provides the target business scenario orchestration service, injecting the low-level 
    AI client handlers required to submit prompts to the target LLM providers.
    """
    return ScenarioService(ai_clients=ai_clients)