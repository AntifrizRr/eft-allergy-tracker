import type { TarkovItem } from '../types'

// Temporary demo catalog for the first UI scaffold.
// It will be replaced by a generated catalog synced from Tarkov.dev.
export const items: TarkovItem[] = [
  { id: 'demo-tushonka', name: 'Can of beef stew (Large)', shortName: 'Tushonka', category: 'food' },
  { id: 'demo-iskra', name: 'Iskra ration pack', shortName: 'Iskra', category: 'food' },
  { id: 'demo-slickers', name: 'Slickers chocolate bar', shortName: 'Slickers', category: 'food' },
  { id: 'demo-alyonka', name: 'Alyonka chocolate bar', shortName: 'Alyonka', category: 'food' },
  { id: 'demo-water', name: 'Water bottle with a filter', shortName: 'Water', category: 'food' },
  { id: 'demo-salewa', name: 'Salewa first aid kit', shortName: 'Salewa', category: 'medical' },
  { id: 'demo-afak', name: 'AFAK tactical individual first aid kit', shortName: 'AFAK', category: 'medical' },
  { id: 'demo-ifak', name: 'IFAK individual first aid kit', shortName: 'IFAK', category: 'medical' },
  { id: 'demo-analgin', name: 'Analgin painkillers', shortName: 'Analgin', category: 'medical' },
  { id: 'demo-propital', name: 'Propital regenerative stimulant injector', shortName: 'Propital', category: 'medical' },
  { id: 'demo-morphine', name: 'Morphine injector', shortName: 'Morphine', category: 'medical' },
  { id: 'demo-ai2', name: 'AI-2 medkit', shortName: 'AI-2', category: 'medical' }
]
