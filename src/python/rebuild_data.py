# ==========================================================================
# BARCL Python Data Pipeline - Database Rebuild (Web ESM Target)
# ==========================================================================
import sys
import os
import json
import fitz

# Adiciona o diretório atual do script ao path para permitir imports do 'shared'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.config import PDF_PATH, FORMATTED_TEXTS_PATH, DATA_JS_PATH
from shared.tagging import get_study_tags

# Carregar textos pré-formatados e higienizados pela IA
if not os.path.exists(FORMATTED_TEXTS_PATH):
    print(f"Erro: O arquivo '{FORMATTED_TEXTS_PATH}' não existe. Execute clean_texts.py primeiro.")
    sys.exit(1)

with open(FORMATTED_TEXTS_PATH, "r", encoding="utf-8") as f:
    formatted_data = json.load(f)

doc = fitz.open(PDF_PATH)
web_cards = []

print("Reconstruindo base de dados da Web (data.js) com caminhos de assets unificados e Native ESM...")

for page_num in range(len(doc)):
    page_key = str(page_num + 1)
    page = doc[page_num]
    
    # Extrair imagens da página
    image_list = page.get_images(full=True)
    if not image_list:
        continue
        
    if page_key not in formatted_data:
        continue
        
    card_data = formatted_data[page_key]
    prompt_txt = card_data["prompt"]
    answer_txt = card_data["answer"]
    explanation_txt = card_data["explanation"]
    
    # Determinar Tags de Estudo de forma sistêmica e centralizada
    card_tags = get_study_tags(prompt_txt, answer_txt, explanation_txt)

    # Mapear caminhos das imagens existentes na nova pasta de assets
    extracted_image_paths = []
    for idx, img_info in enumerate(image_list):
        img_filename = f"assets/images/img_pagina_{page_key}_{idx + 1}.jpeg"
        if os.path.exists(img_filename):
            extracted_image_paths.append(img_filename)
        else:
            # Alternativas comuns caso o PyMuPDF tenha salvo em outro formato
            for ext in ["png", "jpg", "bmp"]:
                alt_filename = f"assets/images/img_pagina_{page_key}_{idx + 1}.{ext}"
                if os.path.exists(alt_filename):
                    extracted_image_paths.append(alt_filename)
                    break

    # Adicionar à lista estruturada
    web_cards.append({
        "id": int(page_key),
        "pageNumber": page_key,
        "images": extracted_image_paths,
        "prompt": prompt_txt,
        "answer": answer_txt,
        "explanation": explanation_txt,
        "tags": card_tags
    })

# Salvar no formato Javascript ESM (EcmaScript Module) para carregamento dinâmico sem CORS-Issues
js_content = f"// Banco de dados dos flashcards médicos compilado de forma automática\nexport const FLASHCARD_DATA = {json.dumps(web_cards, ensure_ascii=False, indent=2)};\n"

# Assegurar que os diretórios alvos de dados existam
os.makedirs(os.path.dirname(DATA_JS_PATH), exist_ok=True)

with open(DATA_JS_PATH, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Sucesso! {len(web_cards)} cards web reconstruídos com tags harmonizadas e compilados em '{DATA_JS_PATH}'.")
