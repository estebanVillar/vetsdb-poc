"""Genera los papers ficticios en español usados por la POC (public/docs/demo-*.pdf)."""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

OUT = Path(__file__).resolve().parent.parent / "public" / "docs"

PAPERS = [
    {
        "file": "demo-ecoli-terneros-sevilla.pdf",
        "title": "Resistencias antimicrobianas en aislados de Escherichia coli de terneros con diarrea neonatal en explotaciones de Sevilla",
        "authors": "Diego Herrera Campos, Sergio Blanco Rey",
        "affiliation": "Colegio de Veterinarios de Sevilla (ficticio)",
        "date": "Marzo 2025",
        "abstract": (
            "La diarrea neonatal es la principal causa de mortalidad en terneros durante sus primeras semanas de vida. "
            "Este estudio describe el perfil de resistencia antimicrobiana de 164 aislados de Escherichia coli obtenidos de terneros "
            "con diarrea en 23 explotaciones de vacuno de la provincia de Sevilla entre 2023 y 2024. El 61 % de los aislados fue "
            "resistente a tres o más familias de antimicrobianos. Las resistencias más frecuentes se observaron frente a tetraciclinas, "
            "ampicilina y sulfamidas, mientras que la sensibilidad a gentamicina se mantuvo elevada. Los resultados refuerzan la "
            "necesidad de realizar antibiogramas antes de instaurar tratamientos y de revisar los protocolos de encalostrado."
        ),
        "keywords": "vacuno, terneros, diarrea neonatal, Escherichia coli, resistencia antimicrobiana, antibiograma",
        "sections": [
            ("1. Introducción", [
                "El uso prudente de antimicrobianos en producción animal es una prioridad dentro del enfoque One Health. En las explotaciones "
                "de vacuno, los terneros lactantes reciben con frecuencia tratamientos empíricos frente a cuadros digestivos, lo que favorece "
                "la selección de bacterias resistentes.",
                "Existen pocos datos recientes sobre la situación en las explotaciones del sur peninsular. El objetivo de este trabajo fue "
                "caracterizar el perfil de sensibilidad de E. coli en terneros con diarrea neonatal en la provincia de Sevilla.",
            ]),
            ("2. Material y métodos", [
                "Se tomaron muestras de heces de 164 terneros de entre 1 y 21 días de edad con diarrea clínica, procedentes de 23 explotaciones "
                "(14 de aptitud cárnica y 9 de aptitud láctea). Los aislados se identificaron mediante pruebas bioquímicas estándar y se "
                "evaluó su sensibilidad a 12 antimicrobianos mediante difusión en disco siguiendo criterios CLSI.",
                "Se consideró multirresistente todo aislado resistente a tres o más familias de antimicrobianos. Se recogieron además datos "
                "sobre el manejo del calostro y los tratamientos previos mediante un cuestionario al ganadero.",
            ]),
            ("3. Resultados", [
                "El 61 % de los aislados (100/164) fue multirresistente. Las explotaciones que administraban tratamientos preventivos "
                "sistemáticos presentaron una proporción de multirresistencia significativamente mayor (72 % frente a 44 %).",
            ]),
        ],
        "table": {
            "caption": "Tabla 1. Porcentaje de aislados resistentes por antimicrobiano (n = 164)",
            "header": ["Antimicrobiano", "Resistentes (%)", "Sensibles (%)"],
            "rows": [["Tetraciclina", "78", "22"], ["Ampicilina", "71", "29"], ["Sulfamida-trimetoprim", "58", "42"],
                     ["Enrofloxacino", "34", "66"], ["Florfenicol", "29", "71"], ["Gentamicina", "9", "91"]],
        },
        "after_table": [
            ("4. Discusión", [
                "Los niveles de resistencia observados son similares a los descritos en otras regiones europeas con producción intensiva. "
                "La asociación con los tratamientos preventivos sugiere que la reducción del uso metafiláctico podría tener un impacto "
                "directo en la sensibilidad de las cepas circulantes.",
                "La elevada sensibilidad a gentamicina no justifica su uso como primera elección, dado su perfil de toxicidad y su "
                "importancia en medicina humana.",
            ]),
            ("5. Conclusiones", [
                "Se recomienda basar los tratamientos en antibiogramas, reforzar el encalostrado y limitar los tratamientos preventivos "
                "sistemáticos en terneros lactantes.",
            ]),
        ],
    },
    {
        "file": "demo-colico-equino.pdf",
        "title": "Protocolo de manejo del cólico equino en clínica ambulante: experiencia de 212 casos",
        "authors": "Pablo Navarro Sanz, Diego Herrera Campos",
        "affiliation": "Grupo de trabajo Équidos (ficticio)",
        "date": "Junio 2025",
        "abstract": (
            "El cólico es la urgencia más frecuente en la clínica equina ambulante. Presentamos un protocolo de valoración inicial "
            "aplicado a 212 caballos atendidos en campo entre 2022 y 2024. El protocolo combina frecuencia cardiaca, dolor, "
            "reflujo nasogástrico, hallazgos de palpación rectal y ecografía abdominal rápida para decidir entre tratamiento médico "
            "en campo o derivación hospitalaria. El 81 % de los casos se resolvió con tratamiento médico; la derivación precoz de los "
            "casos con criterios de gravedad se asoció a una mayor supervivencia quirúrgica."
        ),
        "keywords": "équidos, caballo, cólico, urgencias, clínica ambulante, ecografía abdominal",
        "sections": [
            ("1. Introducción", [
                "La decisión de derivar un caballo con cólico a un centro quirúrgico es crítica y a menudo debe tomarse en condiciones "
                "de campo, con recursos limitados. Un retraso en la derivación empeora el pronóstico de las lesiones estrangulantes.",
            ]),
            ("2. Material y métodos", [
                "Se revisaron retrospectivamente 212 casos de cólico atendidos por dos veterinarios ambulantes. Se registraron la "
                "frecuencia cardiaca, la escala de dolor, la presencia de reflujo, los hallazgos rectales y la ecografía abdominal "
                "abreviada (protocolo de 7 ventanas).",
                "Se consideró criterio de derivación la presencia de dos o más de los siguientes: frecuencia cardiaca superior a 60 lpm, "
                "dolor persistente tras analgesia, reflujo superior a 2 litros o asas de intestino delgado distendidas y amotiles.",
            ]),
            ("3. Resultados", [
                "De los 212 casos, 172 (81 %) se resolvieron en campo. Se derivaron 40 caballos, de los cuales 26 requirieron cirugía. "
                "La supervivencia al alta de los casos quirúrgicos derivados en menos de 4 horas fue del 77 %, frente al 45 % en los "
                "derivados más tarde.",
            ]),
        ],
        "table": {
            "caption": "Tabla 1. Resultado de los casos según el destino",
            "header": ["Destino", "Casos", "Supervivencia (%)"],
            "rows": [["Tratamiento médico en campo", "172", "98"], ["Derivación, tratamiento médico", "14", "93"],
                     ["Derivación, cirugía < 4 h", "13", "77"], ["Derivación, cirugía > 4 h", "13", "45"]],
        },
        "after_table": [
            ("4. Discusión y conclusiones", [
                "Un protocolo sencillo y reproducible en campo permite identificar con rapidez los casos que se benefician de la "
                "derivación. La ecografía abdominal abreviada resultó especialmente útil para detectar lesiones de intestino delgado.",
            ]),
        ],
    },
    {
        "file": "demo-obesidad-felina.pdf",
        "title": "Obesidad felina: prevalencia y factores de riesgo en clínicas del área metropolitana de Barcelona",
        "authors": "Marta Soler i Puig",
        "affiliation": "Col·legi de Veterinaris de Barcelona (ficticio)",
        "date": "Abril 2025",
        "abstract": (
            "Se evaluó la condición corporal de 1.032 gatos atendidos en 18 clínicas del área metropolitana de Barcelona. "
            "La prevalencia de sobrepeso u obesidad fue del 44 %. La esterilización, la vida exclusivamente en interior, la "
            "alimentación ad libitum y una edad de entre 5 y 10 años se asociaron de forma independiente a un mayor riesgo. "
            "Solo el 23 % de los propietarios de gatos obesos percibía correctamente la condición corporal de su animal."
        ),
        "keywords": "gato, felino, obesidad, condición corporal, nutrición, esterilización",
        "sections": [
            ("1. Introducción", [
                "La obesidad es la enfermedad nutricional más frecuente en gatos y se asocia a diabetes mellitus, enfermedad articular "
                "y lipidosis hepática. Conocer los factores de riesgo locales permite diseñar campañas preventivas más eficaces.",
            ]),
            ("2. Material y métodos", [
                "Estudio transversal durante 2024. Se valoró la condición corporal en escala de 9 puntos y los propietarios "
                "completaron un cuestionario sobre alimentación, actividad y percepción del peso de su gato.",
            ]),
            ("3. Resultados", [
                "El 31 % de los gatos presentó sobrepeso y el 13 % obesidad. La percepción del propietario fue el factor más "
                "discordante con la valoración clínica.",
            ]),
        ],
        "table": {
            "caption": "Tabla 1. Factores de riesgo asociados a sobrepeso u obesidad (análisis multivariante)",
            "header": ["Factor", "Odds ratio", "IC 95 %"],
            "rows": [["Esterilizado", "2,4", "1,7 - 3,3"], ["Vida solo en interior", "1,9", "1,4 - 2,6"],
                     ["Alimentación ad libitum", "2,1", "1,5 - 2,9"], ["Edad 5-10 años", "1,6", "1,2 - 2,2"]],
        },
        "after_table": [
            ("4. Conclusiones", [
                "La obesidad felina es muy prevalente y está infravalorada por los propietarios. Se recomienda incluir la valoración "
                "de la condición corporal en todas las consultas y pautar raciones medidas tras la esterilización.",
            ]),
        ],
    },
    {
        "file": "demo-dirofilariosis-huelva.pdf",
        "title": "Dirofilariosis canina en la costa de Huelva: estudio serológico 2023-2024",
        "authors": "Javier Morales Peña",
        "affiliation": "Colegio de Veterinarios de Huelva (ficticio)",
        "date": "Enero 2025",
        "abstract": (
            "Dirofilaria immitis es un nematodo transmitido por mosquitos cuya distribución se está ampliando en la península "
            "ibérica. Se analizaron 486 perros de 12 clínicas de la costa onubense mediante un test rápido de antígeno. La "
            "seroprevalencia global fue del 7,4 %, con valores superiores en perros que vivían cerca de marismas y humedales "
            "(12,1 %). Solo el 38 % de los perros recibía profilaxis durante todo el año."
        ),
        "keywords": "perro, canino, dirofilariosis, Dirofilaria immitis, mosquitos, enfermedades vectoriales, Huelva",
        "sections": [
            ("1. Introducción", [
                "Las enfermedades transmitidas por vectores son un problema creciente en perros del sur de España, favorecidas por "
                "temperaturas suaves y la presencia de humedales. La dirofilariosis cardiopulmonar tiene además potencial zoonótico.",
            ]),
            ("2. Material y métodos", [
                "Se incluyeron perros mayores de 1 año sin diagnóstico previo, atendidos entre abril de 2023 y septiembre de 2024. "
                "Se registró la distancia del domicilio a zonas húmedas, el estilo de vida y la profilaxis antiparasitaria.",
            ]),
            ("3. Resultados", [
                "Se detectaron 36 perros positivos (7,4 %). Los perros que pasaban la noche en el exterior presentaron el doble de "
                "riesgo. La profilaxis continua se asoció a una reducción marcada de la seroprevalencia.",
            ]),
        ],
        "table": {
            "caption": "Tabla 1. Seroprevalencia según distancia a zonas húmedas",
            "header": ["Distancia", "Perros", "Positivos (%)"],
            "rows": [["< 2 km", "173", "12,1"], ["2 - 10 km", "201", "5,5"], ["> 10 km", "112", "3,6"]],
        },
        "after_table": [
            ("4. Conclusiones", [
                "La dirofilariosis es endémica en la costa de Huelva. Se recomienda la profilaxis durante todo el año y el cribado "
                "anual, especialmente en perros que viven cerca de marismas. Estos datos complementan los estudios en curso sobre "
                "otras enfermedades vectoriales como la leishmaniosis.",
            ]),
        ],
    },
    {
        "file": "demo-transporte-ovino.pdf",
        "title": "Bienestar animal en el transporte de ganado ovino: indicadores prácticos para la inspección en destino",
        "authors": "Sergio Blanco Rey",
        "affiliation": "Colegio de Veterinarios de Sevilla (ficticio)",
        "date": "Noviembre 2024",
        "abstract": (
            "Se propone una lista de ocho indicadores basados en el animal para valorar el bienestar del ganado ovino a la llegada "
            "al matadero o a la explotación de destino. La lista se aplicó a 96 camiones (8.450 animales). Los indicadores con "
            "mayor capacidad para detectar problemas fueron las cojeras, los animales caídos y el jadeo. El tiempo medio de "
            "inspección fue de 11 minutos por camión."
        ),
        "keywords": "ovino, oveja, bienestar animal, transporte, inspección, matadero",
        "sections": [
            ("1. Introducción", [
                "La normativa europea sobre protección de los animales durante el transporte exige inspecciones, pero los indicadores "
                "utilizados varían mucho entre servicios veterinarios. Se necesitan herramientas rápidas y objetivas.",
            ]),
            ("2. Material y métodos", [
                "Se diseñó una lista de indicadores observables desde la rampa de descarga y se validó en 96 camiones en dos mataderos. "
                "Se registró la duración del viaje, la temperatura exterior y la densidad de carga.",
            ]),
            ("3. Resultados y discusión", [
                "La densidad de carga elevada y las temperaturas superiores a 30 °C se asociaron a un aumento del jadeo y de los animales "
                "caídos. La lista resultó aplicable sin retrasar la descarga.",
            ]),
        ],
        "table": {
            "caption": "Tabla 1. Frecuencia de hallazgos por indicador (96 camiones)",
            "header": ["Indicador", "Camiones con hallazgo (%)"],
            "rows": [["Cojeras", "34"], ["Jadeo", "27"], ["Animales caídos", "15"], ["Heridas visibles", "12"],
                     ["Suciedad severa", "9"]],
        },
        "after_table": [
            ("4. Conclusiones", [
                "Una inspección estructurada basada en el animal es viable en la práctica y permite comparar resultados entre "
                "transportistas y épocas del año.",
            ]),
        ],
    },
    {
        "file": "demo-telemedicina-rural.pdf",
        "title": "Telemedicina en clínicas veterinarias rurales: encuesta a 140 profesionales",
        "authors": "Lucía Fernández Gil",
        "affiliation": "Colegio de Veterinarios de Madrid (ficticio)",
        "date": "Mayo 2025",
        "abstract": (
            "Se encuestó a 140 veterinarios de clínicas rurales sobre el uso de la telemedicina. El 64 % la utilizaba para "
            "seguimientos postoperatorios y consultas de revisión, y el 22 % para triaje de urgencias. Las principales barreras "
            "fueron la falta de un marco normativo claro, la conectividad y la dificultad para cobrar las teleconsultas."
        ),
        "keywords": "telemedicina, teleconsulta, clínica rural, gestión veterinaria, encuesta",
        "sections": [
            ("1. Introducción", [
                "La telemedicina puede mejorar el acceso a la atención veterinaria en zonas rurales con baja densidad de clínicas, "
                "pero su adopción es desigual y su regulación todavía está en desarrollo.",
            ]),
            ("2. Material y métodos", [
                "Encuesta en línea distribuida entre colegiados de clínicas situadas en municipios de menos de 10.000 habitantes. "
                "Se recogieron datos de uso, herramientas, barreras y percepción de utilidad.",
            ]),
            ("3. Resultados", [
                "La videollamada y la mensajería con fotografías fueron las herramientas más utilizadas. El 71 % consideró útil la "
                "telemedicina para evitar desplazamientos innecesarios de animales y propietarios.",
            ]),
        ],
        "table": {
            "caption": "Tabla 1. Usos declarados de la telemedicina (respuesta múltiple)",
            "header": ["Uso", "Profesionales (%)"],
            "rows": [["Seguimiento postoperatorio", "64"], ["Revisión de tratamientos crónicos", "51"],
                     ["Triaje de urgencias", "22"], ["Asesoramiento en explotaciones", "19"]],
        },
        "after_table": [
            ("4. Conclusiones", [
                "La telemedicina ya forma parte de la práctica rural. Un marco profesional claro facilitaría su uso seguro y su "
                "reconocimiento económico.",
            ]),
        ],
    },
    {
        "file": "demo-sdma-renal-felino.pdf",
        "title": "Detección precoz de enfermedad renal crónica en gatos mediante SDMA: estudio en 318 pacientes",
        "authors": "Lucía Fernández Gil",
        "affiliation": "Colegio de Veterinarios de Madrid (ficticio)",
        "date": "Septiembre 2026",
        "abstract": (
            "La enfermedad renal crónica (ERC) es frecuente en gatos geriátricos y suele diagnosticarse en fases avanzadas. Se "
            "analizaron 318 gatos mayores de 7 años sin diagnóstico previo, midiendo creatinina y SDMA. El SDMA identificó "
            "alteraciones compatibles con ERC en estadio temprano en 41 gatos (12,9 %) con creatinina dentro del intervalo de "
            "referencia. Se propone incluir el SDMA en los chequeos geriátricos anuales."
        ),
        "keywords": "gato, felino, enfermedad renal crónica, SDMA, creatinina, medicina geriátrica, riñón",
        "sections": [
            ("1. Introducción", [
                "La creatinina sérica aumenta cuando se ha perdido una parte importante de la función renal. La dimetilarginina "
                "simétrica (SDMA) se eleva antes y se ve menos influida por la masa muscular, algo relevante en gatos mayores.",
            ]),
            ("2. Material y métodos", [
                "Estudio prospectivo en tres clínicas entre 2025 y 2026. Se midieron creatinina, SDMA, densidad urinaria y presión "
                "arterial. Los casos con SDMA elevado se revaluaron a las 4 semanas.",
            ]),
            ("3. Resultados", [
                "La elevación persistente de SDMA con creatinina normal se confirmó en 41 gatos. A los 12 meses, el 44 % de ellos "
                "había progresado a estadio 2 de la clasificación IRIS.",
            ]),
        ],
        "table": {
            "caption": "Tabla 1. Clasificación de los pacientes según creatinina y SDMA",
            "header": ["Grupo", "Gatos", "%"],
            "rows": [["Ambos normales", "236", "74,2"], ["SDMA elevado, creatinina normal", "41", "12,9"],
                     ["Ambos elevados", "35", "11,0"], ["Solo creatinina elevada", "6", "1,9"]],
        },
        "after_table": [
            ("4. Conclusiones", [
                "El SDMA permite detectar la ERC felina antes que la creatinina y adelantar medidas dietéticas y de seguimiento.",
            ]),
        ],
    },
    {
        "file": "demo-salmonelosis-avicola.pdf",
        "title": "Brote de salmonelosis en una granja avícola de puesta: investigación epidemiológica y medidas de control",
        "authors": "Sergio Blanco Rey",
        "affiliation": "Colegio de Veterinarios de Sevilla (ficticio)",
        "date": "Agosto 2026",
        "abstract": (
            "Se describe la investigación de un brote de Salmonella Enteritidis en una granja de gallinas ponedoras con 42.000 aves, "
            "detectado en un control oficial rutinario. La investigación identificó como origen probable una partida de pienso "
            "contaminada y deficiencias en el control de roedores. Las medidas de limpieza, desinfección y desratización permitieron "
            "obtener resultados negativos en tres muestreos consecutivos."
        ),
        "keywords": "aves, avícola, gallinas ponedoras, Salmonella, seguridad alimentaria, zoonosis, bioseguridad",
        "sections": [
            ("1. Introducción", [
                "Salmonella Enteritidis es una de las principales causas de toxiinfección alimentaria asociada al consumo de huevos. "
                "Los programas nacionales de control exigen muestreos periódicos en las explotaciones de puesta.",
            ]),
            ("2. Investigación del brote", [
                "Tras el resultado positivo se realizaron muestreos ambientales en naves, pienso, agua y roedores capturados. Se "
                "revisaron los registros de entrada de pienso y los protocolos de bioseguridad.",
            ]),
            ("3. Resultados", [
                "Se aisló S. Enteritidis en polvo de las naves, en una muestra de pienso y en dos roedores. El perfil de los aislados "
                "fue coincidente, lo que apoya un origen común.",
            ]),
        ],
        "table": {
            "caption": "Tabla 1. Resultados de los muestreos ambientales",
            "header": ["Tipo de muestra", "Muestras", "Positivas"],
            "rows": [["Polvo de nave", "24", "7"], ["Pienso", "6", "1"], ["Agua", "6", "0"], ["Roedores", "9", "2"]],
        },
        "after_table": [
            ("4. Conclusiones", [
                "El control de roedores y la trazabilidad del pienso son puntos críticos de bioseguridad en explotaciones de puesta.",
            ]),
        ],
    },
]


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("t", parent=base["Title"], fontSize=16, leading=20, spaceAfter=8),
        "meta": ParagraphStyle("m", parent=base["Normal"], fontSize=9.5, textColor=colors.HexColor("#444444"), alignment=1),
        "h": ParagraphStyle("h", parent=base["Heading2"], fontSize=12, spaceBefore=10, spaceAfter=4,
                            textColor=colors.HexColor("#0f5132")),
        "body": ParagraphStyle("b", parent=base["Normal"], fontSize=10, leading=14, alignment=TA_JUSTIFY, spaceAfter=6),
        "abstract": ParagraphStyle("a", parent=base["Normal"], fontSize=9.5, leading=13, alignment=TA_JUSTIFY,
                                   leftIndent=12, rightIndent=12, spaceAfter=6),
        "caption": ParagraphStyle("c", parent=base["Normal"], fontSize=9, textColor=colors.HexColor("#333333"),
                                  spaceBefore=6, spaceAfter=4),
        "note": ParagraphStyle("n", parent=base["Normal"], fontSize=8.5, textColor=colors.HexColor("#8a1c1c"),
                               spaceBefore=14),
    }


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(colors.HexColor("#8a1c1c"))
    canvas.drawString(2 * cm, A4[1] - 1.2 * cm, "DOCUMENTO FICTICIO - DEMO vetsDB - datos inventados")
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, f"Página {doc.page}")
    canvas.restoreState()


def build(paper, st):
    story = [
        Paragraph(paper["title"], st["title"]),
        Paragraph(f"<b>{paper['authors']}</b>", st["meta"]),
        Paragraph(f"{paper['affiliation']} · {paper['date']}", st["meta"]),
        Spacer(1, 10),
        Paragraph("Resumen", st["h"]),
        Paragraph(paper["abstract"], st["abstract"]),
        Paragraph(f"<b>Palabras clave:</b> {paper['keywords']}", st["abstract"]),
    ]
    for heading, paras in paper["sections"]:
        story.append(Paragraph(heading, st["h"]))
        story.extend(Paragraph(p, st["body"]) for p in paras)
    t = paper["table"]
    story.append(Paragraph(t["caption"], st["caption"]))
    table = Table([t["header"]] + t["rows"], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#d1e7dd")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#999999")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(table)
    for heading, paras in paper["after_table"]:
        story.append(Paragraph(heading, st["h"]))
        story.extend(Paragraph(p, st["body"]) for p in paras)
    story.append(Paragraph(
        "Nota: documento ficticio generado para la demostración de vetsDB. Autores, centros, datos y resultados son "
        "inventados y no deben utilizarse con fines clínicos ni científicos.", st["note"]))
    doc = SimpleDocTemplate(str(OUT / paper["file"]), pagesize=A4, title=paper["title"], author=paper["authors"],
                            leftMargin=2 * cm, rightMargin=2 * cm, topMargin=2 * cm, bottomMargin=2 * cm)
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    st = styles()
    for p in PAPERS:
        build(p, st)
        print("OK", p["file"])
