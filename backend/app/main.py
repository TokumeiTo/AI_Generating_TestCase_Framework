import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html

# Corrected path namespace based on our professional V1 architecture
from app.api.v1.ai_controller import router as ai_router

app = FastAPI(
    title="AI Business Analyst Scenario API", 
    version="1.0.0",
    docs_url=None,       # Disabled default online CDNs
    redoc_url=None
)

# Cross-Origin Resource Sharing (CORS) Middleware Layer
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🟩 DYNAMIC PATH GENERATION BLOCK
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ✅ MOUNT OFFLINE SWAGGER UI ASSETS
static_swagger_path = os.path.join(BASE_DIR, "static")
if os.path.exists(static_swagger_path):
    app.mount("/static", StaticFiles(directory=static_swagger_path), name="static")

# ✅ CUSTOM OFFLINE SWAGGER ROUTE INTERCEPTOR
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="/static/swagger/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger/swagger-ui.css",
        swagger_favicon_url="/static/swagger/favicon.png"
    )

# Register Version 1 Controller Route Group
app.include_router(ai_router, prefix="/api/v1")

@app.get("/")
def health_check():
    """
    Basic sanity check endpoint to verify server infrastructure status.
    """
    return {
        "status": "healthy",
        "message": "AI Test Case Generation Engine is fully operational",
        "api_version": "v1"
    }