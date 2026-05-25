import json
import fitz
import os

pdf_path = "DX ERA 1 FLASHCARDS-43-150.pdf"
formatted_texts_path = "formatted_texts.json"

# Carregar textos pré-formatados da IA
with open(formatted_texts_path, "r", encoding="utf-8") as f:
    formatted_data = json.load(f)

doc = fitz.open(pdf_path)
web_cards = []

print("Reconstruindo base de dados da Web (data.js) com parágrafos fluidos...")

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
    
    # Determinar Tags de Estudo de Forma Inteligente
    card_tags = ["Neumología"]
    combined_text = f"{prompt_txt} {answer_txt} {explanation_txt}".lower()
    
    if "rx" in combined_text or "radiograf" in combined_text:
        card_tags.append("Radiografía")
    if "tc" in combined_text or "tac" in combined_text or "tomograf" in combined_text:
        card_tags.append("Tomografía")
    if "signo" in combined_text:
        card_tags.append("Signo_Radiológico")
    if any(term in combined_text for term in ["patrón", "patron", "reticular", "nodular", "esmerilado", "panal"]):
        card_tags.append("Patrón_Intersticial")

    # Mapear caminhos das imagens existentes
    extracted_image_paths = []
    for idx, img_info in enumerate(image_list):
        # O arquivo de imagem correspondente
        img_filename = f"images/img_pagina_{page_key}_{idx + 1}.jpeg"
        if os.path.exists(img_filename):
            extracted_image_paths.append(img_filename)
        else:
            # Tentar outras extensões comuns como png caso o PyMuPDF tenha salvo com outro formato
            for ext in ["png", "jpg", "bmp"]:
                alt_filename = f"images/img_pagina_{page_key}_{idx + 1}.{ext}"
                if os.path.exists(alt_filename):
                    extracted_image_paths.append(alt_filename)
                    break

    # Adicionar aos dados da web
    web_cards.append({
        "id": int(page_key),
        "pageNumber": page_key,
        "images": extracted_image_paths,
        "prompt": prompt_txt,
        "answer": answer_txt,
        "explanation": explanation_txt,
        "tags": card_tags
    })

# Salvar como arquivo JS para CORS-Free local
js_content = f"// Banco de dados dos flashcards médicos\nconst FLASHCARD_DATA = {json.dumps(web_cards, ensure_ascii=False, indent=2)};"

with open("data.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Sucesso! {len(web_cards)} cards web reconstruídos com parágrafos perfeitamente fluidos em 'data.js'.")
