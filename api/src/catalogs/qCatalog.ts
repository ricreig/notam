import { CatalogCategory, CatalogElement } from '../types';

type RawCategoryItem = {
  bc: string;
  nombre: string;
};

type RawCategoryGroup = {
  grupo: string;
  categoria: string;
  nombre: string;
  alcance: string;
  items: RawCategoryItem[];
  cuarta_quinta_tipicas?: string[];
};

type RawCatalog = {
  meta: {
    origen: string;
    alcance: string;
    estructura_q: {
      formato: string;
      posiciones: Record<string, string>;
    };
  };
  codigos_alcance: Record<string, string>;
  codigos_transito: Record<string, string>;
  codigos_objetivo: Record<string, string>;
  sufijos_limites_servicio: Record<string, string>;
  catalogo_cuarta_quinta: { code: string; desc: string }[];
  categorias: RawCategoryGroup[];
};

const rawCatalog: RawCatalog = {
  meta: {
    origen: 'Manual Código NOTAM MCN-Rev.2, vigencia junio 2020',
    alcance: 'Tablas para clasificar NOTAM por código Q',
    estructura_q: {
      formato: 'Q/abcdef/gh/ijk/lmnop',
      posiciones: {
        a: 'Ámbito: A=ALCANCE Aeródromo/ASM local, E=En-ruta, W=Avisos navegación',
        bc: 'Categoría: letras 2.ª y 3.ª',
        de: 'Estado/acción: letras 4.ª y 5.ª',
        g: 'Tránsito: I,V,N,B,O,M',
        h: 'Objetivo: N,O,M',
        ijk: 'Altitud inferior',
        lmnop: 'Altitud superior y/o lat-long radio cuando aplique',
      },
    },
  },
  codigos_alcance: {
    A: 'Aeródromo/local',
    E: 'En-ruta',
    W: 'Avisos navegación',
  },
  codigos_transito: {
    I: 'IFR',
    V: 'VFR',
    N: 'No indicado',
    B: 'IFR y VFR',
    O: 'Importancia operacional',
    M: 'Importancia técnica',
  },
  codigos_objetivo: {
    N: 'No indicado',
    O: 'Importancia operacional',
    M: 'Importancia técnica',
  },
  sufijos_limites_servicio: {
    L: 'Límite inferior',
    F: 'Límite superior',
    G: 'Límite general',
  },
  catalogo_cuarta_quinta: [
    { code: 'AG', desc: 'Operando pero solo comprobado en tierra; en espera de comprobación en vuelo' },
    { code: 'AH', desc: 'Horas de servicio ahora … (especificar)' },
    { code: 'AK', desc: 'Funcionamiento normal reanudado' },
    { code: 'AL', desc: 'Funcionando sujeto a limitaciones/condiciones previamente publicadas' },
    { code: 'AM', desc: 'Solo operaciones militares' },
    { code: 'AO', desc: 'Operacional' },
    { code: 'AP', desc: 'Disponible, requiere permiso previo' },
    { code: 'AR', desc: 'Disponible a solicitud' },
    { code: 'AS', desc: 'No utilizable' },
    { code: 'AU', desc: 'No disponible (especificar motivo si corresponde)' },
    { code: 'AW', desc: 'Totalmente retirado' },
    { code: 'CA', desc: 'En actividad' },
    { code: 'CC', desc: 'Completado' },
    { code: 'CD', desc: 'Cese de actividades' },
    { code: 'CF', desc: 'Frecuencia(s) cambiada(s) a …' },
    { code: 'CG', desc: 'Degradado a … (especificar)' },
    { code: 'CH', desc: 'Cambiado' },
    { code: 'CI', desc: 'Identificación / distintivo de llamada cambiado a …' },
    { code: 'CL', desc: 'Realineado' },
    { code: 'CM', desc: 'Desplazado' },
    { code: 'CN', desc: 'Cancelado' },
    { code: 'CS', desc: 'Instalado' },
    { code: 'CT', desc: 'En prueba, no usar' },
    { code: 'HV', desc: 'Trabajo terminado' },
    { code: 'HW', desc: 'Trabajos en progreso' },
    { code: 'LB', desc: 'Reservado para aeronaves locales' },
    { code: 'LC', desc: 'Cerrado' },
    { code: 'LI', desc: 'Cerrado a operaciones IFR' },
    { code: 'LN', desc: 'Cerrado a toda operación nocturna' },
    { code: 'LP', desc: 'Prohibido a … (especificar)' },
    { code: 'LT', desc: 'Limitado a … (especificar)' },
    { code: 'LV', desc: 'Cerrado a operaciones VFR' },
    { code: 'LW', desc: 'Tendrá lugar … (especificar)' },
    { code: 'LX', desc: 'Operable pero precaución por … (especificar)' },
    { code: 'TT', desc: 'Activar disparador (trigger)' },
    { code: 'XX', desc: 'Lenguaje claro' },
  ],
  categorias: [
    {
      grupo: 'ATM',
      categoria: 'A',
      nombre: 'Organización del espacio aéreo',
      alcance: 'A',
      items: [
        { bc: 'AA', nombre: 'Altitud mínima' },
        { bc: 'AC', nombre: 'Zona de control' },
        { bc: 'AF', nombre: 'Área con control A' },
        { bc: 'AL', nombre: 'Nivel de vuelo mínimo utilizable' },
        { bc: 'AN', nombre: 'Ruta RNAV' },
        { bc: 'AO', nombre: 'Otro' },
        { bc: 'AV', nombre: 'Área superior con servicio de asesoramiento (UDA)' },
        { bc: 'AZ', nombre: 'Zona de tránsito de aeródromo (ATZ)' },
      ],
    },
    {
      grupo: 'ATM',
      categoria: 'P',
      nombre: 'Procedimientos de tránsito aéreo',
      alcance: 'A o AE según procedimiento',
      items: [
        { bc: 'PA', nombre: 'Llegada normalizada por instrumentos (STAR)' },
        { bc: 'PB', nombre: 'Salida normalizada por instrumentos (SID)' },
        { bc: 'PF', nombre: 'Procedimiento de control de afluencia' },
        { bc: 'PK', nombre: 'Procedimiento de aproximación VFR' },
      ],
    },
    {
      grupo: 'ATM',
      categoria: 'S',
      nombre: 'Servicios ATS / VOLMET',
      alcance: 'A/E',
      items: [
        { bc: 'SB', nombre: 'Oficina de notificación ATS (ARO)' },
        { bc: 'SC', nombre: 'Centro de control de área (ACC)' },
        { bc: 'SE', nombre: 'Servicio de información de vuelo (FIS)' },
        { bc: 'SF', nombre: 'Servicio de información de vuelo de aeródromo (AFIS)' },
        { bc: 'SL', nombre: 'Centro de control de afluencia (FLOW CTL CENTRE)' },
        { bc: 'SO', nombre: 'Centro de control de área oceánica (OAC)' },
        { bc: 'SP', nombre: 'Servicio de control de aproximación (APP)' },
        { bc: 'SS', nombre: 'Estación de servicio de vuelo (FSS)' },
        { bc: 'ST', nombre: 'Torre de control de aeródromo (TWR)' },
        { bc: 'SU', nombre: 'Centro de control de área superior (UACC)' },
        { bc: 'SV', nombre: 'Radiodifusión VOLMET' },
        { bc: 'SY', nombre: 'Servicio de asesoramiento de área superior' },
      ],
    },
    {
      grupo: 'CNS',
      categoria: 'I',
      nombre: 'ILS/MLS',
      alcance: 'A',
      items: [
        { bc: 'IT', nombre: 'ILS Categoría II (especificar pista)' },
        { bc: 'II', nombre: 'Marcador interior (cuando aplique)' },
        { bc: 'IS', nombre: 'ILS Categoría I (cuando aplique)' },
      ],
    },
    {
      grupo: 'CNS',
      categoria: 'G',
      nombre: 'Sistemas GNSS',
      alcance: 'A/E',
      items: [
        { bc: 'GA', nombre: 'GNSS disponible' },
        { bc: 'GW', nombre: 'Advertencia GNSS' },
      ],
    },
    {
      grupo: 'CNS',
      categoria: 'N',
      nombre: 'Instalaciones y servicios de terminal y navegación en ruta',
      alcance: 'A/E',
      items: [{ bc: 'NS', nombre: 'Radio de aeródromo VHF' }],
    },
    {
      grupo: 'AGA',
      categoria: 'F',
      nombre: 'Instalaciones y servicios',
      alcance: 'A',
      items: [
        { bc: 'FB', nombre: 'Equipo medición eficacia de frenado' },
        { bc: 'FC', nombre: 'Servicios de extinción de incendios y salvamento' },
        { bc: 'FD', nombre: 'Equipo de extinción de incendios y salvamento' },
        { bc: 'FE', nombre: 'Escala, accesos, aseos, salas' },
        { bc: 'FF', nombre: 'Combustibles y aceites' },
        { bc: 'FG', nombre: 'Hangar' },
        { bc: 'FH', nombre: 'Hotel' },
        { bc: 'FI', nombre: 'Hielo, anticongelante y deshielo' },
        { bc: 'FJ', nombre: 'Chárter/Agente' },
        { bc: 'FL', nombre: 'Restaurante' },
        { bc: 'FM', nombre: 'Mantenimiento' },
        { bc: 'FO', nombre: 'Observatorio meteorológico' },
        { bc: 'FP', nombre: 'Plan de vuelo' },
        { bc: 'FS', nombre: 'Equipo de remoción de nieve' },
        { bc: 'FT', nombre: 'Tobogán, pasarela, buses' },
        { bc: 'FU', nombre: 'Aduana e inmigración' },
        { bc: 'FW', nombre: 'Agua' },
        { bc: 'FZ', nombre: 'Diversos' },
      ],
    },
    {
      grupo: 'AGA',
      categoria: 'M',
      nombre: 'Área de movimiento y aterrizaje',
      alcance: 'A',
      items: [
        { bc: 'MD', nombre: 'Distancias declaradas (especificar pista)' },
        { bc: 'MG', nombre: 'Sistema de guía de rodaje' },
        { bc: 'MR', nombre: 'Pista (Runway)' },
        { bc: 'MS', nombre: 'Zona de parada (especificar pista)' },
        { bc: 'MT', nombre: 'Umbral (especificar pista)' },
        { bc: 'MU', nombre: 'Apartadero de viraje de pista (especificar pista)' },
      ],
    },
    {
      grupo: 'W',
      categoria: 'W',
      nombre: 'Avisos para la navegación',
      alcance: 'W',
      items: [
        { bc: 'WA', nombre: 'Exhibición aérea' },
        { bc: 'WB', nombre: 'Vuelos acrobáticos' },
        { bc: 'WC', nombre: 'Globo cautivo o cometa' },
        { bc: 'WD', nombre: 'Demolición de explosivos' },
        { bc: 'WE', nombre: 'Ejercicios (especificar)' },
        { bc: 'WF', nombre: 'Reabastecimiento aéreo' },
        { bc: 'WG', nombre: 'Vuelo de planeadores' },
        { bc: 'WH', nombre: 'Detonaciones' },
        { bc: 'WJ', nombre: 'Remolque de banderolas/blancos' },
        { bc: 'WL', nombre: 'Ascenso de globo libre' },
        { bc: 'WM', nombre: 'Disparo de proyectiles / tiro / cohetes' },
        { bc: 'WP', nombre: 'Lanzamiento de paracaídas (PJE)' },
        { bc: 'WR', nombre: 'Materiales radiactivos o químicos tóxicos' },
        { bc: 'WS', nombre: 'Incendio o escape de gases' },
        { bc: 'WT', nombre: 'Movimiento masivo de aeronaves' },
        { bc: 'WU', nombre: 'Aeronaves no tripuladas' },
        { bc: 'WV', nombre: 'Vuelo en formación' },
        { bc: 'WW', nombre: 'Actividad volcánica importante' },
        { bc: 'WZ', nombre: 'Vuelo de modelos' },
      ],
      cuarta_quinta_tipicas: ['CC', 'CN', 'LW', 'TT', 'XX'],
    },
  ],
};

// Ajustes adicionales para cubrir códigos observados en los datos reales.
const oceanicGroup = rawCatalog.categorias.find(
  (item) => item.grupo === 'ATM' && item.categoria === 'P',
);
if (oceanicGroup && !oceanicGroup.items.some((item) => item.bc === 'OE')) {
  oceanicGroup.items.push({ bc: 'OE', nombre: 'Procedimientos oceánicos' });
}

const runwayGroup = rawCatalog.categorias.find(
  (item) => item.grupo === 'AGA' && item.categoria === 'M',
);
if (runwayGroup && !runwayGroup.items.some((item) => item.bc === 'MR')) {
  runwayGroup.items.push({ bc: 'MR', nombre: 'Pista (Runway)' });
}

const GROUP_COLORS: Record<string, string> = {
  ATM: '#0284C7',
  CNS: '#14B8A6',
  AGA: '#F97316',
  W: '#EF4444',
};

export const qScopeMap = rawCatalog.codigos_alcance;
export const qTrafficMap = rawCatalog.codigos_transito;
export const qPurposeMap = rawCatalog.codigos_objetivo;
export const qServiceLimitSuffixMap = rawCatalog.sufijos_limites_servicio;
export const qStateMap = new Map(rawCatalog.catalogo_cuarta_quinta.map((item) => [item.code, item.desc]));

const MATCHER_ALIASES: Record<string, string[]> = {
  'AGA-M-MR': ['RUNWAY', 'RWY', 'PISTA'],
  'AGA-M-MG': ['TAXIWAY', 'TWY'],
  'AGA-M-MT': ['THRESHOLD', 'THR'],
  'AGA-M-MS': ['STOPWAY', 'STOP AREA'],
  'AGA-F-FC': ['FIRE', 'RESCUE', 'FIREFIGHTING'],
  'AGA-F-FD': ['RESCUE EQUIPMENT'],
  'AGA-F-FF': ['FUEL'],
  'AGA-F-FI': ['DE-ICE', 'ANTICONGELANTE', 'DEICE'],
  'AGA-F-FM': ['MAINTENANCE'],
  'AGA-F-FP': ['FLIGHT PLAN'],
  'AGA-F-FS': ['SNOW REMOVAL'],
  'AGA-F-FU': ['CUSTOMS', 'IMMIGRATION'],
  'ATM-S-ST': ['TOWER', 'TWR', 'CONTROL TOWER'],
  'ATM-S-SP': ['APPROACH', 'APP'],
  'ATM-S-SC': ['ACC', 'CONTROL CENTER'],
  'ATM-S-SE': ['FIS'],
  'ATM-S-SB': ['ARO'],
  'ATM-S-SO': ['OCEANIC', 'OAC'],
  'ATM-P-OE': ['OCEANIC PROCEDURES'],
  'CNS-I-IS': ['ILS'],
  'CNS-I-II': ['INNER MARKER'],
  'CNS-I-IT': ['ILS CAT II'],
  'CNS-G-GA': ['GNSS', 'GPS'],
  'CNS-G-GW': ['GNSS WARNING'],
  'CNS-N-NS': ['RADIO', 'VHF'],
  'W-W-WU': ['UAS', 'DRONE'],
  'W-W-WW': ['VOLCANIC'],
  'W-W-WP': ['PARACHUTE'],
};

export interface QSubjectDefinition {
  code: string;
  label: string;
  categoryId: string;
  group: string;
  alcance: string;
}

const subjectDefinitions = new Map<string, QSubjectDefinition>();

export const categories: CatalogCategory[] = rawCatalog.categorias.map((group) => {
  const id = `${group.grupo}-${group.categoria}`;
  group.items.forEach((item) => {
    subjectDefinitions.set(item.bc, {
      code: item.bc,
      label: item.nombre,
      categoryId: id,
      group: group.grupo,
      alcance: group.alcance,
    });
  });
  return {
    id,
    label: `${group.grupo} · ${group.nombre}`,
    color: GROUP_COLORS[group.grupo] ?? '#6366F1',
    code: `${group.grupo}${group.categoria}`,
  };
});

export const elements: CatalogElement[] = rawCatalog.categorias.flatMap((group) => {
  const categoryId = `${group.grupo}-${group.categoria}`;
  return group.items.map((item) => ({
    id: `${categoryId}-${item.bc}`,
    categoryId,
    label: item.nombre,
    matchers: Array.from(
      new Set([
        item.bc,
        item.nombre,
        ...(MATCHER_ALIASES[`${categoryId}-${item.bc}`] ?? []),
      ]),
    ),
  }));
});

export function getSubjectDefinition(code: string): QSubjectDefinition | undefined {
  return subjectDefinitions.get(code);
}

export default rawCatalog;
