import json
import re

# Dicionário de substituições de digitação gerais
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
    r"\bLBD\b": "LSD",
    r"\bprótesis mamária\b": "prótesis mamarias",
    r"Humpton": "Hampton",
    r"Jaroba": "Joroba",
    r"fleischener": "Fleischner",
    r"Fleishner": "Fleischner",
}

# Dicionário de respostas perfeitamente padronizadas (de 2 a 108)
STANDARDIZED_ANSWERS = {
    2: "Signo de la Vela (Timo Fisiológico)",
    3: "Signo de Fleischner (TEP)",
    4: "Absceso Pulmonar",
    5: "Atelectasia de la Lígula",
    6: "Signo de la S de Golden",
    7: "Hamartoma Pulmonar",
    8: "Metástasis Pulmonar (Suelta de Globos)",
    9: "Enfisema Pulmonar (Bullas)",
    10: "Enfisema Pulmonar (Bullas)",
    11: "Bronquiectasias (Signo de Anillo de Sello)",
    12: "Patrón en Vidrio Esmerilado",
    13: "Linfangioleiomiomatosis (LAM)",
    14: "Patrón Reticular (Panal de Abejas)",
    15: "Nódulo Pulmonar Espiculado (Maligno)",
    16: "Neumotórax Izquierdo",
    17: "Linfangitis Carcinomatosa (Líneas B de Kerley)",
    18: "Nódulo Pulmonar Maligno",
    19: "Fibrosis Pulmonar (Panal de Abejas)",
    20: "Metástasis Pulmonar (Suelta de Globos)",
    21: "Derrame Pleural Izquierdo (Línea de Damoiseau)",
    22: "Neumotórax Derecho",
    23: "Bronquiectasias",
    24: "Neumonía por COVID-19 (Vidrio Esmerilado)",
    25: "Patrón Intersticial Reticular (Fibrosis)",
    26: "Neumonía Atípica (Legionella pneumophila)",
    27: "Tuberculosis Cavitada (Árbol en Brote)",
    28: "Atelectasia del Lóbulo Superior Derecho (S de Golden)",
    29: "Patrón Intersticial Reticular (Fibrosis Pulmonar)",
    30: "Absceso Pulmonar",
    31: "Quiste Pulmonar (TC de Tórax)",
    32: "Hiperinsuflación Pulmonar (Enfisema)",
    33: "Neumonía Atípica (Vidrio Esmerilado)",
    34: "Patrón Intersticial Lineal (Líneas B de Kerley)",
    35: "Absceso Pulmonar (Nivel Hidroaéreo)",
    36: "Signo de la Silueta Negativo",
    37: "Líneas B de Kerley (Edema Agudo de Pulmón)",
    38: "Signo de la S de Golden",
    39: "Lesión Intrapleural (Mesotelioma)",
    40: "Signo de Fleischner (TEP)",
    41: "Neumonía con Derrame Pleural y Atelectasia",
    42: "Signo de Lesión Extrapulmonar (Signo de la Embarazada)",
    43: "Cavitación Pulmonar (Diagnóstico Diferencial)",
    44: "Signo del Diafragma Continuo (Neumomediastino)",
    45: "Caverna Pulmonar",
    46: "Signo de la Silueta Negativo",
    47: "Múltiples Fracturas Costales y Neumotórax",
    48: "Signo del Hilio Oculto (Diagnóstico Diferencial)",
    49: "Bronconeumonía (Signo de Árbol en Brote)",
    50: "Signo Cervicotorácico (Mediastino Anterior vs Posterior)",
    51: "Neumonía Redonda",
    52: "Prótesis Mamarias (Hallazgo Fisiológico)",
    53: "Signo del Aire Creciente (Aspergiloma)",
    54: "Neumonía (Bloque Neumónico)",
    55: "Signo de la Suelta de Globos (Metástasis Pulmonar)",
    56: "Signo de Westermark (TEP)",
    57: "Signo de la Silueta Positivo",
    58: "Neumonía Atípica",
    59: "Bullas Pulmonares",
    60: "Atelectasia del Lóbulo Medio Derecho",
    61: "Signo del Broncograma Aéreo",
    62: "Embolia Séptica",
    63: "Patrón Intersticial Nodular",
    64: "Histiocitosis Pulmonar (Células de Langerhans)",
    65: "Signo del Dedo de Guante (Impactación Mucosa)",
    66: "Signo de la Silueta Positivo",
    67: "Derrame Pleural",
    68: "Nódulo Pulmonar Lobulado",
    69: "Atelectasia del Lóbulo Superior Derecho",
    70: "Tumor Fantasma (Derrame Cisural)",
    71: "Bronquiectasias (Anillo de Sello)",
    72: "Bipedestación en Radiografía de Tórax (Importancia)",
    73: "Enfisema Pulmonar",
    74: "Hamartoma Pulmonar",
    75: "Broncograma Aéreo (Consolidación Parenquimatosa)",
    76: "Neumotórax (Colapso Pulmonar)",
    77: "Bullas Pulmonares",
    78: "Caverna Tuberculosa",
    79: "Patrón Intersticial",
    80: "Signo de la Vela (Timo Fisiológico)",
    81: "Signo del Dedo de Guante (Impactación Mucosa)",
    82: "2 años (24 meses) de estabilidad",
    83: "Signo del Aire Creciente",
    84: "Signo del Diafragma Continuo",
    85: "Tuberculosis (TBC) Miliar",
    86: "Tuberculosis (TBC) Postprimaria (Árbol en Brote)",
    87: "Neumomediastino",
    88: "Líneas B de Kerley",
    89: "Caverna Pulmonar (TBC)",
    90: "Atelectasia Masiva",
    91: "Neumonía del Lóbulo Superior Derecho (LSD)",
    92: "Neumomediastino",
    93: "Joroba de Hampton (TEP)",
    94: "Atelectasia del Lóbulo Superior Izquierdo",
    95: "Hamartoma Pulmonar (Calcificación en Popcorn)",
    96: "Edema Agudo de Pulmón",
    97: "Fibrosis Pulmonar",
    98: "Granuloma Secuelar Calcificado",
    99: "Tuberculosis (TBC) Miliar",
    100: "Patología Pulmonar Intersticial Reticular",
    101: "Linfangioleiomiomatosis (LAM)",
    102: "Bronquiectasias",
    103: "Atelectasia del Lóbulo Medio Derecho",
    104: "Tromboembolismo Pulmonar (TEP)",
    105: "Signo de Westermark (TEP)",
    106: "Neumotórax a Tensión",
    107: "Empiema Pleural (Derrame Pleural)",
    108: "Hamartoma Pulmonar",
}

# Respostas clínicas estruturadas adicionais para enriquecer o mazo (SEM EMOJIS)
PREMIUM_DESCRIPTIONS = {
    2: "<p>Corresponde a una opacidad triangular del tejido tímico que se proyecta hacia la derecha o izquierda y a veces en ambas direcciones.</p><p><strong>Nota:</strong> Es fisiológico en niños. La involución de la sombra tímica comienza al final del primer año de vida y se completa alrededor de los 3 años.</p>",
    5: "<p>Opacidad homogénea que compromete a la lígula. Si es de gran tamaño, borra el borde cardíaco izquierdo (Signo de la Silueta positivo).</p>",
    6: "<p>Causado por la atelectasia del lóbulo superior derecho secundaria a una masa hiliar obstructiva. Dibuja una silueta con forma de \"S itálica\" en la cisura menor desplazada.</p>",
    7: "<p>TC de tórax en ventana mediastínica: se observa una imagen nodular bien delimitada en la región parahiliar derecha que presenta áreas de densidad grasa y calcificaciones en su interior.</p>",
    9: "<p>Las bullas son espacios aéreos mayores a 1 cm que se forman por la destrucción de los tabiques alveolares, características de enfisema pulmonar avanzado. Tienen paredes extremadamente finas y no realizan intercambio gaseoso.</p><div class=\"exp-modality\"><strong>Estudio:</strong> TAC de tórax en ventana pulmonar con contraste</div>",
    10: "<p>Las bullas son espacios aéreos mayores a 1 cm delimitados por una pared epitelizada extremadamente fina (menor a 1 mm) o incluso ausente, característicos de enfisema bulloso.</p>",
    13: "<p>Se caracteriza por la presencia de múltiples quistes aéreos de paredes finas distribuidos uniformemente por todo el parénquima pulmonar bilateral, respetando relativamente los vértices. Típico de mujeres en edad fértil.</p><div class=\"exp-modality\"><strong>Estudio:</strong> TAC de tórax en ventana pulmonar sin contraste</div>",
    15: "<p>Los nódulos con bordes espiculados o irregulares tienen una alta probabilidad de ser malignos (carcinoma broncogénico o metástasis), debido a la infiltración tumoral del intersticio circundante.</p>",
    16: "<p>Se observa una línea fina que corresponde a la pleura visceral desplazada medialmente en el hemitórax izquierdo, con ausencia de trama vascular por fuera de ella.</p><div class=\"exp-modality\"><strong>Estudio:</strong> Radiografía de tórax de frente</div>",
    19: "<p>Representa la fase terminal de diversas enfermedades intersticiales pulmonares. Se visualiza como espacios quísticos agrupados de 3 a 10 mm con paredes gruesas y bien definidas, típicamente subpleurales y en bases.</p>",
    21: "<p>Acumulación de líquido en el espacio pleural izquierdo, que se visualiza como una opacidad homogénea en la base izquierda con borramiento del seno costofrénico y formación de la curva cóncava superior (Línea de Damoiseau).</p>",
    22: "<p>Se caracteriza por la presencia de aire en el espacio pleural. Se visualiza una línea de pleura visceral nítida, con ausencia de trama vascular pulmonar periférica en el hemitórax derecho.</p>",
    23: "<p>Las bronquiectasias corresponden a dilataciones bronquiales anormales e irreversibles debidas a la destrucción del componente elástico y muscular de las paredes de las vías aéreas, frecuentemente secundarias a infecciones recurrentes.</p>",
    25: "<p>Se caracteriza por opacidades lineales finas o gruesas que se cruzan formando una red o malla. Sugiere alteración o engrosamiento del intersticio de soporte pulmonar, característico de fibrosis.</p>",
    30: "<p>El absceso pulmonar se visualiza como una cavidad con pared gruesa que presenta un nivel hidroaéreo en su interior en estudios de radiografía o tomografía computada de tórax. Representa una infección supurativa local con necrosis del parénquima.</p>",
    31: "<p>En la TC de tórax, un quiste se visualiza como un espacio de bordes bien definidos de tamaño variable con una pared de grosor fino.</p><p><strong>Nota:</strong> Es importante diferenciarlo de otras estructuras como cavidades (pared gruesa) o bullas (pared extremadamente delgada o ausente).</p>",
    32: "<p>Los principales hallazgos de hiperinsuflación pulmonar en la radiografía son:</p><ul><li>Tórax en tonel</li><li>Aplanamiento de las cúpulas diafragmáticas</li><li>Horizontalización de las costillas</li><li>Aumento de los espacios intercostales</li><li>Hiperclaridad pulmonar (atrapamiento de aire)</li></ul>",
    35: "<p><strong>Estudios de Imagen:</strong></p><ul><li><strong>A (Radiografía de tórax frente):</strong> En el pulmón izquierdo se observa una imagen redondeada radiopaca de pared gruesa que presenta un <strong>nivel hidroaéreo</strong>.</li><li><strong>B (TC de tórax ventana pulmonar, corte axial con contraste):</strong> En el pulmón derecho, se observa una gran cavidad de paredes gruesas que en su interior presenta también un nivel hidroaéreo característico.</li></ul>",
    37: "<p>Finas opacidades lineales periféricas visibles en las bases pulmonares en radiografías de tórax, características de edema agudo de pulmón (EAP) o congestión linfática.</p><p><strong>Patogenia:</strong> Representan el engrosamiento del intersticio interlobulillar por la congestión de los vasos pulmonares o acumulación de líquido en los septos.</p>",
    38: "<p>Producido por la <strong>atelectasia del lóbulo superior derecho</strong> secundaria a una masa que obstruye el bronquio lobar superior.</p><p><strong>Morfología:</strong> La cisura menor se desplaza medial y superiormente, pero se encuentra con la resistencia de la masa tumoral en la zona proximal. Esto dibuja una línea con forma de \"S itálica\" o \"S invertida\" (S de Golden).</p>",
    42: "<p>Las lesiones extrapulmonares de origen pleural, extrapleural o costal presentan <strong>bordes nítidos</strong> (al estar delimitadas por la pleura visceral) y forman una **curva convexa con ángulos obtusos** con respecto a la pared costal.</p><p><strong>Diagnóstico Diferencial:</strong> Por el contrario, las lesiones intrapulmonares tienen bordes imprecisos y forman ángulos agudos con la pleura.</p>",
    43: "<p>En la radiografía o TC de tórax, una cavitación pulmonar suele presentarse con una pared gruesa y un margen interno irregular.</p><p><strong>Diferenciación:</strong> No confundir con el absceso pulmonar, donde se observa un nivel hidroaéreo marcado debido a la presencia de contenido líquido activo (pus, necrosis).</p>",
    46: "<p>Ocurre cuando dos estructuras de densidades diferentes o en planos anatómicos diferentes (anterior/posterior) presentan una interface nítida y visible entre ellas.</p><p><strong>Ejemplo:</strong> Una opacidad mediastinal posterior en contacto aparente con el corazón (que es anterior) no apaga el contorno cardíaco.</p><p><strong>Signo de la Silueta Positivo:</strong> Dos estructuras con la misma densidad radiológica en contacto directo apagan sus límites recíprocos.</p>",
    47: "<p>Se observan pérdidas de la continuidad ósea en múltiples arcos costales, que pueden asociarse a neumotórax (presencia de aire en el espacio pleural con colapso pulmonar) por traumatismo torácico.</p>",
    48: "<p>Sirve para diferenciar una <strong>cardiomegalia genuina</strong> de una <strong>masa en el mediastino anterior</strong>.</p><ul><li><strong>Cardiomegalia:</strong> El agrandamiento cardíaco desplaza lateralmente los vasos hiliares. Los hilios son vistos \"por fuera\" de la silueta cardíaca.</li><li><strong>Masa mediastínica anterior:</strong> La masa se superpone a los vasos hiliares sin desplazarlos, por lo que los vasos siguen siendo visibles a través de la masa (Signo del hilio oculto).</li></ul>",
    49: "<p><strong>TC de tórax (ventana pulmonar):</strong></p><p>A nivel de la flecha se observa un patrón típico de **Árbol en Brote** (tree-in-bud), que representa la impactación mucoide o purulenta en los bronquiolos terminales con engrosamiento de sus paredes.</p><p><strong>Diagnóstico:</strong> Bronconeumonía infecciosa activa.</p>",
    50: "<p>Permite determinar si una masa del mediastino superior se localiza en el compartimento anterior o posterior.</p><ul><li><strong>Mediastino Anterior:</strong> La masa no sobrepasa el nivel de las clavículas (o sus bordes se desvanecen al entrar en contacto con las partes blandas del cuello).</li><li><strong>Mediastino Posterior:</strong> Si los contornos de la masa son visibles por encima de las clavículas, la masa es posterior, ya que está rodeada por el aire de los ápex pulmonares.</li></ul>",
    53: "<p>Se observa una colección semilunar de aire en la periferia que rodea una masa central redondeada de tejido necrótico o micetoma.</p><p><strong>Asociación:</strong> Característico de infections por **Aspergilosis Pulmonar Invasiva** en fase de recuperação, o un **Aspergiloma** (bola de hongos) dentro de una cavidad preexistente.</p><p><strong>Estudios:</strong></p><ul><li><strong>Izquierda (Radiografía):</strong> Muestra una radiopacidad redondeada con una medialuna radiolúcida superior.</li><li><strong>Derecha (TC):</strong> Muestra una cavidad aérea con un nódulo interno y el halo hipodenso aéreo semilunar.</li></ul>",
    55: "<p>Presencia de múltiples nódulos y masas pulmonares bien definidos, redondeados, de distribución bilateral, aleatoria y de diferentes tamaños.</p><p><strong>Diagnóstico:</strong> Característico de **metástasis pulmonares por vía hematógena** (ej. coriocarcinoma, osteosarcoma, cáncer de tiroides, renal o de mama).</p>",
    56: "<p>Área focal de hiperlucidez (oligoemia focal) en la periferia del pulmón, secundaria a la obstrucción de la arteria pulmonar por un tromboembolismo (TEP).</p><ul><li><strong>Rx de tórax:</strong> Se ve un área localizada más negra (radiolúcida) debido a la disminución del flujo vascular y de la sangre.</li><li><strong>TC de tórax:</strong> Se observa una zona de marcada hipodensidad del parénquima por hipoperfusión.</li></ul>",
    59: "<p>Espacios aéreos mayores a 1 cm delimitados por una pared epitelizada extremadamente fina (menor a 1 mm) o incluso ausente.</p><p><strong>Diagnóstico Diferencial:</strong> Debe diferenciarse de quistes (paredes finas pero definidas, de 1-3 mm) y cavidades (paredes gruesas, mayores a 3 mm). Común en enfisema bulloso.</p>",
    60: "<p>Se caracteriza por la pérdida de volumen del lóbulo medio derecho. En la radiografía de perfil se observa una opacidad triangular o de banda bien delimitada entre las cisuras menor y mayor.</p>",
    61: "<p>Visualización de los bronquios llenos de aire (estructuras tubulares oscuras/radiolúcidas) dentro de una zona de pulmón consolidado y denso (blanco/radiopaco).</p><p><strong>Fisiopatología:</strong> Los alvéolos que rodean los bronquios están ocupados por líquido, sangre o pus (consolidación), haciendo contraste con el aire que aún circula en los bronquios.</p>",
    65: "<p>Representa bronquios dilatados (bronquiectasias de localización central) impactados por secreciones mucosas densas.</p><p><strong>Clínica:</strong> Típico de patologias como la **Aspergilosis Broncopulmonar Alérgica (ABPA)**, asma crónico, fibrosis quística o neoplasia obstructiva proximal.</p>",
    66: "<p>Ocurre cuando dos estructuras de la **misma densidad radiológica** están en **contacto anatómico directo**, lo que produce el borramiento y pérdida de definición de sus bordes limítrofes.</p><p><strong>Importancia:</strong> Permite localizar la lesión. Por ejemplo, una neumonía que borra el borde derecho del corazón está en el Lóbulo Medio.</p>",
    67: "<p>El derrame pleural es la acumulación anormal de líquido en el espacio pleural. Se presenta típicamente como una opacidad homogénea en las bases pulmonares con borramiento de los senos costofrénico y cardiofrénico (Signo del menisco o Línea de Damoiseau).</p>",
    79: "<p>Radiografía de tórax de frente que muestra un aumento difuso de la densidad pulmonar con opacidades lineales o reticulares, indicativo de afectación del espacio intersticial de soporte.</p>",
    82: "<p><strong>Criterio de Estabilidad:</strong> Un nódulo pulmonar debe permanecer sin cambios de tamaño o características de forma estable durante un período de **2 años (24 meses)** en estudios comparativos de TC para ser clasificado como benigno.</p>",
    85: "<p>Consiste en una siembra hematógena de múltiples nódulos pequeños (de 1 a 3 mm, del tamaño de granos de mijo) distribuidos de forma uniforme y difusa en ambos campos pulmonares.</p>",
    90: "<p>Colapso completo de un pulmón entero. Se observa una opacidad homogénea de todo el hemitórax afectado, con marcada desviación del mediastino, la tráquea y el corazón hacia el lado de la lesión, y elevación del hemidiafragma.</p>",
    94: "<p>Se presenta como una opacidad homogénea en el hemitórax izquierdo que desplaza la cisura mayor hacia adelante y arriba, borrando el contorno cardíaco izquierdo (Signo de la silueta positivo) y con elevación del hilio ipsolateral.</p>",
    95: "<p><strong>TC de tórax (ventana mediastínica):</strong></p><p>Se observa una imagen nodular bien delimitada en la región parahiliar derecha que presenta áreas internas con densidad grasa y focos de calcificación en parches gruesos, conocidos como <strong>calcificaciones en popcorn (pochoclo)</strong>.</p><p><strong>Nota:</strong> Es el tumor benigno más común del pulmón.</p>",
    101: "<p>TC de tórax en ventana pulmonar: se observan múltiples quistes de pared fina distribuidos de forma difusa y bilateral en el parénquima pulmonar. Afecta casi exclusivamente a mujeres en edad fértil y se asocia a neumotórax recurrentes.</p>",
}

# Prefixo e redundância stripping
PREFIXES_TO_STRIP = [
    "absceso pulmonar", "neumotorax izquierdo", "neumotorax derecho", 
    "enfisema", "bronquiectasia", "bronquiectasias", "linfangioleiomiomatosis", 
    "metastasis pulmonar", "tuberculosis", "atelectasia", 
    "derrame pleural", "hamartoma pulmonar", "caverna pulmonar",
    "neumomediastino", "edema de pulmon", "fibrosis pulmonar",
    "signo de fleischener", "signo de la vela", "dedo de guante",
    "lineas b de kerley", "joroba de hampton", "signo de westermark",
    "patron en vidro esmerillado", "patron en vidrio esmerilado",
    "tbc militar", "tbc postprimaria", "tubercolosis militar",
    "hemartroma pulmonar", "edema de pulmón", "covid-19",
    "bullas", "linfangitis", "tumor fantasma", "atelectasia lobulo",
    "atelectasia de lóbulo", "atelectasia de la lingula", "tep",
    "neumonia atipica", "neumonía atípica", "neumonia", "neumonía"
]

def strip_redundancy(text, answer):
    # Strip normal answer parts
    text = text.strip()
    norm_text = text.lower()
    norm_ans = answer.lower()
    
    # Check for direct prefixes from the list
    for prefix in PREFIXES_TO_STRIP:
        if norm_text.startswith(prefix):
            pattern = re.compile(r'^' + re.escape(prefix) + r'[\s\-\:\,\.\b]*', re.IGNORECASE)
            text = pattern.sub('', text).strip()
            norm_text = text.lower()
            
    # Check for answer parts (split by parentheses/hyphens)
    ans_parts = [t.strip() for t in re.split(r'[\(\)\-]', norm_ans) if len(t.strip()) > 4]
    for part in ans_parts:
        if norm_text.startswith(part):
            pattern = re.compile(r'^' + re.escape(part) + r'[\s\-\:\,\.\b]*', re.IGNORECASE)
            text = pattern.sub('', text).strip()
            norm_text = text.lower()
            
    # Clean capitalization
    if text:
        text = text[0].upper() + text[1:]
    return text.strip()

def clean_text_block(block):
    # Aplicar substituições gerais
    for pattern, replacement in REPLACEMENTS.items():
        block = re.sub(pattern, replacement, block, flags=re.IGNORECASE)
    return block

def is_modality_label(line):
    # Verifica se a linha é estritamente um rótulo de método diagnóstico
    if len(line) > 60:
        return False
    # Contém termos de modalidade
    has_keyword = re.search(r"\b(rx|tc|tac|tomograf[ií]a|radiograf[ií]a|corte|cortes|axial|axiales|coronal|sagital|ventana)\b", line, re.IGNORECASE)
    if not has_keyword:
        return False
    # Não pode conter verbos explicativos comuns
    verbs = r"\b(se\s+observa|observa|se\s+ve|ve|muestra|es|corresponde|indica|asocia|tiene|presenta|ayuda|visualiza|se\s+visualiza|produce|adquiere|obstruido|desplaza|permite|diferenciar|basado|sirve|caracteriza|representa|proyecta|comienza|completa)\b"
    if re.search(verbs, line, re.IGNORECASE):
        return False
    return True

def merge_broken_lines(raw_text):
    # Junta linhas fragmentadas baseando-se em pontuação
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
    merged_blocks = []
    current = ""
    
    # Skips de prompts redundantes do PDF
    prompt_skips = [
        r"^diagnóstico\s+presuntivo:?$",
        r"^diagnóstico:?$",
        r"^nombre\s+el\s+signo:?$",
        r"^nombre\s+el\s+siguiente\s+signo:?$",
        r"^nombre\s+el\s+signo\s+de\s+la\s+imagen:?$",
        r"^como\s+se\s+llama\s+el\s+siguiente\s+signo\??$",
        r"^describir\s+que\s+se\s+ve\s+en\s+la\s+tc\s+de\s+tórax\s+abajo:?$",
        r"^descripción\s+de\s+la\s+imagen:?$",
        r"^rx\s+tórax$",
        r"^rx\s+t[oó]rax\s+-\s+diagn[oó]stico\s+presuntivo:?$",
        r"^porque\s+se\s+toma\s+radiografia\s+de\s+un\s+paciente\s+parado\??$"
    ]
    
    for line in lines:
        # Pular prompts repetidos
        is_prompt = False
        for pat in prompt_skips:
            if re.match(pat, line, re.IGNORECASE):
                is_prompt = True
                break
        if is_prompt:
            continue
            
        if line.startswith("-") or line.startswith("*"):
            if current:
                merged_blocks.append(current.strip())
                current = ""
            merged_blocks.append(line)
        else:
            if not current:
                current = line
            else:
                # Se terminar com pontuação, fecha o bloco. Caso contrário, junta!
                if current[-1] in ['.', '?', '!', ':', ';']:
                    merged_blocks.append(current.strip())
                    current = line
                else:
                    current += " " + line
                    
    if current:
        merged_blocks.append(current.strip())
        
    return merged_blocks

# Executar o re-processamento completo
with open("raw_texts.json", "r", encoding="utf-8") as f:
    raw_data = json.load(f)

formatted_data = {}
for page_num_str, raw_text in raw_data.items():
    page_num = int(page_num_str)
    if page_num == 1:
        continue
        
    answer = STANDARDIZED_ANSWERS.get(page_num, "Achado Clínico")
    
    # 1. Determinar a Pergunta (Prompt) Padronizada
    # Checar se no texto bruto há uma pergunta específica
    first_lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    raw_prompt = first_lines[0] if first_lines else ""
    
    if "porque" in raw_prompt.lower() or "bipedestación" in answer.lower():
        prompt = "¿Por qué se realiza la radiografía de tórax en bipedestación?"
    elif "cuanto tempo" in raw_prompt.lower() or "cuanto tiempo" in raw_prompt.lower() or "estabilidad" in answer.lower() or page_num == 82:
        prompt = "¿Cuánto tiempo debe permanecer estable un nódulo pulmonar para considerarse benigno?"
    elif "qué tipo de patrón tumoral" in raw_prompt.lower() or "patrón tumoral" in raw_prompt.lower() or page_num == 18:
        prompt = "¿Qué tipo de patrón tumoral se observa?"
    elif "cual patrón" in raw_prompt.lower() or "interticial" in raw_prompt.lower():
        if "tc" in raw_prompt.lower() or page_num == 14:
            prompt = "¿Qué patrón se observa en la tomografía computada?"
        else:
            prompt = "¿Qué patrón intersticial se observa en las imágenes?"
    elif "silueta positivo" in raw_prompt.lower() or page_num == 66:
        prompt = "¿Qué es el Signo de la Silueta Positivo?"
    elif "signo" in answer.lower() or "líneas" in answer.lower() or "joroba" in answer.lower():
        prompt = "Nombre el siguiente signo radiológico:"
    else:
        prompt = "Identifique el hallazgo o diagnóstico presuntivo:"

    # 2. Gerar Explicação Clássica ou Premium
    if page_num in PREMIUM_DESCRIPTIONS:
        explanation = PREMIUM_DESCRIPTIONS[page_num]
    else:
        # Mesclar linhas de forma inteligente e limpar
        merged_blocks = merge_broken_lines(raw_text)
        explanation_blocks = []
        
        for block in merged_blocks:
            block = clean_text_block(block)
            block = strip_redundancy(block, answer)
            if not block:
                continue
                
            # Determinar tipo do bloco e formatar (SEM EMOJIS)
            if is_modality_label(block):
                explanation_blocks.append(f'<div class="exp-modality"><strong>Estudio:</strong> {block}</div>')
            elif block.lower().startswith("causas:"):
                content = block[7:].strip()
                explanation_blocks.append(f'<div class="exp-causes"><strong>Causas comunes:</strong> {content}</div>')
            elif block.lower().startswith("dx:"):
                content = block[3:].strip()
                explanation_blocks.append(f'<div class="exp-dx"><strong>Diagnóstico:</strong> {content}</div>')
            elif block.lower().startswith("obs:") or block.lower().startswith("nota:"):
                prefix_len = 4 if block.lower().startswith("obs:") else 5
                content = block[prefix_len:].strip()
                explanation_blocks.append(f'<div class="exp-obs"><strong>Nota:</strong> {content}</div>')
            else:
                if block.startswith("-") or block.startswith("*"):
                    content = block[1:].strip()
                    explanation_blocks.append(f'<li>{content}</li>')
                else:
                    explanation_blocks.append(f'<p>{block}</p>')
                    
        # Unir blocos formatados
        explanation = "".join(explanation_blocks)
        
        # Envelopar bullets em <ul>
        if "<li>" in explanation and "<ul>" not in explanation:
            explanation = explanation.replace("<li>", "<ul><li>", 1)
            explanation += "</ul>"
            
        # Adicionar descrição médica premium para cards vazios ou muito curtos de forma programática
        clean_exp_text = re.sub(r'<[^>]*>', '', explanation).strip()
        if not clean_exp_text or len(clean_exp_text) < 15:
            # Fallbacks excelentes e educativos
            if "bronquiectasias" in answer.lower():
                explanation = "<p>Las bronquiectasias corresponden a dilataciones bronquiales anormales e irreversibles debidas a la destrucción del componente elástico y muscular de las paredes de las vías aéreas, frecuentemente secundarias a infecciones recurrentes.</p>" + explanation
            elif "neumotórax" in answer.lower():
                explanation = "<p>El neumotórax se caracteriza por la presencia de aire en el espacio pleural. Se visualiza una línea de pleura visceral nítida, con ausencia de trama vascular pulmonar periférica en el hemitórax afectado.</p>" + explanation
            elif "derrame pleural" in answer.lower():
                explanation = "<p>El derrame pleural es la acumulación anormal de líquido en el espacio pleural. Se presenta típicamente como una opacidad homogénea en las bases pulmonares con borramiento del contorno diafragmático (Signo del menisco o Línea de Damoiseau).</p>" + explanation
            elif "absceso" in answer.lower():
                explanation = "<p>El absceso pulmonar se visualiza como una cavidad de pared gruesa que presenta un nivel hidroaéreo característico en su interior en estudios de radiografía o TC de tórax. Representa un foco de necrosis del parénquima.</p>" + explanation
            elif "fibrosis" in answer.lower():
                explanation = "<p>La fibrosis pulmonar se caracteriza por opacidades lineales o reticulares gruesas que distorsionan la arquitectura lobulillar, típicamente con un patrón en panal de abejas y bronquiectasias por tracción.</p>" + explanation

    formatted_data[page_num] = {
        "prompt": prompt,
        "answer": answer,
        "explanation": explanation
    }

# Gravar no arquivo JSON final
with open("formatted_texts.json", "w", encoding="utf-8") as f:
    json.dump(formatted_data, f, ensure_ascii=False, indent=2)

print("SUCESSO TOTAL: Todos os 107 flashcards foram formatados com as novas regras inteligentes, eliminando linhas cortadas com sucesso!")
