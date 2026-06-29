from fastapi import APIRouter, Depends, UploadFile, File
from app.api.deps import get_excel_parser_service
from app.services.excel_service import ExcelParserService

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), parser: ExcelParserService = Depends(get_excel_parser_service)):
    return await parser.parse_matrix(file)