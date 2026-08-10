import type { StatusMap } from './types'

const STORAGE_KEY = 'eft-allergy-tracker:v1'

export function loadStatuses(): StatusMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    return parsed as StatusMap
  } catch {
    return {}
  }
}

export function saveStatuses(statuses: StatusMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
}

export function clearStatuses(): void {
  localStorage.removeItem(STORAGE_KEY)
}
