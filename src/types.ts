export type ItemCategory = 'food' | 'medical'
export type ItemStatus = 'unknown' | 'safe' | 'allergic'

export interface TarkovItem {
  id: string
  name: string
  shortName: string
  category: ItemCategory
}

export type StatusMap = Record<string, ItemStatus>
