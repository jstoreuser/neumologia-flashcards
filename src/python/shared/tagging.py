# ==========================================================================
# BARCL Python Data Pipeline Shared Semantic Tagging Engine
# ==========================================================================

# Taxonomia Configurável de Classificação Radiológica
# Nenhuma regra semântica de tags deve ser escrita fora deste dicionário.
STUDY_TAG_RULES = {
    "Radiografía": ["rx", "radiograf", "radiografía"],
    "Tomografía": ["tc", "tac", "tomografía", "tomografia"],
    "Signo_Radiológico": ["signo"],
    "Patrón_Intersticial": ["patrón", "patron", "reticular", "nodular", "esmerilado", "panal"]
}

def get_study_tags(prompt_txt, answer_txt, explanation_txt):
    """
    Analisa os textos combinados de um card e gera dinamicamente a taxonomia de tags correspondente,
    garantindo consistência sistêmica total entre a interface Web e o aplicativo do Anki.
    """
    tags = ["Neumología"]
    combined_text = f"{prompt_txt} {answer_txt} {explanation_txt}".lower()
    
    for tag_name, keywords in STUDY_TAG_RULES.items():
        if any(keyword in combined_text for keyword in keywords):
            tags.append(tag_name)
            
    return tags
