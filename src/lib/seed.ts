import type {
  AccessGrant, AccessRequest, AuditEntry, Conversation, Group, Membership, Message, Notification, Paper,
  PaperEvent, Role, Topic, User,
} from './types'
import { canRead } from './permissions'

export interface DemoData {
  users: User[]
  groups: Group[]
  memberships: Membership[]
  topics: Topic[]
  papers: Paper[]
  requests: AccessRequest[]
  grants: AccessGrant[]
  conversations: Conversation[]
  messages: Message[]
  notifications: Notification[]
  events: PaperEvent[]
  audit: AuditEntry[]
}

const DAY = 86_400_000

function daysAgo(d: number, hour = 10): string {
  const date = new Date(Date.now() - d * DAY)
  date.setHours(hour, (d * 7) % 60, 0, 0)
  return date.toISOString()
}

function daysAhead(d: number): string {
  return new Date(Date.now() + d * DAY).toISOString()
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function slugEmail(first: string, last: string): string {
  const clean = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '')
  return `${clean(first)}.${clean(last.split(' ')[0])}@example.com`
}

function person(id: string, firstName: string, lastName: string, extra: Partial<User> = {}): User {
  return {
    id, firstName, lastName,
    email: slugEmail(firstName, lastName),
    isGlobalAdmin: false,
    showEmail: false,
    showPhone: false,
    followedTopics: [],
    createdAt: daysAgo(200),
    ...extra,
  }
}

const GROUPS: Group[] = [
  { id: 'g-huelva', name: 'Colegio de Veterinarios de Huelva', kind: 'colegio', description: 'Colegio provincial' },
  { id: 'g-sevilla', name: 'Colegio de Veterinarios de Sevilla', kind: 'colegio', description: 'Colegio provincial' },
  { id: 'g-madrid', name: 'Colegio de Veterinarios de Madrid', kind: 'colegio', description: 'Colegio provincial' },
  { id: 'g-barcelona', name: 'Col·legi de Veterinaris de Barcelona', kind: 'colegio', description: 'Colegio provincial' },
  { id: 'g-andalucia', name: 'Andalucía', kind: 'comunidad', description: 'Veterinarios de toda la comunidad autónoma' },
  { id: 'g-equidos', name: 'Grupo de trabajo Équidos', kind: 'trabajo', description: 'Clínica y medicina deportiva equina' },
  { id: 'g-zoonosis', name: 'Grupo de trabajo Zoonosis y One Health', kind: 'trabajo', description: 'Enfermedades compartidas y salud pública' },
]

const TOPICS: Topic[] = [
  { id: 't-pa-mi', category: 'Pequeños animales', name: 'Medicina interna' },
  { id: 't-pa-der', category: 'Pequeños animales', name: 'Dermatología' },
  { id: 't-pa-par', category: 'Pequeños animales', name: 'Parasitología y enfermedades vectoriales' },
  { id: 't-pa-nut', category: 'Pequeños animales', name: 'Nutrición' },
  { id: 't-pa-nef', category: 'Pequeños animales', name: 'Nefrología y urología' },
  { id: 't-eq-urg', category: 'Équidos', name: 'Urgencias y cólico' },
  { id: 't-eq-mi', category: 'Équidos', name: 'Medicina interna equina' },
  { id: 't-ru-san', category: 'Rumiantes', name: 'Sanidad del rebaño' },
  { id: 't-pr-bie', category: 'Producción animal', name: 'Bienestar animal' },
  { id: 't-av-san', category: 'Avicultura', name: 'Sanidad aviar' },
  { id: 't-sp-zoo', category: 'Salud pública', name: 'Zoonosis' },
  { id: 't-sp-seg', category: 'Salud pública', name: 'Seguridad alimentaria' },
  { id: 't-sp-ram', category: 'Salud pública', name: 'Resistencias antimicrobianas' },
  { id: 't-ge-pro', category: 'Gestión y profesión', name: 'Ejercicio profesional' },
]

const PERSONAS: User[] = [
  // Las 4 personas seleccionables en el selector "Ver como" (una por tipo de rol).
  person('u-laura', 'Laura', 'Martín Ortega', { isGlobalAdmin: true, persona: 'Admin global', showEmail: true }),
  person('u-carmen', 'Carmen', 'Ruiz Delgado', { persona: 'Admin local · Huelva', showEmail: true, collegiateNumber: '21-0457' }),
  person('u-lucia', 'Lucía', 'Fernández Gil', { persona: 'Writer · Madrid', collegiateNumber: '28-3121', followedTopics: ['t-pa-par', 't-pa-nef'] }),
  person('u-ana', 'Ana', 'Castillo Vega', { persona: 'Reader · Madrid', collegiateNumber: '28-4410' }),
  // Resto de usuarios con datos (autores, co-autores, solicitantes...) para dar contexto a la demo,
  // pero no aparecen en "Ver como": solo se puede encarnar a las 4 personas de arriba.
  person('u-javier', 'Javier', 'Morales Peña', { showEmail: true, showPhone: true, phone: '600 111 222', collegiateNumber: '21-0788', followedTopics: ['t-pa-par'] }),
  person('u-pablo', 'Pablo', 'Navarro Sanz', { showEmail: true, collegiateNumber: '28-1904' }),
  person('u-marta', 'Marta', 'Soler i Puig', { collegiateNumber: '08-2231', followedTopics: ['t-pa-nut'] }),
  person('u-nuria', 'Núria', 'Vidal Roca', { collegiateNumber: '08-1177' }),
  person('u-diego', 'Diego', 'Herrera Campos', { showEmail: true, collegiateNumber: '41-0966' }),
  person('u-sergio', 'Sergio', 'Blanco Rey', { collegiateNumber: '41-1410' }),
  person('u-irene', 'Irene', 'Prieto Molina', { collegiateNumber: '21-0999', createdAt: daysAgo(1) }),
  person('u-tomas', 'Tomás', 'Gallardo Ruiz', { collegiateNumber: '28-5020', createdAt: daysAgo(3) }),
]

const PERSONA_MEMBERSHIPS: [string, string, Role][] = [
  ['u-carmen', 'g-huelva', 'admin_local'], ['u-carmen', 'g-andalucia', 'writer'],
  ['u-javier', 'g-huelva', 'writer'], ['u-javier', 'g-andalucia', 'writer'], ['u-javier', 'g-zoonosis', 'writer'],
  ['u-lucia', 'g-madrid', 'writer'],
  ['u-pablo', 'g-madrid', 'admin_local'], ['u-pablo', 'g-equidos', 'writer'],
  ['u-marta', 'g-barcelona', 'writer'], ['u-marta', 'g-zoonosis', 'writer'],
  ['u-nuria', 'g-barcelona', 'admin_local'],
  ['u-diego', 'g-sevilla', 'writer'], ['u-diego', 'g-equidos', 'writer'], ['u-diego', 'g-andalucia', 'writer'],
  ['u-sergio', 'g-sevilla', 'writer'], ['u-sergio', 'g-andalucia', 'writer'],
  ['u-ana', 'g-madrid', 'reader'],
]

const FILLER_FIRST = ['Alberto', 'Beatriz', 'Carlos', 'Elena', 'Fernando', 'Gloria', 'Hugo', 'Inés', 'Jorge', 'Lorena', 'Manuel', 'Nerea', 'Óscar', 'Patricia', 'Raúl', 'Silvia', 'Teresa', 'Víctor']
const FILLER_LAST = ['García López', 'Sánchez Mora', 'Romero Díaz', 'Torres Vila', 'Ramos Gil', 'Iglesias Pardo', 'Serrano Cruz', 'Molina Rius', 'Ortiz Lara', 'Delgado Sáez', 'Castro Nieto', 'Vargas Peña']
const FILLER_GROUPS = ['g-huelva', 'g-sevilla', 'g-madrid', 'g-barcelona', 'g-madrid', 'g-sevilla']

const P = (p: Omit<Paper, 'createdAt' | 'updatedAt' | 'language' | 'visibleGroupIds' | 'versions'> & Partial<Paper>): Paper => ({
  language: 'es',
  visibleGroupIds: [],
  versions: [],
  createdAt: daysAgo(120),
  updatedAt: daysAgo(30),
  ...p,
})

// import.meta.env.BASE_URL ya termina en '/' (p. ej. '/' en local, '/vetsdb-poc/' en GitHub Pages).
const v1 = (file: string, d: number) => [{ version: 1, fileUrl: `${import.meta.env.BASE_URL}docs/${file}`, fileName: file, uploadedAt: daysAgo(d) }]

const PAPERS: Paper[] = [
  P({
    id: 'p-leish-huelva', title: 'Prevalencia de leishmaniosis canina en la provincia de Huelva y factores ambientales asociados',
    abstract: 'Estudio en curso sobre 600 perros de 20 clínicas de la provincia de Huelva. Se está midiendo la seroprevalencia de Leishmania infantum mediante ELISA cuantitativo y su relación con la cercanía a humedales, la altitud, el tipo de vivienda y el uso de repelentes frente a flebotomos. Buscamos clínicas colaboradoras en otras provincias para comparar resultados.',
    topicIds: ['t-pa-par', 't-sp-zoo'], keywords: ['leishmaniosis', 'Leishmania infantum', 'perro', 'flebotomos', 'serología', 'Huelva'],
    authorIds: ['u-javier'], ownerGroupId: 'g-huelva', status: 'en_curso', visibility: 'publica', allowDownload: true,
    estimatedDate: daysAhead(160), createdAt: daysAgo(45), updatedAt: daysAgo(6),
  }),
  P({
    id: 'p-collares', title: 'Eficacia de collares repelentes frente a flebotomos en perros de Andalucía',
    abstract: 'Ensayo de campo en curso que compara la incidencia de nuevas infecciones por Leishmania infantum en perros con collar de deltametrina frente a pipetas de permetrina durante dos temporadas de transmisión.',
    topicIds: ['t-pa-par'], keywords: ['flebotomos', 'repelentes', 'deltametrina', 'leishmaniosis', 'perro', 'prevención'],
    authorIds: ['u-carmen'], ownerGroupId: 'g-huelva', status: 'en_curso', visibility: 'grupos', visibleGroupIds: ['g-andalucia'],
    allowDownload: false, estimatedDate: daysAhead(300), createdAt: daysAgo(80),
  }),
  P({
    id: 'p-hiperlip', title: 'Hiperlipemia en caballos de pura raza española: prevalencia y factores asociados',
    abstract: 'Trabajo en curso sobre la prevalencia de hiperlipemia en caballos PRE con sobrepeso o en situación de balance energético negativo, y su relación con la resistencia a la insulina.',
    topicIds: ['t-eq-mi'], keywords: ['caballo', 'équidos', 'hiperlipemia', 'PRE', 'metabolismo'],
    authorIds: ['u-diego'], ownerGroupId: 'g-sevilla', status: 'en_curso', visibility: 'publica', allowDownload: true,
    estimatedDate: daysAhead(120), createdAt: daysAgo(60),
  }),
  P({
    id: 'p-colonias', title: 'Protocolos de vacunación y esterilización en colonias felinas urbanas controladas',
    abstract: 'Estudio en curso con ayuntamientos del área de Barcelona para evaluar la cobertura vacunal, la tasa de esterilización y el estado sanitario de gatos en colonias gestionadas mediante el método CER.',
    topicIds: ['t-pa-mi', 't-sp-zoo'], keywords: ['gato', 'colonias felinas', 'CER', 'vacunación', 'esterilización'],
    authorIds: ['u-marta'], ownerGroupId: 'g-barcelona', status: 'en_curso', visibility: 'publica', allowDownload: false,
    estimatedDate: daysAhead(210), createdAt: daysAgo(20),
  }),
  P({
    id: 'p-ecoli', title: 'Resistencias antimicrobianas en aislados de Escherichia coli de terneros con diarrea neonatal en explotaciones de Sevilla',
    abstract: 'Perfil de resistencia de 164 aislados de E. coli de terneros con diarrea en 23 explotaciones de vacuno. El 61 % fue multirresistente; las explotaciones con tratamientos preventivos sistemáticos presentaron más resistencias. Se recomienda basar los tratamientos en antibiogramas.',
    topicIds: ['t-ru-san', 't-sp-ram'], keywords: ['vacuno', 'terneros', 'diarrea neonatal', 'E. coli', 'antibiograma'],
    authorIds: ['u-diego', 'u-sergio'], ownerGroupId: 'g-sevilla', status: 'publicado', visibility: 'publica', allowDownload: true,
    versions: v1('demo-ecoli-terneros-sevilla.pdf', 200), publishedAt: daysAgo(190),
  }),
  P({
    id: 'p-colico', title: 'Protocolo de manejo del cólico equino en clínica ambulante: experiencia de 212 casos',
    abstract: 'Protocolo de valoración inicial en campo que combina frecuencia cardiaca, dolor, reflujo, palpación rectal y ecografía abdominal rápida para decidir entre tratamiento médico o derivación. La derivación precoz mejoró la supervivencia quirúrgica.',
    topicIds: ['t-eq-urg'], keywords: ['caballo', 'cólico', 'urgencias', 'clínica ambulante', 'ecografía'],
    authorIds: ['u-pablo', 'u-diego'], ownerGroupId: 'g-equidos', status: 'publicado', visibility: 'grupos', visibleGroupIds: ['g-equidos'],
    allowDownload: false, versions: v1('demo-colico-equino.pdf', 130), publishedAt: daysAgo(120),
  }),
  P({
    id: 'p-obesidad', title: 'Obesidad felina: prevalencia y factores de riesgo en clínicas del área metropolitana de Barcelona',
    abstract: 'Valoración de la condición corporal de 1.032 gatos en 18 clínicas. Prevalencia de sobrepeso u obesidad del 44 %; esterilización, vida en interior y alimentación ad libitum fueron factores de riesgo. Solo el 23 % de los propietarios percibía el problema.',
    topicIds: ['t-pa-nut'], keywords: ['gato', 'obesidad', 'condición corporal', 'nutrición', 'esterilización'],
    authorIds: ['u-marta'], ownerGroupId: 'g-barcelona', status: 'publicado', visibility: 'privada', allowDownload: false,
    versions: v1('demo-obesidad-felina.pdf', 160), publishedAt: daysAgo(150),
  }),
  P({
    id: 'p-diro', title: 'Dirofilariosis canina en la costa de Huelva: estudio serológico 2023-2024',
    abstract: 'Seroprevalencia de Dirofilaria immitis del 7,4 % en 486 perros de la costa onubense, con valores del 12,1 % cerca de marismas. Solo el 38 % de los perros recibía profilaxis todo el año.',
    topicIds: ['t-pa-par', 't-sp-zoo'], keywords: ['perro', 'dirofilariosis', 'mosquitos', 'enfermedades vectoriales', 'Huelva'],
    authorIds: ['u-javier'], ownerGroupId: 'g-huelva', status: 'publicado', visibility: 'grupos',
    visibleGroupIds: ['g-huelva', 'g-andalucia'], allowDownload: true, versions: v1('demo-dirofilariosis-huelva.pdf', 250), publishedAt: daysAgo(240),
  }),
  P({
    id: 'p-ovino', title: 'Bienestar animal en el transporte de ganado ovino: indicadores prácticos para la inspección en destino',
    abstract: 'Lista de ocho indicadores basados en el animal aplicada a 96 camiones. Cojeras, animales caídos y jadeo fueron los indicadores más útiles; inspección media de 11 minutos por camión.',
    topicIds: ['t-pr-bie'], keywords: ['ovino', 'bienestar animal', 'transporte', 'inspección', 'matadero'],
    authorIds: ['u-sergio'], ownerGroupId: 'g-sevilla', status: 'publicado', visibility: 'publica', allowDownload: false,
    versions: v1('demo-transporte-ovino.pdf', 320), publishedAt: daysAgo(300),
  }),
  P({
    id: 'p-tele', title: 'Telemedicina en clínicas veterinarias rurales: encuesta a 140 profesionales',
    abstract: 'El 64 % de los veterinarios rurales encuestados usa la telemedicina para seguimientos postoperatorios. Las barreras principales son el marco normativo, la conectividad y el cobro de las teleconsultas.',
    topicIds: ['t-ge-pro'], keywords: ['telemedicina', 'teleconsulta', 'clínica rural', 'encuesta'],
    authorIds: ['u-lucia'], ownerGroupId: 'g-madrid', status: 'publicado', visibility: 'publica', allowDownload: true,
    versions: v1('demo-telemedicina-rural.pdf', 110), publishedAt: daysAgo(100),
  }),
  P({
    id: 'p-leishvet', title: 'LeishVet guidelines for the practical management of canine leishmaniosis',
    abstract: 'Guías del grupo LeishVet para el manejo clínico de la leishmaniosis canina: diagnóstico, sistema de estadificación clínica en cuatro estadios, tratamiento, seguimiento, prevención y control. (Artículo en inglés, acceso abierto.)',
    language: 'en', topicIds: ['t-pa-par', 't-sp-zoo'], keywords: ['leishmaniosis', 'Leishmania infantum', 'dog', 'guidelines', 'staging', 'treatment'],
    authorIds: ['u-marta'], ownerGroupId: 'g-zoonosis', status: 'publicado', visibility: 'publica', allowDownload: true,
    versions: v1('ext-leishvet.pdf', 90), publishedAt: daysAgo(88),
    external: {
      authors: 'Solano-Gallego L, Miró G, Koutinas A, Cardoso L, Pennisi MG, Ferrer L, Bourdeau P, Oliva G, Baneth G',
      journal: 'Parasites & Vectors 2011, 4:86', doi: '10.1186/1756-3305-4-86', license: 'CC BY 2.0',
      url: 'https://doi.org/10.1186/1756-3305-4-86',
    },
  }),
  P({
    id: 'p-montoya', title: 'Latest trends in L. infantum infection in dogs in Spain, Part II: current clinical management and control according to a national survey of veterinary practitioners',
    abstract: 'Encuesta nacional a 295 clínicas veterinarias españolas sobre el manejo clínico de la leishmaniosis canina (signos clínicos, diagnóstico, tratamiento y prevención), comparada con una encuesta previa de 2005. (Artículo en inglés, acceso abierto.)',
    language: 'en', topicIds: ['t-pa-par'], keywords: ['leishmaniosis', 'Leishmania infantum', 'dogs', 'Spain', 'survey', 'treatment'],
    authorIds: ['u-pablo'], ownerGroupId: 'g-madrid', status: 'publicado', visibility: 'publica', allowDownload: true,
    versions: v1('ext-leish-spain-2.pdf', 70), publishedAt: daysAgo(68),
    external: {
      authors: 'Montoya A, Gálvez R, Checa R, Sarquis J, Plaza A, Barrera JP, Marino V, Miró G',
      journal: 'Parasites & Vectors 2020, 13:205', doi: '10.1186/s13071-020-04080-8', license: 'CC BY 4.0',
      url: 'https://doi.org/10.1186/s13071-020-04080-8',
    },
  }),
  P({
    id: 'p-diaz', title: 'Serological evaluation of selected vector-borne pathogens in owned dogs from northern Spain based on a multicenter study using a commercial test',
    abstract: 'Seroprevalencia de Leishmania infantum, Ehrlichia canis, Anaplasma spp., Dirofilaria immitis y Borrelia burgdorferi en 556 perros de 30 clínicas del norte de España. (Artículo en inglés, acceso abierto.)',
    language: 'en', topicIds: ['t-pa-par', 't-sp-zoo'], keywords: ['vector-borne', 'dogs', 'Leishmania', 'Dirofilaria', 'seroprevalence', 'Spain'],
    authorIds: ['u-marta'], ownerGroupId: 'g-barcelona', status: 'publicado', visibility: 'grupos', visibleGroupIds: ['g-barcelona', 'g-zoonosis'],
    allowDownload: false, versions: v1('ext-leish-north-spain.pdf', 60), publishedAt: daysAgo(58),
    external: {
      authors: 'Díaz-Regañón D, Roura X, Suárez ML, León M, Sainz Á',
      journal: 'Parasites & Vectors 2020, 13:301', doi: '10.1186/s13071-020-04172-5', license: 'CC BY 4.0',
      url: 'https://doi.org/10.1186/s13071-020-04172-5',
    },
  }),
  P({
    id: 'p-sdma', title: 'Detección precoz de enfermedad renal crónica en gatos mediante SDMA: estudio en 318 pacientes',
    abstract: 'En 318 gatos mayores de 7 años, el SDMA identificó ERC en estadio temprano en el 12,9 % de los pacientes con creatinina normal. Se propone incluir el SDMA en los chequeos geriátricos anuales.',
    topicIds: ['t-pa-nef'], keywords: ['gato', 'enfermedad renal crónica', 'SDMA', 'creatinina', 'geriatría'],
    authorIds: ['u-lucia'], ownerGroupId: 'g-madrid', status: 'en_revision', visibility: 'publica', allowDownload: true,
    versions: v1('demo-sdma-renal-felino.pdf', 2), createdAt: daysAgo(90), updatedAt: daysAgo(2),
  }),
  P({
    id: 'p-salmonela', title: 'Brote de salmonelosis en una granja avícola de puesta: investigación epidemiológica y medidas de control',
    abstract: 'Investigación de un brote de Salmonella Enteritidis en una granja de 42.000 gallinas ponedoras. Origen probable en pienso contaminado y control deficiente de roedores.',
    topicIds: ['t-av-san', 't-sp-seg', 't-sp-zoo'], keywords: ['aves', 'gallinas ponedoras', 'Salmonella', 'bioseguridad', 'seguridad alimentaria'],
    authorIds: ['u-sergio'], ownerGroupId: 'g-sevilla', status: 'en_revision', visibility: 'publica', allowDownload: false,
    versions: v1('demo-salmonelosis-avicola.pdf', 1), createdAt: daysAgo(40), updatedAt: daysAgo(1),
  }),
]

function buildFillers(): { users: User[]; memberships: [string, string, Role][] } {
  const users: User[] = []
  const memberships: [string, string, Role][] = []
  let i = 0
  for (const first of FILLER_FIRST) {
    for (let k = 0; k < 2; k++) {
      const last = FILLER_LAST[(i * 5 + k) % FILLER_LAST.length]
      const id = `u-f${i}`
      users.push(person(id, first, last, { createdAt: daysAgo(100 + i * 3), collegiateNumber: `${10 + (i % 40)}-${1000 + i * 37}` }))
      const g = FILLER_GROUPS[i % FILLER_GROUPS.length]
      memberships.push([id, g, i % 3 === 0 ? 'reader' : 'writer'])
      if (g === 'g-huelva' || g === 'g-sevilla') memberships.push([id, 'g-andalucia', 'writer'])
      if (i % 7 === 0) memberships.push([id, 'g-zoonosis', 'writer'])
      if (i % 9 === 0) memberships.push([id, 'g-equidos', 'writer'])
      i++
    }
  }
  return { users, memberships }
}

export function buildSeed(): DemoData {
  const fillers = buildFillers()
  const users = [...PERSONAS, ...fillers.users]
  let mIdx = 0
  const memberships: Membership[] = [...PERSONA_MEMBERSHIPS, ...fillers.memberships].map(([userId, groupId, role]) => ({
    id: `m-${mIdx++}`, userId, groupId, role, status: 'active', requestedAt: daysAgo(180), resolvedAt: daysAgo(179), resolvedBy: 'u-laura',
  }))
  memberships.push(
    { id: 'm-irene', userId: 'u-irene', groupId: 'g-huelva', role: 'writer', status: 'pending', requestedAt: daysAgo(1) },
    { id: 'm-tomas', userId: 'u-tomas', groupId: 'g-madrid', role: 'writer', status: 'pending', requestedAt: daysAgo(3) },
  )

  const requests: AccessRequest[] = [
    { id: 'r-1', paperId: 'p-obesidad', requesterId: 'u-lucia', status: 'pendiente', createdAt: daysAgo(2),
      message: 'Hola Marta, estoy preparando una charla sobre nutrición felina para el Colegio de Madrid y me gustaría consultar tus datos de prevalencia. Citaré el trabajo, por supuesto.' },
    { id: 'r-2', paperId: 'p-obesidad', requesterId: 'u-ana', status: 'pendiente', createdAt: daysAgo(5),
      message: 'Soy veterinaria recién colegiada y estoy cursando un máster en nutrición clínica. ¿Podría consultar el estudio?' },
    { id: 'r-3', paperId: 'p-colico', requesterId: 'u-sergio', status: 'aceptada', createdAt: daysAgo(22), resolvedAt: daysAgo(20), resolvedBy: 'u-pablo',
      message: 'Atiendo urgencias equinas en la sierra de Sevilla y me vendría muy bien vuestro protocolo.', responseMessage: 'Adelante, cualquier duda me dices.' },
    { id: 'r-4', paperId: 'p-obesidad', requesterId: 'u-diego', status: 'denegada', createdAt: daysAgo(32), resolvedAt: daysAgo(30), resolvedBy: 'u-marta',
      message: '¿Me dejas ver la metodología de la encuesta a propietarios?', responseMessage: 'Ahora mismo lo estoy ampliando; te aviso cuando publique la versión 2.' },
    { id: 'r-5', paperId: 'p-diro', requesterId: 'u-lucia', status: 'pendiente', createdAt: daysAgo(1),
      message: 'Estoy recopilando datos de enfermedades vectoriales en perros de distintas provincias. ¿Podría consultar vuestro estudio?' },
  ]

  const grants: AccessGrant[] = [
    { id: 'a-1', paperId: 'p-colico', userId: 'u-sergio', expiresAt: daysAhead(70), allowDownload: false, grantedBy: 'u-pablo', grantedAt: daysAgo(20), revoked: false },
  ]

  const conversations: Conversation[] = [
    { id: 'c-1', participantIds: ['u-pablo', 'u-diego'], paperId: 'p-colico', createdAt: daysAgo(15) },
    { id: 'c-2', participantIds: ['u-marta', 'u-diego'], requestId: 'r-4', paperId: 'p-obesidad', createdAt: daysAgo(30) },
    { id: 'c-3', participantIds: ['u-carmen', 'u-javier'], paperId: 'p-leish-huelva', createdAt: daysAgo(8) },
  ]
  const messages: Message[] = [
    { id: 'x-1', conversationId: 'c-1', senderId: 'u-pablo', text: 'Diego, ¿te parece que añadamos los casos de 2025 para una versión 2 del protocolo?', sentAt: daysAgo(15, 9) },
    { id: 'x-2', conversationId: 'c-1', senderId: 'u-diego', text: 'Sí, tengo 40 casos más. Te los paso esta semana.', sentAt: daysAgo(15, 12) },
    { id: 'x-3', conversationId: 'c-2', senderId: 'u-diego', text: 'Sin problema, Marta. Avísame cuando esté la versión 2.', sentAt: daysAgo(30, 16) },
    { id: 'x-4', conversationId: 'c-3', senderId: 'u-carmen', text: 'Javier, desde el colegio podemos ayudarte a difundir la búsqueda de clínicas colaboradoras.', sentAt: daysAgo(8, 11) },
    { id: 'x-5', conversationId: 'c-3', senderId: 'u-javier', text: '¡Genial! Me faltan clínicas de la sierra.', sentAt: daysAgo(8, 13) },
  ]

  const n = (id: string, userId: string, text: string, link: string, d: number, read = false): Notification =>
    ({ id, userId, text, link, createdAt: daysAgo(d), read })
  const notifications: Notification[] = [
    n('n-1', 'u-marta', 'Lucía Fernández ha solicitado acceso a «Obesidad felina…»', '/solicitudes', 2),
    n('n-2', 'u-marta', 'Ana Castillo ha solicitado acceso a «Obesidad felina…»', '/solicitudes', 5),
    n('n-3', 'u-javier', 'Lucía Fernández ha solicitado acceso a «Dirofilariosis canina en la costa de Huelva…»', '/solicitudes', 1),
    n('n-4', 'u-carmen', 'Lucía Fernández ha solicitado acceso a «Dirofilariosis canina en la costa de Huelva…»', '/solicitudes', 1),
    n('n-5', 'u-carmen', 'Irene Prieto solicita unirse a Colegio de Veterinarios de Huelva', '/admin', 1),
    n('n-6', 'u-pablo', 'Tomás Gallardo solicita unirse a Colegio de Veterinarios de Madrid', '/admin', 3),
    n('n-7', 'u-pablo', 'Nuevo paper pendiente de revisión: «Detección precoz de enfermedad renal crónica…»', '/revision', 2),
    n('n-8', 'u-lucia', 'Tu paper «Detección precoz de enfermedad renal crónica…» se está procesando: está en revisión y te avisaremos cuando se publique.', '/mis-papers', 2),
    n('n-9', 'u-laura', 'Nuevo paper pendiente de revisión: «Brote de salmonelosis…» (Sevilla no tiene admin local)', '/revision', 1),
    n('n-10', 'u-sergio', 'Tu paper «Brote de salmonelosis…» se está procesando: está en revisión.', '/mis-papers', 1),
    n('n-11', 'u-sergio', 'Pablo Navarro ha aceptado tu solicitud de acceso a «Protocolo de manejo del cólico equino…» (90 días)', '/papers/p-colico', 20, true),
  ]

  const audit: AuditEntry[] = [
    { id: 'l-1', actorId: 'u-laura', action: 'Grupo creado', detail: 'Grupo de trabajo Zoonosis y One Health', at: daysAgo(170) },
    { id: 'l-2', actorId: 'u-laura', action: 'Rol asignado', detail: 'Carmen Ruiz Delgado → Admin local en Colegio de Veterinarios de Huelva', at: daysAgo(160) },
    { id: 'l-3', actorId: 'u-pablo', action: 'Acceso concedido', detail: 'Sergio Blanco Rey → «Protocolo de manejo del cólico equino…» (90 días, sin descarga)', at: daysAgo(20) },
    { id: 'l-4', actorId: 'u-marta', action: 'Solicitud denegada', detail: 'Diego Herrera Campos → «Obesidad felina…»', at: daysAgo(30) },
  ]

  const base: DemoData = {
    users, groups: GROUPS, memberships, topics: TOPICS, papers: PAPERS, requests, grants,
    conversations, messages, notifications, events: [], audit,
  }
  base.events = buildEvents(base)
  return base
}

const POPULARITY: Record<string, number> = {
  'p-leishvet': 3, 'p-montoya': 2.2, 'p-ecoli': 1.6, 'p-diro': 1.1, 'p-tele': 1.2, 'p-ovino': 0.8,
  'p-colico': 0.7, 'p-obesidad': 0.2, 'p-diaz': 0.6,
}

function buildEvents(data: DemoData): PaperEvent[] {
  const rand = mulberry32(42)
  const events: PaperEvent[] = []
  for (const paper of data.papers) {
    if (paper.status !== 'publicado' || !paper.publishedAt) continue
    const pool = data.users.filter(u => !paper.authorIds.includes(u.id) && canRead(data, u.id, paper))
    if (pool.length === 0) continue
    const weight = POPULARITY[paper.id] ?? 0.5
    const ageDays = Math.min(89, Math.floor((Date.now() - Date.parse(paper.publishedAt)) / DAY))
    for (let d = ageDays; d >= 0; d--) {
      const recencyBoost = d > ageDays - 10 ? 1.8 : 1
      const count = Math.floor(rand() * weight * 2.4 * recencyBoost)
      for (let k = 0; k < count; k++) {
        const u = pool[Math.floor(rand() * pool.length)]
        const at = daysAgo(d, 8 + Math.floor(rand() * 12))
        events.push({ paperId: paper.id, userId: u.id, type: 'view', at })
        const grant = data.grants.find(g => g.paperId === paper.id && g.userId === u.id)
        const allowed = grant ? grant.allowDownload : paper.allowDownload
        if (allowed && rand() < 0.22) events.push({ paperId: paper.id, userId: u.id, type: 'download', at })
      }
    }
  }
  return events
}
