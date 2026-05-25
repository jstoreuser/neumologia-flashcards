# ==========================================================================
# BARCL Python Data Pipeline Shared Configurations
# ==========================================================================
import os

# Caminho do PDF Médico de origem
PDF_PATH = "DX ERA 1 FLASHCARDS-43-150.pdf"

# Base de Dados Estruturados em JSON
FORMATTED_TEXTS_PATH = os.path.join("src", "data", "formatted_texts.json")
RAW_TEXTS_PATH = os.path.join("src", "data", "raw_texts.json")

# Alvo de Compilação do Banco de Dados JavaScript da Web (Native ESM)
DATA_JS_PATH = os.path.join("src", "js", "core", "data.js")

# Diretório de Armazenamento e Otimização de Imagens Clínicas
IMAGES_DIR = os.path.join("assets", "images")
ANCILLARY_IMAGES_DIR = "images" # Diretório temporário antigo para compatibilidade na extração

# Configurações do Deck do Anki (.apkg)
ANKI_DECK_NAME = "Flashcards de Diagnóstico por Imagem"
ANKI_OUTPUT_FILE = os.path.join("anki", "Diagnostico_Imagens.apkg")
ANKI_MODEL_ID = 1607392319
ANKI_DECK_ID = 2059400110

# Caminhos dos Templates CSS/HTML Externos do Anki
ANKI_CSS_PATH = os.path.join("src", "css", "anki-theme.css")
