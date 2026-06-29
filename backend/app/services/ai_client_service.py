from openai import OpenAI
from app.core.config import settings

class AIClientService:
    def __init__(self):
        # Initialize Groq Endpoint Client (Cleaned URL)
        self.groq_client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=settings.GROQ_API_KEY
        ) if settings.GROQ_API_KEY else None

        # Initialize SEA-LION Cloud Endpoint Client (Cleaned URL)
        self.sealion_client = OpenAI(
            base_url="https://api.sea-lion.ai/v1",  # Ensure this matches your actual provider's clean endpoint url
            api_key=settings.SEALION_API_KEY
        ) if settings.SEALION_API_KEY else None