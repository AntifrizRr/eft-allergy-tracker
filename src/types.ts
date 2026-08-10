export type ItemCategory = 'food' | 'medical'
export type ItemStatus = 'unknown' | 'safe' | 'allergic'
export type AppLanguage = 'ru' | 'en'

export interface TarkovItem {
  id: string
  name: string
  shortName: string
  nameRu: string
  shortNameRu: string
  category: ItemCategory
  types: string[]
  imageLink: string | null
}

export type StatusMap = Record<string, ItemStatus>
