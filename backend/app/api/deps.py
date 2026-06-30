from fastapi import Depends
from app.services.ai_client_service import AIClientService
from app.services.scenario_service import ScenarioService
from app.services.excel_service import ExcelParserService
from app.services.word_service import WordParserService

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

def get_word_parser_service() -> WordParserService:
    """
    Provides the execution instance for processing binary stream spreadsheet inputs
    and extracting design criteria tokens.
    """
    return WordParserService()
    

# 3. High-Level Orchestrator Service Provider
def get_scenario_service(
    ai_clients: AIClientService = Depends(get_ai_client_service),
    excel_parser: ExcelParserService = Depends(get_excel_parser_service),
    word_parser: WordParserService = Depends(get_word_parser_service)
) -> ScenarioService:
    """
    Provides the target business scenario orchestration service, injecting the low-level 
    AI client handlers and document parsers required to handle diverse design specifications.
    """
    return ScenarioService(
        ai_clients=ai_clients,
        excel_parser=excel_parser,
        word_parser=word_parser
    )