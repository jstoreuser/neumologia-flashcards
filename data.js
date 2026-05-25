// Banco de dados dos flashcards médicos
const FLASHCARD_DATA = [
  {
    "id": 2,
    "pageNumber": "2",
    "images": [
      "images/img_pagina_2_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de la Vela (Timo Fisiológico)",
    "explanation": "<p>Corresponde a una opacidad triangular del tejido tímico que se proyecta hacia la derecha o izquierda y a veces en ambas direcciones.</p><p>💡 <strong>Nota:</strong> Es fisiológico en niños. La involución de la sombra tímica comienza al final del primer año de vida y se completa alrededor de los 3 años.</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 3,
    "pageNumber": "3",
    "images": [
      "images/img_pagina_3_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de Fleischner (TEP)",
    "explanation": "<p>Indicativo para TEP, es un agrandamiento proximal de la arteria pulmonar.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> Tomografia computada sin contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 4,
    "pageNumber": "4",
    "images": [
      "images/img_pagina_4_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Absceso Pulmonar",
    "explanation": "<p>Signo del aire creciente.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana pulmonar sin contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 5,
    "pageNumber": "5",
    "images": [
      "images/img_pagina_5_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Atelectasia de la Lígula",
    "explanation": "<p>Opacidad homogénea que compromete a la lígula. Si es de gran tamaño, borra el borde cardíaco izquierdo (Signo de la Silueta positivo).</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 6,
    "pageNumber": "6",
    "images": [
      "images/img_pagina_6_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de la S de Golden",
    "explanation": "<p>Causado por la atelectasia del lóbulo superior derecho secundaria a una masa hiliar obstructiva. Dibuja una silueta con forma de \"S itálica\" en la cisura menor desplazada.</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 7,
    "pageNumber": "7",
    "images": [
      "images/img_pagina_7_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Hamartoma Pulmonar",
    "explanation": "<p>TC de tórax en ventana mediastínica: se observa una imagen nodular bien delimitada en la región parahiliar derecha que presenta áreas de densidad grasa y calcificaciones en su interior.</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 8,
    "pageNumber": "8",
    "images": [
      "images/img_pagina_8_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Metástasis Pulmonar (Suelta de Globos)",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana pulmonar con contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 9,
    "pageNumber": "9",
    "images": [
      "images/img_pagina_9_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Enfisema Pulmonar (Bullas)",
    "explanation": "<p>Las bullas son espacios aéreos mayores a 1 cm que se forman por la destrucción de los tabiques alveolares, características de enfisema pulmonar avanzado. Tienen paredes extremadamente finas y no realizan intercambio gaseoso.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC de tórax en ventana pulmonar con contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 10,
    "pageNumber": "10",
    "images": [
      "images/img_pagina_10_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Enfisema Pulmonar (Bullas)",
    "explanation": "<p>Las bullas son espacios aéreos mayores a 1 cm delimitados por una pared epitelizada extremadamente fina (menor a 1 mm) o incluso ausente, característicos de enfisema bulloso.</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 11,
    "pageNumber": "11",
    "images": [
      "images/img_pagina_11_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Bronquiectasias (Signo de Anillo de Sello)",
    "explanation": "<p>S Anillo de Sello.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana pulmonar con contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 12,
    "pageNumber": "12",
    "images": [
      "images/img_pagina_12_1.jpeg"
    ],
    "prompt": "¿Qué patrón intersticial se observa en las imágenes?",
    "answer": "Patrón en Vidrio Esmerilado",
    "explanation": "<p>Cual Patrón se puede visualizar en las imágenes abajo?</p><p>Se puede ver bien las estructuras vasculares y los bronquios, pero no tengo nitidez.</p><div class=\"exp-dx\">🎯 <strong>Diagnóstico:</strong> Neumonia Atipica</div>",
    "tags": [
      "Neumología",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 13,
    "pageNumber": "13",
    "images": [
      "images/img_pagina_13_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Linfangioleiomiomatosis (LAM)",
    "explanation": "<p>Se caracteriza por la presencia de múltiples quistes aéreos de paredes finas distribuidos uniformemente por todo el parénquima pulmonar bilateral, respetando relativamente los vértices. Típico de mujeres en edad fértil.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC de tórax en ventana pulmonar sin contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 14,
    "pageNumber": "14",
    "images": [
      "images/img_pagina_14_1.jpeg"
    ],
    "prompt": "¿Qué patrón se observa en la tomografía computada?",
    "answer": "Patrón Reticular (Panal de Abejas)",
    "explanation": "<p>Cual Patrón se visualiza en la TC abajo?</p><p>Reticular o pañal de abejas Sugiere destrucción, alteración masiva del intersticio.</p><p>Se ve en pacientes con EPOC avanzado.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana pulmonar con contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 15,
    "pageNumber": "15",
    "images": [
      "images/img_pagina_15_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Nódulo Pulmonar Espiculado (Maligno)",
    "explanation": "<p>Los nódulos con bordes espiculados o irregulares tienen una alta probabilidad de ser malignos (carcinoma broncogénico o metástasis), debido a la infiltración tumoral del intersticio circundante.</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 16,
    "pageNumber": "16",
    "images": [
      "images/img_pagina_16_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumotórax Izquierdo",
    "explanation": "<p>Se observa una línea fina que corresponde a la pleura visceral desplazada medialmente en el hemitórax izquierdo, con ausencia de trama vascular por fuera de ella.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> Radiografía de tórax de frente</div>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 17,
    "pageNumber": "17",
    "images": [
      "images/img_pagina_17_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Linfangitis Carcinomatosa (Líneas B de Kerley)",
    "explanation": "<p>Patrón intersticial lineal:</p><p>Engrosamiento intersticial de los septos (tabiques intersticiales engrosados), así que empiezo a ver muchas líneas y eso llama Linfangitis (producto de diseminación de un cáncer, como el cáncer de mama y de tubo digestivo). Lineas B Kerley TAC ventana pulmonar sin contraste</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Signo_Radiológico",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 18,
    "pageNumber": "18",
    "images": [
      "images/img_pagina_18_1.jpeg"
    ],
    "prompt": "¿Qué tipo de patrón tumoral se observa?",
    "answer": "Nódulo Pulmonar Maligno",
    "explanation": "<p>Qué tipo de Patrón tumoral es?</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> Patrón maligno TAC ventana mediastínica sin contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 19,
    "pageNumber": "19",
    "images": [
      "images/img_pagina_19_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Fibrosis Pulmonar (Panal de Abejas)",
    "explanation": "<p>Representa la fase terminal de diversas enfermedades intersticiales pulmonares. Se visualiza como espacios quísticos agrupados de 3 a 10 mm con paredes gruesas y bien definidas, típicamente subpleurales y en bases.</p>",
    "tags": [
      "Neumología",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 20,
    "pageNumber": "20",
    "images": [
      "images/img_pagina_20_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Metástasis Pulmonar (Suelta de Globos)",
    "explanation": "<p>Patrón nodular producto de la metástasis lo cual llamamos SUELTA DE GLOBOS.</p>",
    "tags": [
      "Neumología",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 21,
    "pageNumber": "21",
    "images": [
      "images/img_pagina_21_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Derrame Pleural Izquierdo (Línea de Damoiseau)",
    "explanation": "<p>Acumulación de líquido en el espacio pleural izquierdo, que se visualiza como una opacidad homogénea en la base izquierda con borramiento del seno costofrénico y formación de la curva cóncava superior (Línea de Damoiseau).</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 22,
    "pageNumber": "22",
    "images": [
      "images/img_pagina_22_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumotórax Derecho",
    "explanation": "<p>Se caracteriza por la presencia de aire en el espacio pleural. Se visualiza una línea de pleura visceral nítida, con ausencia de trama vascular pulmonar periférica en el hemitórax derecho.</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 23,
    "pageNumber": "23",
    "images": [
      "images/img_pagina_23_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Bronquiectasias",
    "explanation": "<p>Las bronquiectasias corresponden a dilataciones bronquiales anormales e irreversibles debidas a la destrucción del componente elástico y muscular de las paredes de las vías aéreas, frecuentemente secundarias a infecciones recurrentes.</p>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 24,
    "pageNumber": "24",
    "images": [
      "images/img_pagina_24_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumonía por COVID-19 (Vidrio Esmerilado)",
    "explanation": "<p>El COVID 19 tiene ese tipo de patrón con estas opacidades en vidrio esmerilado periféricas y subpleurales.</p>",
    "tags": [
      "Neumología",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 25,
    "pageNumber": "25",
    "images": [
      "images/img_pagina_25_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Patrón Intersticial Reticular (Fibrosis)",
    "explanation": "<p>Se caracteriza por opacidades lineales finas o gruesas que se cruzan formando una red o malla. Sugiere alteración o engrosamiento del intersticio de soporte pulmonar, característico de fibrosis.</p>",
    "tags": [
      "Neumología",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 26,
    "pageNumber": "26",
    "images": [
      "images/img_pagina_26_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumonía Atípica (Legionella pneumophila)",
    "explanation": "<p>Por Legionella pneumophila.</p><p>TC una afectación del espacio aéreo de distribución parcheada, bilateral y asimétrica, en forma de opacidades en vidrio deslustrado, junto a engrosamiento del intersticio interlobulillar, conformando un patrón en empedrado.</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 27,
    "pageNumber": "27",
    "images": [
      "images/img_pagina_27_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Tuberculosis Cavitada (Árbol en Brote)",
    "explanation": "<p>Cortes axiales de TC de tórax en ventana de pulmón. Consolidación cavitada de localización periférica en el LII con afectación del parénquima pulmonar adyacente en forma de nódulos centrilobulillares y opacidades en árbol en brote (círculo rojo).</p>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 28,
    "pageNumber": "28",
    "images": [
      "images/img_pagina_28_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Atelectasia del Lóbulo Superior Derecho (S de Golden)",
    "explanation": "<p>De lóbulo superior derecho Produce una radioopacidad en topografía del lóbulo superior derecho, que adquiere una morfología de S invertida, también llamado Signo de la “S de golden”.</p><p>Elevación del hemidiafragma e hiliohomolateral.</p><p>Limite bien abrupto a nivel de donde va a terminar la lesión.</p><p>La cisura esta un poco elevada.</p><p>Desviación de la tráquea hacia el lado afectado. Aumento de la radiolucidez de los pulmones (insuflación).</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 29,
    "pageNumber": "29",
    "images": [
      "images/img_pagina_29_1.jpeg"
    ],
    "prompt": "¿Qué patrón intersticial se observa en las imágenes?",
    "answer": "Patrón Intersticial Reticular (Fibrosis Pulmonar)",
    "explanation": "<p>Cual Patrón intersticial está representado en las imagenes abajo?</p><p>Patrón Reticular Se observan opacidades lineales que forman redes de encaje con predominio en zonas periféricas del pulmón y leve predilección a lóbulos inferiores.</p><div class=\"exp-causes\">⚠️ <strong>Causas comunes:</strong> Fibrosis pulmonar idiopática, colagenopatías, enfermedades inhalatorias (neumoconiosis).</div>",
    "tags": [
      "Neumología",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 30,
    "pageNumber": "30",
    "images": [
      "images/img_pagina_30_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Absceso Pulmonar",
    "explanation": "<p>El absceso pulmonar se visualiza como una cavidad con pared gruesa que presenta un nivel hidroaéreo en su interior en estudios de radiografía o tomografía computada de tórax. Representa una infección supurativa local con necrosis del parénquima.</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Tomografía"
    ]
  },
  {
    "id": 31,
    "pageNumber": "31",
    "images": [
      "images/img_pagina_31_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Quiste Pulmonar (TC de Tórax)",
    "explanation": "<p>En la TC de tórax, un quiste se visualiza como un espacio de bordes bien definidos de tamaño variable con una pared de grosor fino.</p><p>💡 <strong>Nota:</strong> Es importante diferenciarlo de otras estructuras como cavidades (pared gruesa) o bullas (pared extremadamente delgada o ausente).</p>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 32,
    "pageNumber": "32",
    "images": [
      "images/img_pagina_32_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Hiperinsuflación Pulmonar (Enfisema)",
    "explanation": "<p>Los principales hallazgos de hiperinsuflación pulmonar en la radiografía son:</p><ul><li>Tórax en tonel</li><li>Aplanamiento de las cúpulas diafragmáticas</li><li>Horizontalización de las costillas</li><li>Aumento de los espacios intercostales</li><li>Hiperclaridad pulmonar (atrapamiento de aire)</li></ul>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 33,
    "pageNumber": "33",
    "images": [
      "images/img_pagina_33_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumonía Atípica (Vidrio Esmerilado)",
    "explanation": "<p>Tc de tórax, ventana pulmonar. Patrón intersticio-alveolar donde se observan hiperdensidades heterogeneas difusas (por parches que empiezan en la periferia hacia el centro) que corresponde en VIDRIO ESMERILADO.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC axial y TC Sagital torax sin contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 34,
    "pageNumber": "34",
    "images": [
      "images/img_pagina_34_1.jpeg"
    ],
    "prompt": "¿Qué patrón intersticial se observa en las imágenes?",
    "answer": "Patrón Intersticial Lineal (Líneas B de Kerley)",
    "explanation": "<p>Cual Patrón intersticial está representado en las imagenes abajo?</p><p>Patrón Lineal Se caracteriza por la presencia de líneas delgadas y alargadas en la radiografía o tomografía de tórax, que reflejan un engrosamiento de los septos interlobulares o intersticiales.</p><div class=\"exp-causes\">⚠️ <strong>Causas comunes:</strong> Edema pulmonar, linfangitis carcinomatosa.</div>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 35,
    "pageNumber": "35",
    "images": [
      "images/img_pagina_35_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Absceso Pulmonar (Nivel Hidroaéreo)",
    "explanation": "<p>📸 <strong>Estudios de Imagen:</strong></p><ul><li><strong>A (Radiografía de tórax frente):</strong> En el pulmón izquierdo se observa una imagen redondeada radiopaca de pared gruesa que presenta un <strong>nivel hidroaéreo</strong>.</li><li><strong>B (TC de tórax ventana pulmonar, corte axial con contraste):</strong> En el pulmón derecho, se observa una gran cavidad de paredes gruesas que en su interior presenta también un nivel hidroaéreo característico.</li></ul>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Tomografía"
    ]
  },
  {
    "id": 36,
    "pageNumber": "36",
    "images": [
      "images/img_pagina_36_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de la Silueta Negativo",
    "explanation": "<p>Diagnóstico: Signo de la Silueta Negativo Opacidad mediastinal y paracardiaca izquierda de localización posterior en el hemitórax izquierdo.</p><p>NO HAY BORRAMIENTO, las estructuras son de densidades diferentes.</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 37,
    "pageNumber": "37",
    "images": [
      "images/img_pagina_37_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Líneas B de Kerley (Edema Agudo de Pulmón)",
    "explanation": "<p>Finas opacidades lineales periféricas visibles en las bases pulmonares en radiografías de tórax, características de edema agudo de pulmón (EAP) o congestión linfática.</p><p>💡 <strong>Patogenia:</strong> Representan el engrosamiento del intersticio interlobulillar por la congestión de los vasos pulmonares o acumulación de líquido en los septos.</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 38,
    "pageNumber": "38",
    "images": [
      "images/img_pagina_38_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de la S de Golden",
    "explanation": "<p>Producido por la <strong>atelectasia del lóbulo superior derecho</strong> secundaria a una masa que obstruye el bronquio lobar superior.</p><p>💡 <strong>Morfología:</strong> La cisura menor se desplaza medial y superiormente, pero se encuentra con la resistencia de la masa tumoral en la zona proximal. Esto dibuja una línea con forma de \"S itálica\" o \"S invertida\" (S de Golden).</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 39,
    "pageNumber": "39",
    "images": [
      "images/img_pagina_39_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Lesión Intrapleural (Mesotelioma)",
    "explanation": "<p>Las lesiones intrapulmonares, por el contrario, tienen bordes imprecisos, con ángulos agudos hacia la pleura. Es una lesión redondeada de menor campo pegada a la pleura parietal. El espacio que existe entre la pleura parietal y visceral es el espacio intrapleural o cavidad pleural.</p><p>Ejemplo: Mesotelioma.</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 40,
    "pageNumber": "40",
    "images": [
      "images/img_pagina_40_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de Fleischner (TEP)",
    "explanation": "<p>En el Signo de Fleischner se observa un grandamiento de las arterias pulmonares en la radiografía, generalmente secundario a embolismo pulmonar (TEP) Obstrucción de las arterias pulmonares que provoca una dilatación proximal de estos vasos pulmonares y es secundario a una embolia pulmonar.</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 41,
    "pageNumber": "41",
    "images": [
      "images/img_pagina_41_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumonía con Derrame Pleural y Atelectasia",
    "explanation": "<p>Con Derrame pleural y zona de atelectasia a nivel de la cisura TC tórax, ventana pulmonar. Hiperdensidad heterogénea con broncograma aéreo (compatible con neumonía). Hiperdensidad homogéneas a nivel periférico con concavidad hacia arriba por el derrame pleural en pulmón derecho. Hiperdensidad homogénea en forma triangular compatible con atelectasia.</p>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 42,
    "pageNumber": "42",
    "images": [
      "images/img_pagina_42_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de Lesión Extrapulmonar (Signo de la Embarazada)",
    "explanation": "<p>Las lesiones extrapulmonares de origen pleural, extrapleural o costal presentan <strong>bordes nítidos</strong> (al estar delimitadas por la pleura visceral) y forman una **curva convexa con ángulos obtusos** con respecto a la pared costal.</p><p>💡 <strong>Diagnóstico Diferencial:</strong> Por el contrario, las lesiones intrapulmonares tienen bordes imprecisos y forman ángulos agudos con la pleura.</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 43,
    "pageNumber": "43",
    "images": [
      "images/img_pagina_43_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Cavitación Pulmonar (Diagnóstico Diferencial)",
    "explanation": "<p>En la radiografía o TC de tórax, una cavitación pulmonar suele presentarse con una pared gruesa y un margen interno irregular.</p><p>⚠️ <strong>Diferenciación:</strong> No confundir con el absceso pulmonar, donde se observa un nivel hidroaéreo marcado debido a la presencia de contenido líquido activo (pus, necrosis).</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Tomografía"
    ]
  },
  {
    "id": 44,
    "pageNumber": "44",
    "images": [
      "images/img_pagina_44_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo del Diafragma Continuo (Neumomediastino)",
    "explanation": "<p>Cómo se observa el Signo del diafragma contínuo en el Rx tórax?</p><p>Se observa una línea continua de hiperlucidez extendiéndose a lo largo de la línea media, por encima del diafragma Característico de NEUMOMEDIASTINO (presencia de aire a nivel del mediastino)</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 45,
    "pageNumber": "45",
    "images": [
      "images/img_pagina_45_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Caverna Pulmonar",
    "explanation": "<p>CAVERNA: Rx de tórax frente donde se observan en ambos campos pulmonares varias lesiones radiolucentes con halo radiopaco que corresponde probablemente a MTS, embolia séptica o TBC.</p>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 46,
    "pageNumber": "46",
    "images": [
      "images/img_pagina_46_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de la Silueta Negativo",
    "explanation": "<p>Ocurre cuando dos estructuras de densidades diferentes o en planos anatómicos diferentes (anterior/posterior) presentan una interface nítida y visible entre ellas.</p><p>💡 <strong>Ejemplo:</strong> Una opacidad mediastinal posterior en contacto aparente con el corazón (que es anterior) no apaga el contorno cardíaco.</p><p>⚠️ <strong>Signo de la Silueta Positivo:</strong> Dos estructuras con la misma densidad radiológica en contacto directo apagan sus límites recíprocos.</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 47,
    "pageNumber": "47",
    "images": [
      "images/img_pagina_47_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Múltiples Fracturas Costales y Neumotórax",
    "explanation": "<p>Se observan pérdidas de la continuidad ósea en múltiples arcos costales, que pueden asociarse a neumotórax (presencia de aire en el espacio pleural con colapso pulmonar) por traumatismo torácico.</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 48,
    "pageNumber": "48",
    "images": [
      "images/img_pagina_48_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo del Hilio Oculto (Diagnóstico Diferencial)",
    "explanation": "<p>Sirve para diferenciar una <strong>cardiomegalia genuina</strong> de una <strong>masa en el mediastino anterior</strong>.</p><ul><li><strong>Cardiomegalia:</strong> El agrandamiento cardíaco desplaza lateralmente los vasos hiliares. Los hilios son vistos \"por fuera\" de la silueta cardíaca.</li><li><strong>Masa mediastínica anterior:</strong> La masa se superpone a los vasos hiliares sin desplazarlos, por lo que los vasos siguen siendo visibles a través de la masa (Signo del hilio oculto).</li></ul>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 49,
    "pageNumber": "49",
    "images": [
      "images/img_pagina_49_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Bronconeumonía (Signo de Árbol en Brote)",
    "explanation": "<p>📸 <strong>TC de tórax (ventana pulmonar):</strong></p><p>A nivel de la flecha se observa un patrón típico de **Árbol en Brote** (tree-in-bud), que representa la impactación mucoide o purulenta en los bronquiolos terminales con engrosamiento de sus paredes.</p><p>💡 <strong>Diagnóstico:</strong> Bronconeumonía infecciosa activa.</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Signo_Radiológico",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 50,
    "pageNumber": "50",
    "images": [
      "images/img_pagina_50_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo Cervicotorácico (Mediastino Anterior vs Posterior)",
    "explanation": "<p>Permite determinar si una masa del mediastino superior se localiza en el compartimento anterior o posterior.</p><ul><li><strong>Mediastino Anterior:</strong> La masa no sobrepasa el nivel de las clavículas (o sus bordes se desvanecen al entrar en contacto con las partes blandas del cuello).</li><li><strong>Mediastino Posterior:</strong> Si los contornos de la masa son visibles por encima de las clavículas, la masa es posterior, ya que está rodeada por el aire de los ápex pulmonares.</li></ul>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 51,
    "pageNumber": "51",
    "images": [
      "images/img_pagina_51_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumonía Redonda",
    "explanation": "<p>Redonda Rx tórax frente. Presencia de una densidad oval o redonda que presenta límites. Es más frecuente en la infancia (es dx diferencial con nódulo).</p>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 52,
    "pageNumber": "52",
    "images": [
      "images/img_pagina_52_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Prótesis Mamarias (Hallazgo Fisiológico)",
    "explanation": "<p>No es una placa patológica, sino que la paciente tiene prótesis.</p><p>Importante preguntar al realizar el exámen.</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 53,
    "pageNumber": "53",
    "images": [
      "images/img_pagina_53_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo del Aire Creciente (Aspergiloma)",
    "explanation": "<p>Se observa una colección semilunar de aire en la periferia que rodea una masa central redondeada de tejido necrótico o micetoma.</p><p>💡 <strong>Asociación:</strong> Característico de infections por **Aspergilosis Pulmonar Invasiva** en fase de recuperação, o un **Aspergiloma** (bola de hongos) dentro de una cavidad preexistente.</p><p>📸 <strong>Estudios:</strong></p><ul><li><strong>Izquierda (Radiografía):</strong> Muestra una radiopacidad redondeada con una medialuna radiolúcida superior.</li><li><strong>Derecha (TC):</strong> Muestra una cavidad aérea con un nódulo interno y el halo hipodenso aéreo semilunar.</li></ul>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 54,
    "pageNumber": "54",
    "images": [
      "images/img_pagina_54_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumonía (Bloque Neumónico)",
    "explanation": "<p>Rx tórax frente. Hay un BLOQUE NEUMÓNICO que indica consolidación (opacidad heterogénea) con broncograma aereo a nivel del Lóbulo Superior (en su segmento posterior).</p>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 55,
    "pageNumber": "55",
    "images": [
      "images/img_pagina_55_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de la Suelta de Globos (Metástasis Pulmonar)",
    "explanation": "<p>Presencia de múltiples nódulos y masas pulmonares bien definidos, redondeados, de distribución bilateral, aleatoria y de diferentes tamaños.</p><p>💡 <strong>Diagnóstico:</strong> Característico de **metástasis pulmonares por vía hematógena** (ej. coriocarcinoma, osteosarcoma, cáncer de tiroides, renal o de mama).</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 56,
    "pageNumber": "56",
    "images": [
      "images/img_pagina_56_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de Westermark (TEP)",
    "explanation": "<p>Área focal de hiperlucidez (oligoemia focal) en la periferia del pulmón, secundaria a la obstrucción de la arteria pulmonar por un tromboembolismo (TEP).</p><ul><li><strong>Rx de tórax:</strong> Se ve un área localizada más negra (radiolúcida) debido a la disminución del flujo vascular y de la sangre.</li><li><strong>TC de tórax:</strong> Se observa una zona de marcada hipodensidad del parénquima por hipoperfusión.</li></ul>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 57,
    "pageNumber": "57",
    "images": [
      "images/img_pagina_57_1.jpeg"
    ],
    "prompt": "¿Qué es el Signo de la Silueta Positivo?",
    "answer": "Signo de la Silueta Positivo",
    "explanation": "<p>Diagnóstico: Signo de la Silueta Positivo Opacidad pulmonar, radioopacidad intratorácica, que está en contacto anatómico con el borde cardíaco, la aorta o el diafragma, y borrará su contorno.</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 58,
    "pageNumber": "58",
    "images": [
      "images/img_pagina_58_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumonía Atípica",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Tc de tórax con ventana pulmonar, corte axial.</div><p>Patrón en vidrio esmerilado (opacidades heterogéneas en ambos campos pulmonares con predominio intersticio- alveolar).</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 59,
    "pageNumber": "59",
    "images": [
      "images/img_pagina_59_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Bullas Pulmonares",
    "explanation": "<p>Espacios aéreos mayores a 1 cm delimitados por una pared epitelizada extremadamente fina (menor a 1 mm) o incluso ausente.</p><p>💡 <strong>Diagnóstico Diferencial:</strong> Debe diferenciarse de quistes (paredes finas pero definidas, de 1-3 mm) y cavidades (paredes gruesas, mayores a 3 mm). Común en enfisema bulloso.</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 60,
    "pageNumber": "60",
    "images": [
      "images/img_pagina_60_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Atelectasia del Lóbulo Medio Derecho",
    "explanation": "<p>Se caracteriza por la pérdida de volumen del lóbulo medio derecho. En la radiografía de perfil se observa una opacidad triangular o de banda bien delimitada entre las cisuras menor y mayor.</p>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 61,
    "pageNumber": "61",
    "images": [
      "images/img_pagina_61_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo del Broncograma Aéreo",
    "explanation": "<p>Visualización de los bronquios llenos de aire (estructuras tubulares oscuras/radiolúcidas) dentro de una zona de pulmón consolidado y denso (blanco/radiopaco).</p><p>💡 <strong>Fisiopatología:</strong> Los alvéolos que rodean los bronquios están ocupados por líquido, sangre o pus (consolidación), haciendo contraste con el aire que aún circula en los bronquios.</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 62,
    "pageNumber": "62",
    "images": [
      "images/img_pagina_62_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Embolia Séptica",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC de tórax, ventana pulmonar, corte coronal.</div><p>Múltiples nódulos diseminados en ambos pulmones con CAVIDADES (halo hiperdenso y interior hipodenso) y nódulos sólidos (hiperdenso).</p>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 63,
    "pageNumber": "63",
    "images": [
      "images/img_pagina_63_1.jpeg"
    ],
    "prompt": "¿Qué patrón intersticial se observa en las imágenes?",
    "answer": "Patrón Intersticial Nodular",
    "explanation": "<p>Cual Patrón intersticial está representado en las imagenes abajo?</p><p>Patrón Nodular Se caracteriza por la presencia de múltiples nódulos (muy chiquititos), que son opacidades redondeadas y pequeñas, distribuidas en el pulmón.</p><div class=\"exp-causes\">⚠️ <strong>Causas comunes:</strong> Neumoconiosis, TBC miliar, sarcoidosis, histiocitosis, hongos.</div>",
    "tags": [
      "Neumología",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 64,
    "pageNumber": "64",
    "images": [
      "images/img_pagina_64_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Histiocitosis Pulmonar (Células de Langerhans)",
    "explanation": "<p>Más común en varones y está relacionada a hábito tabáquico, caracterizada por la presencia de múltiples imágenes quísticas de paredes finas con distribución a predominio en lóbulos superiores.</p><p>La linfangioleiomiomatosis es a predominio en mujeres y lóbulos inferiores.</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 65,
    "pageNumber": "65",
    "images": [
      "images/img_pagina_65_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo del Dedo de Guante (Impactación Mucosa)",
    "explanation": "<p>Representa bronquios dilatados (bronquiectasias de localización central) impactados por secreciones mucosas densas.</p><p>💡 <strong>Clínica:</strong> Típico de patologias como la **Aspergilosis Broncopulmonar Alérgica (ABPA)**, asma crónico, fibrosis quística o neoplasia obstructiva proximal.</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 66,
    "pageNumber": "66",
    "images": [
      "images/img_pagina_66_1.jpeg"
    ],
    "prompt": "¿Qué es el Signo de la Silueta Positivo?",
    "answer": "Signo de la Silueta Positivo",
    "explanation": "<p>Ocurre cuando dos estructuras de la **misma densidad radiológica** están en **contacto anatómico directo**, lo que produce el borramiento y pérdida de definición de sus bordes limítrofes.</p><p>💡 <strong>Importancia:</strong> Permite localizar la lesión. Por ejemplo, una neumonía que borra el borde derecho del corazón está en el Lóbulo Medio.</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 67,
    "pageNumber": "67",
    "images": [
      "images/img_pagina_67_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Derrame Pleural",
    "explanation": "<p>El derrame pleural es la acumulación anormal de líquido en el espacio pleural. Se presenta típicamente como una opacidad homogénea en las bases pulmonares con borramiento de los senos costofrénico y cardiofrénico (Signo del menisco o Línea de Damoiseau).</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 68,
    "pageNumber": "68",
    "images": [
      "images/img_pagina_68_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Nódulo Pulmonar Lobulado",
    "explanation": "<p>Nódulo pulmonar Tc con ventana pulmonar, se visualiza en pulmón bordes lobulados</p>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 69,
    "pageNumber": "69",
    "images": [
      "images/img_pagina_69_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Atelectasia del Lóbulo Superior Derecho",
    "explanation": "<p>Del lóbulo superior derecho Signo de Golden. Imagen en S invertida</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 70,
    "pageNumber": "70",
    "images": [
      "images/img_pagina_70_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Tumor Fantasma (Derrame Cisural)",
    "explanation": "<p>RX de tórax con Radiopacidad basal derecha de bordes definidos</p>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 71,
    "pageNumber": "71",
    "images": [
      "images/img_pagina_71_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Bronquiectasias (Anillo de Sello)",
    "explanation": "<p>Patrón intersticial, se puede observar un patrón de panal de abejas con signo de anillo de sello</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 72,
    "pageNumber": "72",
    "images": [
      "images/img_pagina_72_1.jpeg"
    ],
    "prompt": "¿Por qué se realiza la radiografía de tórax en bipedestación?",
    "answer": "Bipedestación en Radiografía de Tórax (Importancia)",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Porque se toma radiografia de tórax de un paciente parado?</div><p>Para ayudar en la visualización de líquido (derrame pleural por ejemplo) y aire (en neumotórax por otro ejemplo) Recuerde que el liquido se va a la base pulmonar y el aire sube al ápice</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Tomografía"
    ]
  },
  {
    "id": 73,
    "pageNumber": "73",
    "images": [
      "images/img_pagina_73_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Enfisema Pulmonar",
    "explanation": "<p>Pulmonar Rx de tórax frente y perfil, presentan signos semiológicos de la enfermedad obstructiva cronica con hiperinsuflación y tórax en tonel</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 74,
    "pageNumber": "74",
    "images": [
      "images/img_pagina_74_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Hamartoma Pulmonar",
    "explanation": "<p>TC ventana mediastínica, se ve una imagen nodular ubicada en la base izquierda que presenta áreas grasas en su interior</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 75,
    "pageNumber": "75",
    "images": [
      "images/img_pagina_75_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Broncograma Aéreo (Consolidación Parenquimatosa)",
    "explanation": "<p>TC ventana pulmonar broncograma aéreo En la consolidación parenquimatosa los bronquios se ven porque el aire de sus luces hace contraste con el pulmón opaco que los rodea. Se ve en neumonía, edema pulmonar, infarto pulmonar, linfoma pulmonar y adenocarcionoma bronquioloalveolar</p>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 76,
    "pageNumber": "76",
    "images": [
      "images/img_pagina_76_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumotórax (Colapso Pulmonar)",
    "explanation": "<p>Patrón intersticial en el lóbulo derecho se ve la presencia de aire en la cavidad pleural con posterior colapso pulmonar</p>",
    "tags": [
      "Neumología",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 77,
    "pageNumber": "77",
    "images": [
      "images/img_pagina_77_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Bullas Pulmonares",
    "explanation": "<p>Pulmonares TC ventana pulmonar, se observa un patrón intersticial y visualiza bullas en el lóbulo inferior derecho. Imágenes aéreas redondeadas mal delimitadas, pared muy fina</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 78,
    "pageNumber": "78",
    "images": [
      "images/img_pagina_78_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Caverna Tuberculosa",
    "explanation": "<p>Se ve en el lóbulo pulmonar derecho, en zona parahiliar un imagen redondeada con paredes gruesas y presencia de aire, indicativo de caverna tuberculosa</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 79,
    "pageNumber": "79",
    "images": [
      "images/img_pagina_79_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Patrón Intersticial",
    "explanation": "<p>Radiografía de tórax de frente que muestra un aumento difuso de la densidad pulmonar con opacidades lineales o reticulares, indicativo de afectación del espacio intersticial de soporte.</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 80,
    "pageNumber": "80",
    "images": [
      "images/img_pagina_80_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de la Vela (Timo Fisiológico)",
    "explanation": "<p>Como se llama el siguiente signo?</p><p>Opacidad triangular de tejido tímico que se proyecta hacia la derecha o izquierda y a veces ambas direcciones</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 81,
    "pageNumber": "81",
    "images": [
      "images/img_pagina_81_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo del Dedo de Guante (Impactación Mucosa)",
    "explanation": "<p>Aumento de radiopacidad por infecciones, lo que generan hipersecreción bronquial</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 82,
    "pageNumber": "82",
    "images": [
      "images/img_pagina_82_1.jpeg"
    ],
    "prompt": "¿Cuánto tiempo debe permanecer estable un nódulo pulmonar para considerarse benigno?",
    "answer": "2 años (24 meses) de estabilidad",
    "explanation": "<p>💡 <strong>Criterio de Estabilidad:</strong> Un nódulo pulmonar debe permanecer sin cambios de tamaño o características de forma estable durante un período de **2 años (24 meses)** en estudios comparativos de TC para ser clasificado como benigno.</p>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 83,
    "pageNumber": "83",
    "images": [
      "images/img_pagina_83_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo del Aire Creciente",
    "explanation": "<p>Nombre el siguiente signo:</p><p>Presente en abscesos pulmonares, neoplasias cavitadas, infecciones por TBC</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 84,
    "pageNumber": "84",
    "images": [
      "images/img_pagina_84_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo del Diafragma Continuo",
    "explanation": "<p>Nombre el siguiente signo:</p><p>Línea continua de hiperlucidez extendiéndose a lo largo de la línea media, por encima del diafragma</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 85,
    "pageNumber": "85",
    "images": [
      "images/img_pagina_85_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Tuberculosis (TBC) Miliar",
    "explanation": "<p>Consiste en una siembra hematógena de múltiples nódulos pequeños (de 1 a 3 mm, del tamaño de granos de mijo) distribuidos de forma uniforme y difusa en ambos campos pulmonares.</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 86,
    "pageNumber": "86",
    "images": [
      "images/img_pagina_86_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Tuberculosis (TBC) Postprimaria (Árbol en Brote)",
    "explanation": "<p>Diagnótico presuntivo:</p><p>Opacidades en Arbol en brote</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 87,
    "pageNumber": "87",
    "images": [
      "images/img_pagina_87_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumomediastino",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Tomografia computada</div>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 88,
    "pageNumber": "88",
    "images": [
      "images/img_pagina_88_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Líneas B de Kerley",
    "explanation": "<p>Engrosamiento del intesticio interlobulillar por la congestión de vasos pulmonares</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 89,
    "pageNumber": "89",
    "images": [
      "images/img_pagina_89_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Caverna Pulmonar (TBC)",
    "explanation": "<p>Extensa consolidación en el lobulo superior derecho, parcialmente cavitada, que asocia a pérdida de volumen de dicho lóbulo</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 90,
    "pageNumber": "90",
    "images": [
      "images/img_pagina_90_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Atelectasia Masiva",
    "explanation": "<p>Colapso completo de un pulmón entero. Se observa una opacidad homogénea de todo el hemitórax afectado, con marcada desviación del mediastino, la tráquea y el corazón hacia el lado de la lesión, y elevación del hemidiafragma.</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 91,
    "pageNumber": "91",
    "images": [
      "images/img_pagina_91_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumonía del Lóbulo Superior Derecho (LSD)",
    "explanation": "<p>De lobulo superior derecho Rx de tórax de frente con radiopacidad en el lóbulo superior derecho, con signo del broncograma aéreo. Indicativo de neumonia LSD</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 92,
    "pageNumber": "92",
    "images": [
      "images/img_pagina_92_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumomediastino",
    "explanation": "<p>Línea continua de hiperlucidez extendiéndose a lo largo de la línea media, por encima del diafragma. Signo del diafragma continuo, característico de neumomediastino.</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 93,
    "pageNumber": "93",
    "images": [
      "images/img_pagina_93_1.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Joroba de Hampton (TEP)",
    "explanation": "<p>En RX de tórax, presenta una imagen radiopaca. Se genera un pico en la zona de la pleura más cercana al diafragma, se puede observar en infarto pulmonar, neoplasia pulmonar y derrame</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 94,
    "pageNumber": "94",
    "images": [
      "images/img_pagina_94_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Atelectasia del Lóbulo Superior Izquierdo",
    "explanation": "<p>Se presenta como una opacidad homogénea en el hemitórax izquierdo que desplaza la cisura mayor hacia adelante y arriba, borrando el contorno cardíaco izquierdo (Signo de la silueta positivo) y con elevación del hilio ipsolateral.</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 95,
    "pageNumber": "95",
    "images": [
      "images/img_pagina_95_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Hamartoma Pulmonar (Calcificación en Popcorn)",
    "explanation": "<p>📸 <strong>TC de tórax (ventana mediastínica):</strong></p><p>Se observa una imagen nodular bien delimitada en la región parahiliar derecha que presenta áreas internas con densidad grasa y focos de calcificación en parches gruesos, conocidos como <strong>calcificaciones en popcorn (pochoclo)</strong>.</p><p>💡 <strong>Nota:</strong> Es el tumor benigno más común del pulmón.</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 96,
    "pageNumber": "96",
    "images": [
      "images/img_pagina_96_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Edema Agudo de Pulmón",
    "explanation": "<p>RX de tórax, se observa patrón intersticial con radioopacidad de bordes algodonosos bilaterales</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 97,
    "pageNumber": "97",
    "images": [
      "images/img_pagina_97_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Fibrosis Pulmonar",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Rx de tórax frente patrón intersticial</div>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 98,
    "pageNumber": "98",
    "images": [
      "images/img_pagina_98_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Granuloma Secuelar Calcificado",
    "explanation": "<p>Granuloma secuelar Se ve una imagen nodular, de etiologia secuelar, con calcificación difusa. En Tc, se recomienda visualizar la calcificación en ventana mediastino o ventana ósea</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 99,
    "pageNumber": "99",
    "images": [
      "images/img_pagina_99_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Tuberculosis (TBC) Miliar",
    "explanation": "<p>Tubercolosis miliar Patrón intersticial micronodular</p>",
    "tags": [
      "Neumología",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 100,
    "pageNumber": "100",
    "images": [
      "images/img_pagina_100_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Patología Pulmonar Intersticial Reticular",
    "explanation": "<p>Rx de tórax frente y perfil, hallazgos compatibles con patología intersticial reticular</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 101,
    "pageNumber": "101",
    "images": [
      "images/img_pagina_101_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Linfangioleiomiomatosis (LAM)",
    "explanation": "<p>TC de tórax en ventana pulmonar: se observan múltiples quistes de pared fina distribuidos de forma difusa y bilateral en el parénquima pulmonar. Afecta casi exclusivamente a mujeres en edad fértil y se asocia a neumotórax recurrentes.</p>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 102,
    "pageNumber": "102",
    "images": [
      "images/img_pagina_102_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Bronquiectasias",
    "explanation": "<p>S TC de ventana pulmonar Recordar: Las bronquiectasias son dilataciones patológicas irreversibles de vía aérea periférica.</p>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 103,
    "pageNumber": "103",
    "images": [
      "images/img_pagina_103_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Atelectasia del Lóbulo Medio Derecho",
    "explanation": "<p>En lóbulo medio derecho entre las cisuras.</p><div class=\"exp-obs\">💡 <strong>Nota:</strong> Una atelectasia pequeña de lóbulo medio ni siempre tiene tracción suficiente para desviar la tráquea.</div>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 104,
    "pageNumber": "104",
    "images": [
      "images/img_pagina_104_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Tromboembolismo Pulmonar (TEP)",
    "explanation": "<p>Signo de Fleischner, indicativo para TEP.</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 105,
    "pageNumber": "105",
    "images": [
      "images/img_pagina_105_1.jpeg",
      "images/img_pagina_105_2.jpeg"
    ],
    "prompt": "Nombre el siguiente signo radiológico:",
    "answer": "Signo de Westermark (TEP)",
    "explanation": "<p>Rx de tórax, presenta una menor visualización del parénquima pulmonar, indicativo de una oligoemia focal</p>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 106,
    "pageNumber": "106",
    "images": [
      "images/img_pagina_106_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Neumotórax a Tensión",
    "explanation": "<p>Neumotórax Rx tórax frente. Neumotorax a tensión, corrimiento del mediastino contralateral a la lesión</p>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 107,
    "pageNumber": "107",
    "images": [
      "images/img_pagina_107_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Empiema Pleural (Derrame Pleural)",
    "explanation": "<p>(derrame pleural) No es posible confirmar un empiema sin toracocentesis, pero es indicativo. Se observa una radiopacidad en la base del pulmón derecho</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 108,
    "pageNumber": "108",
    "images": [
      "images/img_pagina_108_1.jpeg"
    ],
    "prompt": "Identifique el hallazgo o diagnóstico presuntivo:",
    "answer": "Hamartoma Pulmonar",
    "explanation": "<p>Hemartoma pulmonar TC ventana mediastinica, se observa imagen nodular ubicada en la base izquierda que presenta áreas grasas en su interior.</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  }
];