#ai_engine.py
import requests

from pypdf import PdfReader

from database import add_history

OLLAMA_url="http://localhost:11434"
DEFAULT_MODE="llama3.2"

def extract_text(pdf_path):
    try:
        reader=PdfReader(str(pdf_path))
        pages=[]

        for page in reader.pages:
            text=page.extract_text()

            if text:
                pages.append(text)

        return "\n\n".join(pages).strip()

    except Exception as error:
        raise RuntimeError(f"PDF extraction failed:{error}")
def check_ollama(model=DEFAULT_MODEL):
    try:
        response=requests.get(f"{OLLAMA_URL}/api/tags",timeout=3)

        if response.status_code !=200:
            return False,"OLLAMA is not responding."

        available_models=[model_data.get("name","") 
                          for model_data in models]
        matching = any(name==model or
                       name.startswith(model +":")
                       for name in available_models
                       )
        if not matching:
            return False,(f"model'{model} is not installed.")

        return True,"Ollama connected"

    except
requests.exceptions.ConnectionError:
   return False,("Ollama is not running."
    "start Ollama to use local AI.")
    except Exception as error:
       re

def ask_ollama(prompt,model=DEFAULT_MODEL:)
         connected,message=check_ollama(model)




        

