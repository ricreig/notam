import { CatalogCategory } from '../types';
import { categories as qCategories } from './qCatalog';

export const categories: CatalogCategory[] = qCategories;

export const severityColorMap: Record<string, string> = {
  UNSERVICEABLE: '#EF4444',
  RESTRICTED: '#F59E0B',
  CAUTION: '#3B82F6',
  INFO: '#9CA3AF',
};
