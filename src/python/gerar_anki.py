# ==========================================================================
# BARCL Python Data Pipeline - Anki Deck Generator (.apkg compiler)
# ==========================================================================
import fitz  # PyMuPDF
import genanki
import os
import json
import sys

# Adiciona o diretório atual do script ao path para permitir imports do 'shared'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.config import (
    PDF_PATH, FORMATTED_TEXTS_PATH,
    ANKI_DECK_NAME, ANKI_OUTPUT_FILE,
    ANKI_MODEL_ID, ANKI_DECK_ID, ANKI_CSS_PATH
)
from shared.tagging import get_study_tags

# 1. Carregar o CSS Externo Desacoplado do Anki
if not os.path.exists(ANKI_CSS_PATH):
    print(f"Erro: O arquivo de tema CSS '{ANKI_CSS_PATH}' não existe. Crie o arquivo primeiro.")
    sys.exit(1)

print(f"Carregando folha de estilos externa do Anki: '{ANKI_CSS_PATH}'")
with open(ANKI_CSS_PATH, "r", encoding="utf-8") as f:
    css_content = f.read()

# 2. Templates HTML (Com inclusão de Script JS para zoom interativo)
qfmt_content = """
<div class="card-container">
  <div class="pacs-header">
    <div class="header-col">
      <span class="meta-label">ESTUDIO</span>
      <span class="meta-val">IMAGEN PULMONAR</span>
    </div>
    <div class="header-col">
      <span class="meta-label">ORIGEN</span>
      <span class="meta-val">PÁGINA {{PageNumber}}</span>
    </div>
    <div class="header-col">
      <span class="meta-label">DEP</span>
      <span class="meta-val">NEUMOLOGÍA</span>
    </div>
  </div>
  
  <div class="image-wrapper">
    {{ImagemFrontal}}
  </div>
  
  <div class="question-prompt">
    {{PromptTexto}}
  </div>
</div>

<script>
  // Script para habilitar zoom interativo nas imagens médicas
  (function() {
    var images = document.querySelectorAll('.card-image');
    images.forEach(function(img) {
      if (img.dataset.zoomBound) return;
      img.dataset.zoomBound = "true";
      
      img.addEventListener('click', function(e) {
        e.stopPropagation();
        var wasZoomed = this.classList.contains('zoomed');
        
        // Fechar qualquer outra imagem ampliada
        document.querySelectorAll('.card-image.zoomed').forEach(function(el) {
          el.classList.remove('zoomed');
        });
        
        if (!wasZoomed) {
          this.classList.add('zoomed');
        }
      });
    });

    // Clicar em qualquer parte da tela fecha o zoom
    document.addEventListener('click', function() {
      document.querySelectorAll('.card-image.zoomed').forEach(function(el) {
        el.classList.remove('zoomed');
      });
    });
  })();
</script>
"""

afmt_content = """
{{FrontSide}}

<hr class="card-divider">

<div class="back-container">
  {{#AnswerText}}
  <div class="answer-badge">
    {{AnswerText}}
  </div>
  {{/AnswerText}}
  
  {{#ExplanationText}}
  <div class="explanation-box">
    {{ExplanationText}}
  </div>
  {{/ExplanationText}}
</div>
"""

# 3. Criar o Modelo e o Deck no genanki
my_model = genanki.Model(
    ANKI_MODEL_ID,
    'Modelo PACS Diagnóstico Premium',
    fields=[
        {'name': 'PageNumber'},
        {'name': 'ImagemFrontal'},
        {'name': 'PromptTexto'},
        {'name': 'AnswerText'},
        {'name': 'ExplanationText'},
    ],
    templates=[
        {
            'name': 'Card 1',
            'qfmt': qfmt_content,
            'afmt': afmt_content,
        },
    ],
    css=css_content
)

my_deck = genanki.Deck(ANKI_DECK_ID, ANKI_DECK_NAME)
media_files = []

# 4. Carregar os textos pré-formatados e polidos pela IA
if os.path.exists(FORMATTED_TEXTS_PATH):
    print(f"Carregando textos médicos pré-formatados de '{FORMATTED_TEXTS_PATH}'...")
    with open(FORMATTED_TEXTS_PATH, "r", encoding="utf-8") as f:
        formatted_data = json.load(f)
else:
    print(f"Erro: Arquivo '{FORMATTED_TEXTS_PATH}' não encontrado. Por favor, execute clean_texts.py primeiro.")
    sys.exit(1)

# 5. Processamento e Extração das páginas do PDF
doc = fitz.open(PDF_PATH)
print(f"Iniciando a extração do PDF '{PDF_PATH}' ({len(doc)} páginas)...")

for page_num in range(len(doc)):
    page = doc[page_num]
    page_key = str(page_num + 1)
    
    # a. Extrair imagens
    image_list = page.get_images(full=True)
    
    # Se a página não tiver nenhuma imagem (ex: capa do capítulo), pulamos para não gerar cards em branco
    if not image_list:
        print(f"Página {page_key}: Sem imagens. Pulando página.")
        continue

    # Obter dados pré-formatados da IA
    if page_key in formatted_data:
        card_data = formatted_data[page_key]
        prompt_txt = card_data["prompt"]
        answer_txt = card_data["answer"]
        explanation_txt = card_data["explanation"]
    else:
        print(f"Aviso: Sem dados formatados para a página {page_key}. Pulando.")
        continue

    # b. Determinar Tags de Estudo de forma harmonizada (Taxonomia Centralizada)
    card_tags = get_study_tags(prompt_txt, answer_txt, explanation_txt)

    # Extrair TODAS as imagens da página para o empacotamento do Anki
    img_html_elements = []
    for idx, img_info in enumerate(image_list):
        try:
            xref = img_info[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Nome do arquivo temporário a ser embutido no deck do Anki
            img_filename = f"img_pagina_{page_key}_{idx + 1}.{image_ext}"
            
            with open(img_filename, "wb") as f:
                f.write(image_bytes)
                
            media_files.append(img_filename)
            img_html_elements.append(f'<img src="{img_filename}" class="card-image">')
        except Exception as e:
            print(f"Página {page_key}, Imagem {idx + 1}: Erro na extração ({e})")

    # Juntar tags HTML das imagens
    img_html = "".join(img_html_elements) if img_html_elements else "Sem imagem disponível"

    # c. Adicionar nota com as respectivas Tags
    note = genanki.Note(
        model=my_model,
        fields=[
            page_key,  # Número da página original para referência rápida
            img_html,
            prompt_txt,
            answer_txt,
            explanation_txt
        ],
        tags=card_tags
    )
    my_deck.add_note(note)
    print(f"Página {page_key}: Card adicionado com estilo PACS (Tags: {', '.join(card_tags)}).")

# 6. Empacotar tudo no arquivo final .apkg
print("\nGerando o arquivo compactado do Anki (.apkg)...")
os.makedirs(os.path.dirname(ANKI_OUTPUT_FILE), exist_ok=True)
package = genanki.Package(my_deck)
package.media_files = media_files
package.write_to_file(ANKI_OUTPUT_FILE)

# 7. Limpeza: Apagar os arquivos de imagem temporários do disco
print("Limpando arquivos de imagem temporários...")
for img in media_files:
    if os.path.exists(img):
        try:
            os.remove(img)
        except Exception as e:
            print(f"Aviso: Não foi possível remover {img} ({e})")

print(f"\nSucesso total! O arquivo '{ANKI_OUTPUT_FILE}' foi gerado com {len(my_deck.notes)} cards com estilo de Console PACS, Laudos estruturados e zoom de alta fidelidade.")
