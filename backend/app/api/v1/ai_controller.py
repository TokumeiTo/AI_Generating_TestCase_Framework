import traceback
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from app.api.deps import get_scenario_service
from app.services.scenario_service import ScenarioService

router = APIRouter(prefix="/ai", tags=["AI Engine"])

class ScenarioRequest(BaseModel):
    file_data: str                                     # Base64 encoded file string
    file_name: str = Field(..., examples=["doc.docx"]) # Sanitize & validate incoming schema strings
    target_keyword: str                                # e.g., 投資目的適合性警告メッセージ
    execution_notes: Optional[str] = ""                # Optional notes

@router.post("/generate-testcase")
async def generate_testcase(
    request: ScenarioRequest,
    engine: str = "groq", 
    scenario_service: ScenarioService = Depends(get_scenario_service)
):
    # Sanitize inputs at the boundary gate before passing them downward
    clean_file_name = request.file_name.strip()
    
    try:
        # CRITICAL DEBUG PRINT: Force output to console to see exactly what string your frontend sent
        print(f"\n[DEBUG] 📁 Received clean file string: '{clean_file_name}'")
        print(f"[DEBUG] 🚀 Target keyword extraction: '{request.target_keyword}' using engine '{engine}'")
        
        final_grid_rows = await scenario_service.generate_test_cases(
            base64_data=request.file_data,
            file_name=clean_file_name, # Pass clean version explicitly
            target_keyword=request.target_keyword,
            execution_notes=request.execution_notes,
            provider=engine
        )
        
        # Check if the service returned a fallback error row instead of actual test cases
        if final_grid_rows and final_grid_rows[0].get("Category") == "システムエラー":
            print(f"⚠️ Service Layer internal fallback triggered: {final_grid_rows[0].get('TextItem')}")
            # Optional: You can choose to throw an actual HTTP error here instead of a faux successful response
            # raise HTTPException(status_code=400, detail=final_grid_rows[0].get('TextItem'))

        return {
            "success": True,
            "data": final_grid_rows
        }
        
    except ValueError as ve:
        print(f"⚠️ Boundary Validation Error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
        
    except Exception as e:
        print("\n❌ API v1 CONTROLLER PIPELINE EXCEPTION:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"System Flow Error: {str(e)}")