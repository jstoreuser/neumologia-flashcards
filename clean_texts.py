import json
import re

# Dicionário de substituições de texto em massa
REPLACEMENTS = {
    r"\binterticial\b": "intersticial",
    r"\binterticiales\b": "intersticiales",
    r"\binterticio\b": "intersticio",
    r"\bapresenta\b": "presenta",
    r"\bgeralmente\b": "generalmente",
    r"\btamano\b": "tamaño",
    r"\bgrandeza\b": "tamaño",
    r"\banos\b": "años",
    r"\bprovavelmente\b": "probablemente",
    r"\bseptica\b": "séptica",
    r"\bsepticade\b": "séptica",
    r"\bclavicula\b": "clavícula",
    r"\bda arteria\b": "de la arteria",
    r"\bagrandamento\b": "agrandamiento",
    r"\bvidro\b": "vidrio",
    r"\besmerillado\b": "esmerilado",
    r"\bmesdiastinica\b": "mediastínica",
    r"\bestasopacidades\b": "estas opacidades",
    r"\bimágen\b": "imagen",
    r"\banellos\b": "anillos",
    r"\bHemartroma\b": "Hamartoma",
    r"\bHemartromas\b": "Hamartomas",
    r"\bcresciente\b": "creciente",
    r"\bseguinte\b": "siguiente",
    r"\bembas\b": "ambas",
    r"\bextendiendose\b": "extendiéndose",
    r"\bsituacion\b": "situación",
    r"\bareas\b": "áreas",
    r"\bcalcicas\b": "cálcicas",
    r"\bventada\b": "ventana",
    r"\btoracocentésis\b": "toracocentesis",
    r"\bcorrimento\b": "corrimiento",
    r"\bcontra lateral\b": "contralateral",
    
    r"Humpton": "Hampton",
    r"Jaroba": "Joroba",
    r"fleischener": "Fleischner",
    r"Fleishner": "Fleischner",
    
    r"\bLBD\b": "LSD",  # LSD = Lóbulo Superior Derecho
    
    r"Diagn[oóó]tico\s+presuntivo": "Diagnóstico presuntivo",
    r"Diagn[oóó]st[ií]co\s+presuntivo": "Diagnóstico presuntivo",
    r"Nombre\s+el\s+seguinte\s+signo": "Nombre el siguiente signo",
}

# Overrides específicos para páginas problemáticas/desestruturadas
PAGE_OVERRIDES = {
    2: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo de la Vela (Timo normal)",
        "explanation": "<p>Corresponde a una opacidad triangular del tejido tímico que se proyecta hacia la derecha o izquierda y a veces en ambas direcciones.</p><p>💡 <strong>Nota:</strong> Es fisiológico en niños. La involución de la sombra tímica comienza al final del primer año de vida y se completa alrededor de los 3 años.</p>"
    },
    31: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Quiste pulmonar (TC de tórax)",
        "explanation": "<p>En la TC de tórax, um quiste se visualiza como un espacio de bordes bien definidos de tamaño variable con una pared de grosor fino.</p><p>💡 <strong>Nota:</strong> Es importante diferenciarlo de otras estructuras como cavidades (pared gruesa) o bullas (pared extremadamente delgada o ausente).</p>"
    },
    32: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signos radiológicos de Hiperinsuflación (Enfisema)",
        "explanation": "<p>Los principales hallazgos de hiperinsuflación pulmonar en la radiografía son:</p><ul><li>Tórax en tonel</li><li>Aplanamiento de las cúpulas diafragmáticas</li><li>Horizontalización de las costillas</li><li>Aumento de los espacios intercostales</li><li>Hiperclaridade pulmonar (atrapamiento de aire)</li></ul>"
    },
    35: {
        "prompt": "Describir el Rx y la TC de tórax:",
        "answer": "Absceso pulmonar (Nivel hidroaéreo)",
        "explanation": "<p>📸 <strong>Estudios de Imagen:</strong></p><ul><li><strong>A (Radiografía de tórax frente):</strong> En el pulmón izquierdo se observa una imagen redondeada radiopaca de pared gruesa que presenta un <strong>nivel hidroaéreo</strong>.</li><li><strong>B (TC de tórax ventana pulmonar, corte axial con contraste):</strong> En el pulmón derecho, se observa una gran cavidad de paredes gruesas que en su interior presenta también un nivel hidroaéreo característico.</li></ul>"
    },
    37: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Líneas B de Kerley",
        "explanation": "<p>Finas opacidades lineales periféricas visibles en las bases pulmonares en radiografías de tórax, características de edema agudo de pulmón (EAP) o congestión linfática.</p><p>💡 <strong>Patogenia:</strong> Representan el engrosamiento del intersticio interlobulillar por la congestión de los vasos pulmonares o acumulación de líquido en los septos.</p>"
    },
    38: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo de la S de Golden",
        "explanation": "<p>Producido por la <strong>atelectasia del lóbulo superior derecho</strong> secundaria a una masa que obstruye el bronquio lobar superior.</p><p>💡 <strong>Morfología:</strong> La cisura menor se desplaza medial y superiormente, pero se encuentra con la resistencia de la masa tumoral en la zona proximal. Esto dibuja una línea con forma de \"S itálica\" o \"S invertida\" (S de Golden).</p>"
    },
    40: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo de Fleischner (TEP)",
        "explanation": "<p>Agrandamiento de una arteria pulmonar proximal en la radiografía de tórax, generalmente secundario a un embolismo pulmonar agudo (TEP).</p><p>💡 <strong>Patogenia:</strong> La obstrucción embólica del vaso provoca una dilatación proximal refleja o mecánica debido al trombo impactado.</p>"
    },
    42: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo de lesión Extrapulmonar (Signo de la Embarazada)",
        "explanation": "<p>Las lesiones extrapulmonares de origen pleural, extrapleural o costal presentan <strong>bordes nítidos</strong> (al estar delimitadas por la pleura visceral) y forman una **curva convexa con ángulos obtusos** con respecto a la pared costal.</p><p>💡 <strong>Diagnóstico Diferencial:</strong> Por el contrario, las lesiones intrapulmonares tienen bordes imprecisos y forman ángulos agudos con la pleura.</p>"
    },
    43: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Cavitación pulmonar",
        "explanation": "<p>En la radiografía o TC de tórax, una cavitación pulmonar suele presentarse con una pared gruesa y un margen interno irregular.</p><p>⚠️ <strong>Diferenciación:</strong> No confundir con el absceso pulmonar, donde se observa un nivel hidroaéreo marcado debido a la presencia de contenido líquido activo (pus, necrosis).</p>"
    },
    46: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo de la Silueta Negativo",
        "explanation": "<p>Ocurre cuando duas estruturas de densidades diferentes ou em planos anatômicos diferentes (anterior/posterior) apresentam uma interface nítida e visível entre elas.</p><p>💡 <strong>Exemplo:</strong> Uma opacidade mediastinal posterior em contato aparente com o coração (que é anterior) não apaga o bordo cardíaco.</p><p>⚠️ <strong>Signo de la Silueta Positivo:</strong> Duas estruturas com a mesma densidade radiológica em contato direto apagam seus limites recíprocos.</p>"
    },
    48: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo del hilio oculto",
        "explanation": "<p>Sirve para diferenciar una <strong>cardiomegalia genuina</strong> de una <strong>masa en el mediastino anterior</strong>.</p><ul><li><strong>Cardiomegalia:</strong> El agrandamiento cardíaco desplaza lateralmente los vasos hiliares. Os hilos são vistos \"por fora\" da silhueta cardíaca.</li><li><strong>Masa mediastínica anterior:</strong> La masa se superpone a los vasos hiliares sin desplazarlos, por lo que los vasos siguen siendo visibles a través de la masa (Signo del hilio oculto).</li></ul>"
    },
    49: {
        "prompt": "Describir que se ve en la TC de tórax abajo:",
        "answer": "Bronconeumonía (Signo de Árbol en Brote)",
        "explanation": "<p>📸 <strong>TC de tórax (ventana pulmonar):</strong></p><p>A nivel de la flecha se observa un patrón típico de **Árbol en Brote** (tree-in-bud), que representa la impactación mucoide o purulenta en los bronquiolos terminales con engrosamiento de sus paredes.</p><p>💡 <strong>Diagnóstico:</strong> Bronconeumonía infecciosa activa.</p>"
    },
    50: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo Cervicotorácico",
        "explanation": "<p>Permite determinar si una masa del mediastino superior se localiza en el compartimento anterior o posterior.</p><ul><li><strong>Mediastino Anterior:</strong> La masa no sobrepasa el nivel de las clavículas (o sus bordes se desvanecen al entrar en contacto con las partes blandas del cuello).</li><li><strong>Mediastino Posterior:</strong> Si los contornos de la masa son visibles por encima de las clavículas, la masa es posterior, ya que está rodeada por el aire de los ápex pulmonares.</li></ul>"
    },
    53: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo del aire creciente (Aspergiloma)",
        "explanation": "<p>Se observa una colección semilunar de aire en la periferia que rodea una masa central redondeada de tejido necrótico o micetoma.</p><p>💡 <strong>Asociación:</strong> Característico de infecciones por **Aspergilosis Pulmonar Invasiva** en fase de recuperación, o un **Aspergiloma** (bola de hongos) dentro de una cavidad preexistente.</p><p>📸 <strong>Estudios:</strong></p><ul><li><strong>Izquierda (Radiografía):</strong> Muestra una radiopacidad redondeada con una medialuna radiolúcida superior.</li><li><strong>Derecha (TC):</strong> Muestra una cavidad aérea con un nódulo interno y el halo hipodenso aéreo semilunar.</li></ul>"
    },
    55: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo de la suelta de globos (Metástasis pulmonar)",
        "explanation": "<p>Presencia de múltiples nódulos y masas pulmonares bien definidos, redondeados, de distribución bilateral, aleatoria y de diferentes tamaños.</p><p>💡 <strong>Diagnóstico:</strong> Característico de **metástasis pulmonares por vía hematógena** (ej. coriocarcinoma, osteosarcoma, cáncer de tiroides, renal ou de mama).</p>"
    },
    56: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo de Westermark (TEP)",
        "explanation": "<p>Área focal de hiperlucidez (oligoemia focal) en la periferia del pulmão, secundaria a la obstrucción de la arteria pulmonar por un tromboembolismo (TEP).</p><ul><li><strong>Rx de tórax:</strong> Se ve un área localizada más negra (radiolúcida) debido a la disminución del flujo vascular y de la sangre.</li><li><strong>TC de tórax:</strong> Se observa una zona de marcada hipodensidade del parénquima por hipoperfusión.</li></ul>"
    },
    59: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Bullas pulmonares",
        "explanation": "<p>Espacios aéreos mayores a 1 cm delimitados por una pared epitelizada extremadamente fina (menor a 1 mm) o incluso ausente.</p><p>💡 <strong>Diagnóstico Diferencial:</strong> Debe diferenciarse de quistes (paredes finas pero definidas, de 1-3 mm) y cavidades (paredes gruesas, mayores a 3 mm). Común en enfisema bulloso.</p>"
    },
    61: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo del broncograma aéreo",
        "explanation": "<p>Visualización de los bronquios llenos de aire (estructuras tubulares oscuras/radiolúcidas) dentro de una zona de pulmón consolidado y denso (blanco/radiopaco).</p><p>💡 <strong>Fisiopatología:</strong> Los alvéolos que rodean los bronquios están ocupados por líquido, sangre o pus (consolidación), haciendo contraste con el aire que aún circula en los bronquios.</p>"
    },
    65: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Signo del dedo de guante",
        "explanation": "<p>Representa bronquios dilatados (bronquiectasias de localización central) impactados por secreciones mucosas densas.</p><p>💡 <strong>Clínica:</strong> Típico de patologias como a **Aspergilosis Broncopulmonar Alérgica (ABPA)**, asma crónico, fibrosis quística o neoplasia obstructiva proximal.</p>"
    },
    66: {
        "prompt": "Qué es el Signo de la Silueta POSITIVO?",
        "answer": "Borramiento de límites por contacto directo de estructuras de igual densidad",
        "explanation": "<p>Ocurre cuando dos estructuras de la **misma densidad radiológica** están en **contacto anatómico directo**, lo que produce el borramiento y pérdida de definición de sus bordes limítrofes.</p><p>💡 <strong>Importancia:</strong> Permite localizar la lesión. Por ejemplo, una neumonía que borra el borde derecho del corazón está en el Lóbulo Medio.</p>"
    },
    82: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "¿Cuánto tiempo debe mantenerse un nódulo estable para considerarse benigno?",
        "explanation": "<p>💡 <strong>Respuesta:</strong> Un nódulo pulmonar debe permanecer sin cambios de tamaño o características de forma estable durante un período de **2 años (24 meses)** en estudios comparativos de TC para ser clasificado como benigno.</p>"
    },
    95: {
        "prompt": "Identifique o achado / diagnóstico:",
        "answer": "Hamartoma pulmonar (Calcificación en Popcorn)",
        "explanation": "<p>📸 <strong>TC de tórax (ventana mediastínica):</strong></p><p>Se observa una imagen nodular bien delimitada en la región parahiliar derecha que presenta áreas internas con densidad grasa y focos de calcificación en parches gruesos, conocidos como <strong>calcificaciones en popcorn (pochoclo)</strong>.</p><p>💡 <strong>Nota:</strong> Es el tumor benigno más común del pulmón.</p>"
    }
}

def clean_text(text, page_num):
    # Verificar se esta página tem um override manual completo
    if page_num in PAGE_OVERRIDES:
        o = PAGE_OVERRIDES[page_num]
        return o["prompt"], o["answer"], o["explanation"]

    if not text:
        return "Identifique o achado / diagnóstico", "", ""
        
    # 1. Aplicar correções de substituição baseadas em regex
    cleaned = text
    for pattern, replacement in REPLACEMENTS.items():
        cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)
        
    # 2. Dividir em linhas para processamento estrutural
    lines = [line.strip() for line in cleaned.split("\n") if line.strip()]
    if not lines:
        return "Identifique o achado / diagnóstico", "", ""
        
    # 3. Detectar Prompt
    first_line = lines[0]
    prompt_prefixes = [
        r"^diagnóstico\s+presuntivo:?$",
        r"^diagnóstico:?$",
        r"^nombre\s+el\s+signo:?$",
        r"^nombre\s+el\s+siguiente\s+signo:?$",
        r"^nombre\s+el\s+signo\s+de\s+la\s+imagen:?$",
        r"^como\s+se\s+llama\s+el\s+siguiente\s+signo\??$",
        r"^describir\s+que\s+se\s+ve\s+en\s+la\s+tc\s+de\s+tórax\s+abajo:?$",
        r"^descripción\s+de\s+la\s+imagen:?$",
        r"^rx\s+tórax$"
    ]
    
    is_generic = False
    for pat in prompt_prefixes:
        if re.match(pat, first_line, re.IGNORECASE):
            is_generic = True
            break
            
    # Perguntas diretas (ex: ¿Cuál patrón...?)
    question_words = r"^(cual|cómo|como|qué|que|porque|por\s+qué|cuánto|describir|nombre)\b"
    if not is_generic:
        if re.match(question_words, first_line, re.IGNORECASE) and (first_line.endswith("?") or first_line.endswith(":")):
            is_generic = True
        elif len(lines) >= 2:
            combined = first_line + " " + lines[1]
            if re.match(question_words, combined, re.IGNORECASE) and combined.endswith("?"):
                is_generic = True
                first_line = combined
                lines = [first_line] + lines[2:]
                
    # Caso especial: "Rx tórax - Diagnóstico presuntivo"
    if not is_generic and len(lines) >= 2:
        if re.match(r"^rx\s+tórax$", lines[0], re.IGNORECASE) and re.match(r"^diagnóstico\s+presuntivo:?$", lines[1], re.IGNORECASE):
            is_generic = True
            first_line = lines[0] + " - " + lines[1]
            lines = [first_line] + lines[2:]
            
    # 4. Separar em Prompt, Resposta e Explicação
    if is_generic and len(lines) >= 2:
        prompt = first_line
        answer = lines[1]
        remaining = lines[2:]
    else:
        prompt = "Identifique o achado / diagnóstico"
        if len(lines[0]) < 60:
            answer = lines[0]
            remaining = lines[1:]
        else:
            answer = ""
            remaining = lines
            
    # Garantir que o Prompt termine de forma polida (com dois pontos ou interrogação)
    if not prompt.endswith("?") and not prompt.endswith(":"):
        prompt += ":"
        
    # 5. Formatar a Explicação com estilo HTML Premium
    formatted_explanation_lines = []
    
    for line in remaining:
        # Se for um título de método de imagem (Rx de tórax, TC, TAC, etc.)
        if re.search(r"\b(rx|tc|tac|tomograf[ií]a|radiograf[ií]a)\b", line, re.IGNORECASE):
            formatted_explanation_lines.append(f'<div class="exp-modality">📸 <strong>Estudio:</strong> {line}</div>')
        # Se for uma linha com causas
        elif line.lower().startswith("causas:"):
            content = line[7:].strip()
            formatted_explanation_lines.append(f'<div class="exp-causes">⚠️ <strong>Causas comuns:</strong> {content}</div>')
        # Se for um diagnóstico secundário citado
        elif line.lower().startswith("dx:"):
            content = line[3:].strip()
            formatted_explanation_lines.append(f'<div class="exp-dx">🎯 <strong>Diagnóstico:</strong> {content}</div>')
        # Se for observação/nota
        elif line.lower().startswith("obs:"):
            content = line[4:].strip()
            formatted_explanation_lines.append(f'<div class="exp-obs">💡 <strong>Nota:</strong> {content}</div>')
        else:
            # Bullet points se parecer com itens de uma lista
            if line.startswith("-") or line.startswith("*"):
                line = line[1:].strip()
                formatted_explanation_lines.append(f'<li>{line}</li>')
            else:
                formatted_explanation_lines.append(f'<p>{line}</p>')
                
    explanation_html = "".join(formatted_explanation_lines)
    
    if "<li>" in explanation_html and "<ul>" not in explanation_html:
        explanation_html = explanation_html.replace("<li>", "<ul><li>", 1)
        explanation_html += "</ul>"
        
    return prompt, answer, explanation_html

# Executar em todos os registros do raw_texts.json
with open("raw_texts.json", "r", encoding="utf-8") as f:
    raw_data = json.load(f)

formatted_data = {}
for page_num_str, raw_text in raw_data.items():
    page_num = int(page_num_str)
    if page_num == 1:
        continue # Pular página 1 (capa)
        
    prompt, answer, explanation = clean_text(raw_text, page_num)
    formatted_data[page_num] = {
        "prompt": prompt,
        "answer": answer,
        "explanation": explanation
    }

with open("formatted_texts.json", "w", encoding="utf-8") as f:
    json.dump(formatted_data, f, ensure_ascii=False, indent=2)

print("Formatted texts with overrides saved successfully into formatted_texts.json.")
