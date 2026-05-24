// Banco de dados dos flashcards médicos
const FLASHCARD_DATA = [
  {
    "id": 2,
    "pageNumber": "2",
    "images": [
      "images/img_pagina_2_1.jpeg"
    ],
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signo de la Vela (Timo normal)",
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
    "prompt": "Nombre el signo:",
    "answer": "Signo de Fleischner",
    "explanation": "<p>Indicativo para TEP, es</p><p>un agrandamiento proximal de la arteria</p><p>pulmonar.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> Tomografia computada sin contraste</div>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Absceso pulmonar",
    "explanation": "<p>Signo del aire creciente.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana pulmonar</div><p>sin contraste</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Atelectasia de la lingula",
    "explanation": "<p>Opacidad homogénea que</p><p>compromete a la lingula, que si es</p><p>de gran tamaño, termina</p><p>sobresaliendo del borde cardíaco</p><p>izquierdo</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> Rx de torax de frente</div>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 6,
    "pageNumber": "6",
    "images": [
      "images/img_pagina_6_1.jpeg"
    ],
    "prompt": "Nombre el Signo:",
    "answer": "Signo de la S de Golden",
    "explanation": "<p>Atelectasia del lóbulo superior</p><p>derecho</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Hamartoma pulmonar",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC ventana mediastinica, se</div><p>observa imagen nodular ubicada</p><p>en situación parahiliar derecha</p><p>que presenta area cálcicas en su</p><p>interior (aspect pop corn)</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Metástasis pulmonar",
    "explanation": "<p>SUELTA DE GLOBOS.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana pulmonar con contraste</div>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Enfisema",
    "explanation": "<p>Bullas</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana pulmonar con</div><p>contraste</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Enfisema",
    "explanation": "<p>Bullas.</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Bronquiectasias",
    "explanation": "<p>Anillo de Sello.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana pulmonar con contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía"
    ]
  },
  {
    "id": 12,
    "pageNumber": "12",
    "images": [
      "images/img_pagina_12_1.jpeg"
    ],
    "prompt": "Cual Patrón se puede visualizar en las imágenes abajo?",
    "answer": "Patrón en vidrio esmerilado",
    "explanation": "<p>Se puede ver bien las</p><p>estructuras vasculares y</p><p>los bronquios, pero no</p><p>tengo nitidez.</p><div class=\"exp-dx\">🎯 <strong>Diagnóstico:</strong> Neumonia Atipica</div>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Linfangioleiomiomatosis",
    "explanation": "<p>El parénquima con patrón quístico, bilateral.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana pulmonar sin contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 14,
    "pageNumber": "14",
    "images": [
      "images/img_pagina_14_1.jpeg"
    ],
    "prompt": "Cual Patrón se visualiza en la TC abajo?",
    "answer": "Reticular o pañal de abejas",
    "explanation": "<p>Sugiere destrucción,</p><p>alteración masiva del</p><p>intersticio.</p><p>Se ve en pacientes con EPOC</p><p>avanzado.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana pulmonar con contraste</div>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "El siguiente patrón tiene mayor probabilidad de",
    "explanation": "<p>ser benigno o maligno?</p><p>Maligno</p><p>Espiculado.</p>",
    "tags": [
      "Neumología",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 16,
    "pageNumber": "16",
    "images": [
      "images/img_pagina_16_1.jpeg"
    ],
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumotórax izquierdo",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Rx torax frente</div>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Linfangitis",
    "explanation": "<p>Patrón intersticial lineal:</p><p>Engrosamiento intersticial de los</p><p>septos (tabiques intersticiales</p><p>engrosados), así que empiezo a ver</p><p>muchas líneas y eso llama Linfangitis</p><p>(producto de diseminación de un</p><p>cáncer, como el cáncer de mama y de</p><p>tubo digestivo). Lineas B Kerley</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana pulmonar sin contraste</div>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 18,
    "pageNumber": "18",
    "images": [
      "images/img_pagina_18_1.jpeg"
    ],
    "prompt": "Qué tipo de Patrón tumoral es?",
    "answer": "Patrón maligno",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> TAC ventana mediastínica sin</div><p>contraste</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Patrón pañal de abejas (fibrosis)",
    "explanation": "<p>Patrón intersticial reticular.</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Metastasis pulmonar",
    "explanation": "<p>Patrón nodular producto</p><p>de la metástasis lo cual</p><p>llamamos SUELTA DE</p><p>GLOBOS.</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Derrame pleural izquierdo",
    "explanation": "<p>linea de damoiseau</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumotórax derecho",
    "explanation": "",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Bronquiectasias",
    "explanation": "",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 24,
    "pageNumber": "24",
    "images": [
      "images/img_pagina_24_1.jpeg"
    ],
    "prompt": "Diagnóstico presuntivo:",
    "answer": "COVID-19",
    "explanation": "<p>El COVID 19 tiene ese</p><p>tipo de patrón con</p><p>estas opacidades en</p><p>vidrio esmerilado</p><p>periféricas y</p><p>subpleurales.</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Patrón intersticial reticular",
    "explanation": "<p>Fibrosis.</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumonía Atípica",
    "explanation": "<p>Por Legionella pneumophila.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC una afectación del espacio</div><p>aéreo de distribución</p><p>parcheada, bilateral y</p><p>asimétrica, en forma de</p><p>opacidades en vidrio</p><p>deslustrado, junto a</p><p>engrosamiento del intersticio</p><p>interlobulillar, conformando un</p><p>patrón en empedrado.</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Tuberculosis",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Cortes axiales de TC de tórax</div><p>en ventana de</p><p>pulmón. Consolidación</p><p>cavitada de localización</p><p>periférica en el LII con</p><p>afectación del parénquima</p><p>pulmonar adyacente en forma</p><p>de nódulos centrilobulillares y</p><p>opacidades en árbol en brote</p><p>(círculo rojo).</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Atelectasia de lóbulo superior derecho",
    "explanation": "<p>Produce una radioopacidad en</p><p>topografía del lóbulo superior</p><p>derecho,</p><p>que adquiere una morfología de</p><p>S invertida, también llamado</p><p>Signo de la “S de golden”.</p><p>Elevación del hemidiafragma e</p><p>hiliohomolateral.</p><p>Limite bien abrupto a nivel de</p><p>donde va a terminar la lesión.</p><p>La cisura esta un poco elevada.</p><p>Desviación de la tráquea hacia</p><p>el lado afectado. Aumento de la</p><p>radiolucidez de los pulmones</p><p>(insuflación).</p>",
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
    "prompt": "Cual Patrón intersticial está representado en las imagenes abajo?",
    "answer": "Patrón Reticular",
    "explanation": "<p>Se observan opacidades</p><p>lineales que forman</p><p>redes de encaje</p><p>con predominio en</p><p>zonas periféricas del</p><p>pulmón y leve</p><p>predilección a lóbulos</p><p>inferiores.</p><div class=\"exp-causes\">⚠️ <strong>Causas comuns:</strong> Fibrosis</div><p>pulmonar idiopática,</p><p>colagenopatías,</p><p>enfermedades</p><p>inhalatorias</p><p>(neumoconiosis).</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Absceso pulmonar",
    "explanation": "",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 31,
    "pageNumber": "31",
    "images": [
      "images/img_pagina_31_1.jpeg"
    ],
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Quiste pulmonar (TC de tórax)",
    "explanation": "<p>En la TC de tórax, um quiste se visualiza como un espacio de bordes bien definidos de tamaño variable con una pared de grosor fino.</p><p>💡 <strong>Nota:</strong> Es importante diferenciarlo de otras estructuras como cavidades (pared gruesa) o bullas (pared extremadamente delgada o ausente).</p>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signos radiológicos de Hiperinsuflación (Enfisema)",
    "explanation": "<p>Los principales hallazgos de hiperinsuflación pulmonar en la radiografía son:</p><ul><li>Tórax en tonel</li><li>Aplanamiento de las cúpulas diafragmáticas</li><li>Horizontalización de las costillas</li><li>Aumento de los espacios intercostales</li><li>Hiperclaridade pulmonar (atrapamiento de aire)</li></ul>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 33,
    "pageNumber": "33",
    "images": [
      "images/img_pagina_33_1.jpeg"
    ],
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumonía Atípica",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Tc de tórax, ventana pulmonar. Patrón intersticio-alveolar</div><p>donde se observan hiperdensidades heterogeneas difusas (por</p><p>parches que empiezan en la periferia hacia el centro) que</p><p>corresponde en</p><p>VIDRIO ESMERILADO.</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC axial y TC Sagital torax sin contraste</div>",
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
    "prompt": "Cual Patrón intersticial está representado en las imagenes abajo?",
    "answer": "Patrón Lineal",
    "explanation": "<p>Se caracteriza por la presencia de líneas delgadas y alargadas</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> en la radiografía o tomografía de tórax, que reflejan un</div><p>engrosamiento de los septos interlobulares o intersticiales.</p><div class=\"exp-causes\">⚠️ <strong>Causas comuns:</strong> Edema pulmonar, linfangitis carcinomatosa.</div>",
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
    "prompt": "Describir el Rx y la TC de tórax:",
    "answer": "Absceso pulmonar (Nivel hidroaéreo)",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Diagnóstico: Signo de la Silueta Negativo",
    "explanation": "<p>Opacidad mediastinal y paracardiaca izquierda de localización</p><p>posterior en el hemitórax izquierdo.</p><p>NO HAY BORRAMIENTO, las estructuras son de densidades</p><p>diferentes.</p>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Líneas B de Kerley",
    "explanation": "<p>Finas opacidades lineales periféricas visibles en las bases pulmonares en radiografías de tórax, características de edema agudo de pulmón (EAP) o congestión linfática.</p><p>💡 <strong>Patogenia:</strong> Representan el engrosamiento del intersticio interlobulillar por la congestión de los vasos pulmonares o acumulación de líquido en los septos.</p>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 38,
    "pageNumber": "38",
    "images": [
      "images/img_pagina_38_1.jpeg"
    ],
    "prompt": "Identifique o achado / diagnóstico:",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Lesión intrapleural",
    "explanation": "<p>Las lesiones intrapulmonares, por</p><p>el contrario, tienen bordes</p><p>imprecisos, con ángulos agudos</p><p>hacia la pleura. Es una lesión</p><p>redondeada de menor campo</p><p>pegada a la pleura parietal. El</p><p>espacio que existe entre la pleura</p><p>parietal y visceral es el espacio</p><p>intrapleural o cavidad pleural.</p><p>Ejemplo: Mesotelioma.</p>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signo de Fleischner (TEP)",
    "explanation": "<p>Agrandamiento de una arteria pulmonar proximal en la radiografía de tórax, generalmente secundario a un embolismo pulmonar agudo (TEP).</p><p>💡 <strong>Patogenia:</strong> La obstrucción embólica del vaso provoca una dilatación proximal refleja o mecánica debido al trombo impactado.</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumonía con Derrame pleural y zona de atelectasia a nivel",
    "explanation": "<p>de la cisura</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC tórax, ventana pulmonar. Hiperdensidad heterogénea con</div><p>broncograma aéreo (compatible</p><p>con neumonía). Hiperdensidad homogéneas a nivel periférico</p><p>con concavidad hacia arriba por el derrame pleural en pulmón</p><p>derecho. Hiperdensidad homogénea en forma triangular</p><p>compatible con atelectasia.</p>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signo de lesión Extrapulmonar (Signo de la Embarazada)",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Cavitación pulmonar",
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
    "prompt": "Cómo se observa el Signo del diafragma contínuo en el Rx tórax?",
    "answer": "Se observa una línea continua de hiperlucidez extendiéndose",
    "explanation": "<p>a lo largo de la línea media, por encima del diafragma</p><p>Característico de</p><p>NEUMOMEDIASTINO (presencia de</p><p>aire a nivel del mediastino)</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Caverna pulmonar",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> CAVERNA: Rx de tórax frente donde</div><p>se observan</p><p>en ambos campos pulmonares</p><p>varias lesiones radiolucentes con</p><p>halo radiopaco que corresponde</p><p>probablemente a MTS, embolia</p><p>séptica o TBC.</p>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signo de la Silueta Negativo",
    "explanation": "<p>Ocurre cuando duas estruturas de densidades diferentes ou em planos anatômicos diferentes (anterior/posterior) apresentam uma interface nítida e visível entre elas.</p><p>💡 <strong>Exemplo:</strong> Uma opacidade mediastinal posterior em contato aparente com o coração (que é anterior) não apaga o bordo cardíaco.</p><p>⚠️ <strong>Signo de la Silueta Positivo:</strong> Duas estruturas com a mesma densidade radiológica em contato direto apagam seus limites recíprocos.</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 47,
    "pageNumber": "47",
    "images": [
      "images/img_pagina_47_1.jpeg"
    ],
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Multiples fracturas costales y neumotórax",
    "explanation": "",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signo del hilio oculto",
    "explanation": "<p>Sirve para diferenciar una <strong>cardiomegalia genuina</strong> de una <strong>masa en el mediastino anterior</strong>.</p><ul><li><strong>Cardiomegalia:</strong> El agrandamiento cardíaco desplaza lateralmente los vasos hiliares. Os hilos são vistos \"por fora\" da silhueta cardíaca.</li><li><strong>Masa mediastínica anterior:</strong> La masa se superpone a los vasos hiliares sin desplazarlos, por lo que los vasos siguen siendo visibles a través de la masa (Signo del hilio oculto).</li></ul>",
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
    "prompt": "Describir que se ve en la TC de tórax abajo:",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signo Cervicotorácico",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumonía redonda",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Rx tórax frente. Presencia de una</div><p>densidad oval o redonda que</p><p>presenta límites. Es más frecuente</p><p>en la infancia (es dx diferencial con</p><p>nódulo).</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Prótesis mamária",
    "explanation": "<p>No es una placa</p><p>patológica, sino que la</p><p>paciente tiene prótesis.</p><p>Importante preguntar al</p><p>realizar el exámen.</p>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signo del aire creciente (Aspergiloma)",
    "explanation": "<p>Se observa una colección semilunar de aire en la periferia que rodea una masa central redondeada de tejido necrótico o micetoma.</p><p>💡 <strong>Asociación:</strong> Característico de infecciones por **Aspergilosis Pulmonar Invasiva** en fase de recuperación, o un **Aspergiloma** (bola de hongos) dentro de una cavidad preexistente.</p><p>📸 <strong>Estudios:</strong></p><ul><li><strong>Izquierda (Radiografía):</strong> Muestra una radiopacidad redondeada con una medialuna radiolúcida superior.</li><li><strong>Derecha (TC):</strong> Muestra una cavidad aérea con un nódulo interno y el halo hipodenso aéreo semilunar.</li></ul>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumonía",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Rx tórax frente. Hay un</div><p>BLOQUE NEUMÓNICO</p><p>que indica consolidación</p><p>(opacidad heterogénea)</p><p>con broncograma aereo a</p><p>nivel del Lóbulo Superior</p><p>(en su segmento</p><p>posterior).</p>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signo de la suelta de globos (Metástasis pulmonar)",
    "explanation": "<p>Presencia de múltiples nódulos y masas pulmonares bien definidos, redondeados, de distribución bilateral, aleatoria y de diferentes tamaños.</p><p>💡 <strong>Diagnóstico:</strong> Característico de **metástasis pulmonares por vía hematógena** (ej. coriocarcinoma, osteosarcoma, cáncer de tiroides, renal ou de mama).</p>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signo de Westermark (TEP)",
    "explanation": "<p>Área focal de hiperlucidez (oligoemia focal) en la periferia del pulmão, secundaria a la obstrucción de la arteria pulmonar por un tromboembolismo (TEP).</p><ul><li><strong>Rx de tórax:</strong> Se ve un área localizada más negra (radiolúcida) debido a la disminución del flujo vascular y de la sangre.</li><li><strong>TC de tórax:</strong> Se observa una zona de marcada hipodensidade del parénquima por hipoperfusión.</li></ul>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Diagnóstico: Signo de la Silueta Positivo",
    "explanation": "<p>Opacidad pulmonar, radioopacidad intratorácica, que está en</p><p>contacto anatómico con el borde cardíaco, la aorta o el</p><p>diafragma, y borrará su contorno.</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumonía Atípica",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Tc de tórax con ventana</div><p>pulmonar, corte axial.</p><p>Patrón en vidrio</p><p>esmerilado (opacidades</p><p>heterogéneas en ambos</p><p>campos pulmonares con</p><p>predominio intersticio-</p><p>alveolar).</p>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Bullas pulmonares",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Atelectasia lóbulo medio derecho",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> El Rx de perfil es de</div><p>gran utilidad para</p><p>identificarlo (se</p><p>observa entre las</p><p>cisuras).</p>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signo del broncograma aéreo",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Embolia séptica",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC de tórax, ventana</div><p>pulmonar, corte coronal.</p><p>Múltiples nódulos</p><p>diseminados en ambos</p><p>pulmones con CAVIDADES</p><p>(halo hiperdenso y interior</p><p>hipodenso) y nódulos</p><p>sólidos (hiperdenso).</p>",
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
    "prompt": "Cual Patrón intersticial está representado en las imagenes abajo?",
    "answer": "Patrón Nodular",
    "explanation": "<p>Se caracteriza por la</p><p>presencia de múltiples</p><p>nódulos (muy</p><p>chiquititos), que son</p><p>opacidades redondeadas</p><p>y pequeñas, distribuidas</p><p>en el pulmón.</p><div class=\"exp-causes\">⚠️ <strong>Causas comuns:</strong> Neumoconiosis,</div><p>TBC miliar, sarcoidosis,</p><p>histiocitosis, hongos.</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Histiocitosis pulmonar",
    "explanation": "<p>Más común en varones y está relacionada a hábito tabáquico,</p><p>caracterizada por la presencia de múltiples imágenes quísticas</p><p>de paredes finas con distribución a predominio en lóbulos</p><p>superiores.</p><p>La linfangioleiomiomatosis es a predominio en mujeres</p><p>y lóbulos inferiores.</p>",
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
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Signo del dedo de guante",
    "explanation": "<p>Representa bronquios dilatados (bronquiectasias de localización central) impactados por secreciones mucosas densas.</p><p>💡 <strong>Clínica:</strong> Típico de patologias como a **Aspergilosis Broncopulmonar Alérgica (ABPA)**, asma crónico, fibrosis quística o neoplasia obstructiva proximal.</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 66,
    "pageNumber": "66",
    "images": [
      "images/img_pagina_66_1.jpeg"
    ],
    "prompt": "Qué es el Signo de la Silueta POSITIVO?",
    "answer": "Borramiento de límites por contacto directo de estructuras de igual densidad",
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
    "prompt": "Rx tórax:",
    "answer": "Diagnóstico presuntivo:",
    "explanation": "<p>Derrame pleural</p>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 68,
    "pageNumber": "68",
    "images": [
      "images/img_pagina_68_1.jpeg"
    ],
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Nódulo pulmonar",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Tc con ventana</div><p>pulmonar, se</p><p>visualiza en pulmón</p><p>bordes lobulados</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Atelectasia del lóbulo superior derecho",
    "explanation": "<p>Signo de Golden. Imagen en S invertida</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Tumor fantasma",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> RX de tórax con</div><p>Radiopacidad basal derecha</p><p>de bordes definidos</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Bronquiectasia",
    "explanation": "<p>Patrón intersticial, se puede observar un patrón de panal de</p><p>abejas con signo de anillo de sello</p>",
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
    "prompt": "Porque se toma radiografia de tórax de un paciente parado?",
    "answer": "Para ayudar en la visualización de líquido (derrame pleural por",
    "explanation": "<p>ejemplo) y aire (en neumotórax por otro ejemplo)</p><p>Recuerde que el liquido se va a</p><p>la base pulmonar y el aire sube</p><p>al ápice</p>",
    "tags": [
      "Neumología",
      "Radiografía"
    ]
  },
  {
    "id": 73,
    "pageNumber": "73",
    "images": [
      "images/img_pagina_73_1.jpeg"
    ],
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Enfisema pulmonar",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Rx de tórax frente y perfil, presentan signos semiológicos de la</div><p>enfermedad obstructiva cronica con hiperinsuflación y tórax</p><p>en tonel</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Hamartoma pulmonar",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC ventana mediastínica, se ve una</div><p>imagen nodular ubicada en la base</p><p>izquierda que presenta áreas grasas</p><p>en su interior</p>",
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
    "prompt": "Descripción de la imagen:",
    "answer": "TC ventana pulmonar broncograma aéreo",
    "explanation": "<p>En la consolidación parenquimatosa los bronquios se ven</p><p>porque el aire de sus luces hace contraste con el pulmón</p><p>opaco que los rodea. Se ve en neumonía, edema pulmonar,</p><p>infarto pulmonar, linfoma pulmonar y adenocarcionoma</p><p>bronquioloalveolar</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumotórax",
    "explanation": "<p>Patrón intersticial en el lóbulo derecho se ve la presencia de</p><p>aire en la cavidad pleural con posterior colapso pulmonar</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Bullas pulmonares",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC ventana pulmonar, se observa un patrón intersticial y</div><p>visualiza bullas en el lóbulo inferior derecho. Imágenes aéreas</p><p>redondeadas mal delimitadas, pared muy fina</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Caverna tuberculosa",
    "explanation": "<p>Se ve en el lóbulo pulmonar derecho, en zona parahiliar un</p><p>imagen redondeada con paredes gruesas y presencia de aire,</p><p>indicativo de caverna tuberculosa</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Patrón intersticial",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Rx de tórax frente</div>",
    "tags": [
      "Neumología",
      "Radiografía",
      "Patrón_Intersticial"
    ]
  },
  {
    "id": 80,
    "pageNumber": "80",
    "images": [
      "images/img_pagina_80_1.jpeg"
    ],
    "prompt": "Como se llama el siguiente signo?",
    "answer": "Signo de la vela",
    "explanation": "<p>Opacidad triangular de tejido tímico que se proyecta hacia la</p><p>derecha o izquierda y a veces ambas direcciones</p>",
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
    "prompt": "Nombre el signo:",
    "answer": "Dedo de guante",
    "explanation": "<p>Aumento de radiopacidad por infecciones, lo que generan</p><p>hipersecreción bronquial</p>",
    "tags": [
      "Neumología",
      "Signo_Radiológico"
    ]
  },
  {
    "id": 82,
    "pageNumber": "82",
    "images": [
      "images/img_pagina_82_1.jpeg"
    ],
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "¿Cuánto tiempo debe mantenerse un nódulo estable para considerarse benigno?",
    "explanation": "<p>💡 <strong>Respuesta:</strong> Un nódulo pulmonar debe permanecer sin cambios de tamaño o características de forma estable durante un período de **2 años (24 meses)** en estudios comparativos de TC para ser clasificado como benigno.</p>",
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
    "prompt": "Nombre el siguiente signo:",
    "answer": "Signo del aire creciente",
    "explanation": "<p>Presente en abscesos pulmonares, neoplasias cavitadas,</p><p>infecciones por TBC</p>",
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
    "prompt": "Nombre el siguiente signo:",
    "answer": "Signo del diafragma continuo",
    "explanation": "<p>Línea continua de hiperlucidez extendiéndose a lo largo de la</p><p>línea media, por encima del diafragma</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "TBC miliar",
    "explanation": "",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "TBC postprimaria",
    "explanation": "<p>Opacidades en Arbol en brote</p>",
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
    "prompt": "Diagnóstico presuntivo:",
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
    "prompt": "Nombre el signo:",
    "answer": "Líneas B de kerley",
    "explanation": "<p>Engrosamiento del</p><p>intesticio interlobulillar por</p><p>la congestión de vasos</p><p>pulmonares</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Caverna pulmonar",
    "explanation": "<p>Extensa consolidación en el lobulo superior derecho,</p><p>parcialmente cavitada, que asocia a pérdida de volumen de</p><p>dicho lóbulo</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Atelectasia masiva",
    "explanation": "",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumonia de lobulo superior derecho",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Rx de tórax de frente con radiopacidad en el lóbulo superior</div><p>derecho, con signo del broncograma aéreo. Indicativo de</p><p>neumonia LSD</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumomediastino",
    "explanation": "<p>Línea continua de hiperlucidez extendiéndose a lo largo de la</p><p>línea media, por encima del diafragma. Signo del diafragma</p><p>continuo, característico de neumomediastino.</p>",
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
    "prompt": "Nombre el signo:",
    "answer": "Joroba de Hampton",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> En RX de tórax, presenta una imagen radiopaca. Se genera un</div><p>pico en la zona de la pleura más cercana al diafragma, se</p><p>puede observar en infarto pulmonar, neoplasia pulmonar y</p><p>derrame</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Atelectasia lobulo superior izquierdo",
    "explanation": "<p>Radiopacidad homogenea</p>",
    "tags": [
      "Neumología"
    ]
  },
  {
    "id": 95,
    "pageNumber": "95",
    "images": [
      "images/img_pagina_95_1.jpeg"
    ],
    "prompt": "Identifique o achado / diagnóstico:",
    "answer": "Hamartoma pulmonar (Calcificación en Popcorn)",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Edema de pulmón",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> RX de tórax, se observa patrón intersticial con radioopacidad</div><p>de bordes algodonosos bilaterales</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Fibrosis pulmonar",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Granuloma secuelar",
    "explanation": "<p>Se ve una imagen nodular, de etiologia secuelar, con</p><div class=\"exp-modality\">📸 <strong>Estudio:</strong> calcificación difusa. En Tc, se recomienda visualizar la</div><p>calcificación en ventana mediastino o ventana ósea</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Tubercolosis miliar",
    "explanation": "<p>Patrón intersticial micronodular</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Patología pulmonar intersticial RETICULAR",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Rx de tórax frente y perfil, hallazgos compatibles con</div><p>patología intersticial reticular</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Linfangioleiomiomatosis",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC de ventana pulmonar</div>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Bronquiectasias",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC de ventana pulmonar</div><p>Recordar: Las bronquiectasias son dilataciones patológicas</p><p>irreversibles de vía aérea periférica.</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Atelectasia",
    "explanation": "<p>En lóbulo medio derecho entre las cisuras.</p><div class=\"exp-obs\">💡 <strong>Nota:</strong> Una atelectasia pequeña de lóbulo medio ni siempre</div><p>tiene tracción suficiente para desviar la tráquea.</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "TEP",
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
    "prompt": "Nombre el signo:",
    "answer": "Signo de Westermark",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Rx de tórax, presenta una menor visualización del</div><p>parénquima pulmonar, indicativo de una oligoemia focal</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Neumotórax",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> Rx tórax frente. Neumotorax a tensión, corrimiento del</div><p>mediastino contralateral a la lesión</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Empiema pleural (derrame pleural)",
    "explanation": "<p>No es posible confirmar un empiema sin toracocentesis, pero</p><p>es indicativo. Se observa una radiopacidad en la base del</p><p>pulmón derecho</p>",
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
    "prompt": "Diagnóstico presuntivo:",
    "answer": "Hemartoma pulmonar",
    "explanation": "<div class=\"exp-modality\">📸 <strong>Estudio:</strong> TC ventana mediastinica, se observa imagen nodular ubicada</div><p>en la base izquierda que presenta áreas grasas en su interior.</p>",
    "tags": [
      "Neumología",
      "Tomografía",
      "Patrón_Intersticial"
    ]
  }
];