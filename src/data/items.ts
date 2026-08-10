import type { TarkovItem } from '../types'

// Development fallback. `npm run sync:items` replaces this file with the live Tarkov.dev catalog.
export const catalogSyncedAt = 'fallback'
export const items: TarkovItem[] = [
  { id: 'demo-tushonka', name: 'Can of beef stew (Large)', shortName: 'Tushonka', nameRu: 'Большая банка тушеной говядины', shortNameRu: 'Тушенка', category: 'food', types: ['provisions'], imageLink: null },
  { id: 'demo-iskra', name: 'Iskra ration pack', shortName: 'Iskra', nameRu: 'Сухой паек «Искра»', shortNameRu: 'Искра', category: 'food', types: ['provisions'], imageLink: null },
  { id: 'demo-slickers', name: 'Slickers chocolate bar', shortName: 'Slickers', nameRu: 'Батончик Slickers', shortNameRu: 'Slickers', category: 'food', types: ['provisions'], imageLink: null },
  { id: 'demo-salewa', name: 'Salewa first aid kit', shortName: 'Salewa', nameRu: 'Аптечка Salewa', shortNameRu: 'Salewa', category: 'medical', types: ['meds'], imageLink: null },
  { id: 'demo-analgin', name: 'Analgin painkillers', shortName: 'Analgin', nameRu: 'Анальгин', shortNameRu: 'Анальгин', category: 'medical', types: ['meds'], imageLink: null },
  { id: 'demo-propital', name: 'Propital regenerative stimulant injector', shortName: 'Propital', nameRu: 'Стимулятор регенерации Propital', shortNameRu: 'Propital', category: 'medical', types: ['injectors'], imageLink: null },
]
