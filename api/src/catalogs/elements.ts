import { CatalogElement } from '../types';

export const elements: CatalogElement[] = [
  {
    id: 'runway',
    categoryId: 'movement-area',
    label: 'Runways',
    matchers: ['RWY', 'RUNWAY', 'PISTA'],
  },
  {
    id: 'taxiway',
    categoryId: 'movement-area',
    label: 'Taxiways',
    matchers: ['TWY', 'TAXIWAY'],
  },
  {
    id: 'approach',
    categoryId: 'procedures',
    label: 'Approaches',
    matchers: ['APCH', 'APPROACH', 'ILS'],
  },
  {
    id: 'lighting',
    categoryId: 'lighting',
    label: 'Lighting',
    matchers: ['LGT', 'LIGHT', 'PAPI', 'ALS', 'REDL'],
  },
  {
    id: 'services',
    categoryId: 'services',
    label: 'Aerodrome Services',
    matchers: ['FIRE', 'RESCUE', 'FUEL', 'ATS', 'MET'],
  },
  {
    id: 'airspace',
    categoryId: 'airspace-restrictions',
    label: 'Airspace',
    matchers: ['AIRSPACE', 'PROHIBITED', 'RESTRICTED', 'ADIZ'],
  },
  {
    id: 'navigation',
    categoryId: 'ils-mls',
    label: 'Navigation Aids',
    matchers: ['VOR', 'DME', 'NDB', 'ILS'],
  },
];
