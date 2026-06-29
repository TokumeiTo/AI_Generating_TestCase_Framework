import traceback
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.api.deps import get_excel_parser_service, get_scenario_service
from app.services.excel_service import ExcelParserService
from app.services.scenario_service import ScenarioService

router = APIRouter(prefix="/ai", tags=["AI Engine"])

class ScenarioRequest(BaseModel):
    file_data: str                      # Base64 encoded .xlsx file string
    file_name: str                      # Name of the uploaded file
    target_keyword: str                 # e.g., 投資目的適合性警告メッセージ
    execution_notes: Optional[str] = "" # Optional notes

@router.post("/generate-testcase")
async def generate_testcase(
    request: ScenarioRequest,
    engine: str = "groq", # Pass ?engine=sealion from frontend query parameters to swap engines!
    excel_service: ExcelParserService = Depends(get_excel_parser_service),
    scenario_service: ScenarioService = Depends(get_scenario_service)
):
    try:
        # 1. Parse and extract matrix text string via service layer
        print(f"📁 Loading and trimming file content for keyword: {request.target_keyword}")
        trimmed_context = await excel_service.parse_and_filter_spec(
            base64_data=request.file_data, 
            target_keyword=request.target_keyword
        )
        
        # 2. Fire Prompt request down through orchestrator engine
        print(f"🚀 Submitting structured context data to {engine.upper()} model platform...")
        final_grid_rows = await scenario_service.generate_test_cases(
            context_text=trimmed_context,
            target_keyword=request.target_keyword,
            execution_notes=request.execution_notes,
            provider=engine
        )
        
        return {
            "success": True,
            "data": final_grid_rows
        }
        
    except Exception as e:
        print("\n❌ API v1 CONTROLLER PIPELINE EXCEPTION:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"System Flow Error: {str(e)}")