import fitz  # PyMuPDF
import genanki
import os
import json

# 1. Configurações Iniciais
pdf_path = "DX ERA 1 FLASHCARDS-43-150.pdf"
deck_name = "Flashcards de Diagnóstico por Imagem"
output_file = "Diagnostico_Imagens.apkg"

# IDs únicos para o Anki
model_id = 1607392319
deck_id = 2059400110

# 2. Definição do CSS - Tema Console PACS Radiológico Premium (Dark por Padrão)
css_content = """
.card {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #0b0f19;
  margin: 0;
  padding: 16px;
}
.card-container {
  max-width: 620px;
  margin: 0 auto;
  color: #e2e8f0;
  text-align: center;
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
}

/* Cabeçalho no Estilo Metadados PACS */
.pacs-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  border-bottom: 2px solid #1f2937;
  padding-bottom: 12px;
  margin-bottom: 18px;
  text-align: left;
}
.header-col {
  display: flex;
  flex-direction: column;
}
.meta-label {
  font-size: 9px;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.meta-val {
  font-size: 11px;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  margin-top: 2px;
}

/* Moldura de Imagem Estilo Monitor PACS */
.image-wrapper {
  background-color: #030712;
  border-radius: 12px;
  padding: 18px;
  border: 1px solid #374151;
  margin-bottom: 18px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  justify-content: center;
  position: relative;
}
.image-wrapper::before {
  content: "PACS MONITOR - HIGH CONTRAST";
  position: absolute;
  top: 6px;
  left: 12px;
  font-size: 8px;
  font-weight: 700;
  color: #4b5563;
  letter-spacing: 0.15em;
}
.card-image {
  max-width: 100%;
  max-height: 45vh;
  border-radius: 6px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.6);
  border: 1px solid #1f2937;
  object-fit: contain;
  flex: 1 1 240px;
  cursor: zoom-in;
  transition: all 0.2s ease-in-out;
}

/* Efeito Lightroom / Zoom Interativo */
.card-image.zoomed {
  position: fixed;
  max-width: 96vw !important;
  max-height: 92vh !important;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.05);
  z-index: 10000;
  box-shadow: 0 25px 60px rgba(0,0,0,0.9);
  border: 2px solid #3b82f6;
  cursor: zoom-out;
  background-color: #000000;
  padding: 6px;
}

.question-prompt {
  font-size: 17px;
  font-weight: 700;
  color: #f3f4f6;
  margin-top: 14px;
  line-height: 1.4;
  background-color: #1f2937;
  display: inline-block;
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid #374151;
  letter-spacing: 0.02em;
}
.card-divider {
  border: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #1f2937, transparent);
  margin: 24px 0;
}
.back-container {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

/* Badge de Resposta - Estilo "Impresión Diagnóstica" */
.answer-badge {
  background: linear-gradient(135deg, #064e3b, #022c22);
  color: #4ade80;
  font-size: 24px;
  font-weight: 800;
  padding: 14px 28px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(74, 222, 128, 0.15);
  margin-bottom: 20px;
  display: inline-block;
  border: 2px solid #059669;
  letter-spacing: 0.01em;
}

/* Caixa de Laudo Radiológico */
.explanation-box {
  background-color: #1f2937;
  border-left: 4px solid #3b82f6;
  border-radius: 4px 12px 12px 4px;
  padding: 20px;
  text-align: left;
  font-size: 15px;
  line-height: 1.6;
  color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-top: 1px solid #374151;
  border-right: 1px solid #374151;
  border-bottom: 1px solid #374151;
  position: relative;
}
.explanation-box::before {
  content: "INFORME RADIOLÓGICO (HALLAZGOS)";
  display: block;
  font-size: 9px;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 0.1em;
  margin-bottom: 10px;
  border-bottom: 1px dashed #4b5563;
  padding-bottom: 4px;
}
.exp-modality {
  margin: 10px 0;
  padding: 8px 14px;
  background-color: #0c4a6e;
  border: 1px solid #0284c7;
  border-radius: 8px;
  font-size: 14px;
  color: #38bdf8;
}
.exp-causes {
  margin: 14px 0;
  padding: 12px 16px;
  background-color: #78350f;
  border: 1px solid #d97706;
  border-radius: 8px;
  font-size: 14px;
  color: #fde047;
}
.exp-dx {
  margin: 10px 0;
  padding: 8px 14px;
  background-color: #064e3b;
  border: 1px solid #059669;
  border-radius: 8px;
  font-size: 14px;
  color: #4ade80;
}
.exp-obs {
  margin: 10px 0;
  padding: 10px 14px;
  background-color: #1e1b4b;
  border-left: 4px solid #6366f1;
  border-top: 1px solid #312e81;
  border-right: 1px solid #312e81;
  border-bottom: 1px solid #312e81;
  border-radius: 0 8px 8px 0;
  font-size: 14px;
  color: #c7d2fe;
}
"""

# Templates HTML (Com inclusão de Script JS para zoom interativo)
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
    model_id,
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

my_deck = genanki.Deck(deck_id, deck_name)
media_files = []

# 4. Carregar os textos pré-formatados e polidos pela IA
formatted_texts_path = "formatted_texts.json"
if os.path.exists(formatted_texts_path):
    print(f"Carregando textos médicos pré-formatados de '{formatted_texts_path}'...")
    with open(formatted_texts_path, "r", encoding="utf-8") as f:
        formatted_data = json.load(f)
else:
    print(f"Erro: Arquivo '{formatted_texts_path}' não encontrado. Por favor, execute clean_texts.py primeiro.")
    exit(1)

# 5. Processamento e Extração das páginas do PDF
doc = fitz.open(pdf_path)
print(f"Iniciando a extração do PDF '{pdf_path}' ({len(doc)} páginas)...")

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

    # b. Determinar Tags de Estudo de Forma Inteligente baseada no conteúdo
    card_tags = ["Neumología"]
    combined_text = f"{prompt_txt} {answer_txt} {explanation_txt}".lower()
    
    # Detecção de método diagnóstico
    if "rx" in combined_text or "radiograf" in combined_text:
        card_tags.append("Radiografía")
    if "tc" in combined_text or "tac" in combined_text or "tomograf" in combined_text:
        card_tags.append("Tomografía")
        
    # Detecção de epônimos e sinais
    if "signo" in combined_text:
        card_tags.append("Signo_Radiológico")
        
    # Detecção de padrões intersticiais
    if any(term in combined_text for term in ["patrón", "patron", "reticular", "nodular", "esmerilado", "panal"]):
        card_tags.append("Patrón_Intersticial")

    # Extrair TODAS as imagens da página
    img_html_elements = []
    for idx, img_info in enumerate(image_list):
        try:
            xref = img_info[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Nome único do arquivo
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
package = genanki.Package(my_deck)
package.media_files = media_files
package.write_to_file(output_file)

# 7. Limpeza: Apagar os arquivos de imagem temporários do disco
print("Limpando arquivos de imagem temporários...")
for img in media_files:
    if os.path.exists(img):
        try:
            os.remove(img)
        except Exception as e:
            print(f"Aviso: Não foi possível remover {img} ({e})")

print(f"\nSucesso total! O arquivo '{output_file}' foi gerado com {len(my_deck.notes)} cards com estilo de Console PACS, Laudos estruturados e zoom de alta fidelidade.")
