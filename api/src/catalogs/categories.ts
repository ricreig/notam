import { CatalogCategory } from '../types';

export const categories: CatalogCategory[] = [
  {
    id: 'airspace-organization',
    label: 'Organización del Espacio Aéreo',
    color: '#5B21B6',
    code: 'ATM',
  },
  {
    id: 'communications-surveillance',
    label: 'Instalaciones de Comunicaciones y Radar',
    color: '#0EA5E9',
    code: 'CNS',
  },
  {
    id: 'services',
    label: 'Instalaciones y Servicios',
    color: '#14B8A6',
    code: 'SERV',
  },
  {
    id: 'ils-mls',
    label: 'Sistemas ILS / MLS',
    color: '#F97316',
    code: 'ILS',
  },
  {
    id: 'lighting',
    label: 'Instalaciones de Iluminación',
    color: '#F59E0B',
    code: 'LIGHT',
  },
  {
    id: 'movement-area',
    label: 'Área de Movimiento y Aterrizaje',
    color: '#EF4444',
    code: 'RWY',
  },
  {
    id: 'terminal-enroute',
    label: 'Servicios Terminal y En Ruta',
    color: '#3B82F6',
    code: 'TER',
  },
  {
    id: 'other-info',
    label: 'Otras Informaciones',
    color: '#9CA3AF',
    code: 'OTHER',
  },
  {
    id: 'procedures',
    label: 'Procedimientos de Tránsito Aéreo',
    color: '#10B981',
    code: 'PROC',
  },
  {
    id: 'airspace-restrictions',
    label: 'Avisos / Restricciones del Espacio Aéreo',
    color: '#F87171',
    code: 'AIRSPACE',
  },
  {
    id: 'ats-volmet',
    label: 'Servicios de Tránsito Aéreo y VOLMET',
    color: '#2563EB',
    code: 'ATS',
  },
  {
    id: 'warnings',
    label: 'Avisos',
    color: '#4B5563',
    code: 'WARN',
  },
];

export const severityColorMap: Record<string, string> = {
  UNSERVICEABLE: '#EF4444',
  RESTRICTED: '#F59E0B',
  CAUTION: '#3B82F6',
  INFO: '#9CA3AF',
};
