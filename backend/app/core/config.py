import os
from pathlib import Path
from dotenv import load_dotenv

# 1. Get the absolute path of config.py safely
CURRENT_FILE = Path(__file__).resolve()

# 2. Walk up the tree until we hit the root workspace folder containing the .env
BASE_DIR = CURRENT_FILE
for parent in CURRENT_FILE.parents:
    if (parent / ".env").exists():
        BASE_DIR = parent
        break

ENV_PATH = BASE_DIR / ".env"
print(f"[DEBUG]: Looking for .env file explicitly at: {ENV_PATH}")

# 3. Load the environment variables forcing an override of any bad cached/empty strings
load_dotenv(dotenv_path=ENV_PATH, override=True)

class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
    SEALION_API_KEY: str = os.getenv("SEALION_API_KEY", "").strip()
    
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    SEALION_MODEL: str = "aisingapore/Qwen-SEA-LION-v4.5-27B-IT"
    
    def validate_keys(self): 
        if not self.GROQ_API_KEY or len(self.GROQ_API_KEY) < 5:
            print(f"[WARNING]: GROQ_API_KEY is missing or invalid. Value read: '{self.GROQ_API_KEY}'")
        else:
            print(f"[SUCCESS]: GROQ_API_KEY loaded successfully (Starts with: {self.GROQ_API_KEY[:6]}...)")
            
        if not self.SEALION_API_KEY or len(self.SEALION_API_KEY) < 5:
            print(f"[WARNING]: SEALION_API_KEY is missing or invalid. Value read: '{self.SEALION_API_KEY}'")
        else:
            print(f"[SUCCESS]: SEALION_API_KEY loaded successfully (Starts with: {self.SEALION_API_KEY[:6]}...)")
            
settings = Settings()
settings.validate_keys()