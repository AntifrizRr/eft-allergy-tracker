import { useEffect, useMemo, useState } from 'react'
import { items } from './data/items'
import { clearStatuses, loadStatuses, saveStatuses } from './storage'
import type { ItemCategory, ItemStatus, StatusMap } from './types'

type StatusFilter = 'all' | ItemStatus
type CategoryFilter = 'all' | ItemCategory

const STATUS_LABELS: Record<ItemStatus, string> = {
  unknown: 'Не проверено',
  safe: 'Безопасно',
  allergic: 'Аллергия',
}

function App() {
  const [statuses, setStatuses] = useState<StatusMap>(() => loadStatuses())
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  useEffect(() => {
    saveStatuses(statuses)
  }, [statuses])

  const stats = useMemo(() => {
    const allergic = items.filter((item) => statuses[item.id] === 'allergic').length
    const tested = items.filter((item) => {
      const status = statuses[item.id]
      return status === 'safe' || status === 'allergic'
    }).length

    return { allergic, tested }
  }, [statuses])

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return items
      .filter((item) => {
        const status = statuses[item.id] ?? 'unknown'
        const matchesQuery =
          !normalizedQuery ||
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.shortName.toLowerCase().includes(normalizedQuery)
        const matchesStatus = statusFilter === 'all' || status === statusFilter
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter

        return matchesQuery && matchesStatus && matchesCategory
      })
      .sort((a, b) => {
        const aStatus = statuses[a.id] ?? 'unknown'
        const bStatus = statuses[b.id] ?? 'unknown'
        if (aStatus === bStatus) return a.shortName.localeCompare(b.shortName)
        if (aStatus === 'unknown') return -1
        if (bStatus === 'unknown') return 1
        return a.shortName.localeCompare(b.shortName)
      })
  }, [categoryFilter, query, statusFilter, statuses])

  function setItemStatus(itemId: string, status: ItemStatus) {
    setStatuses((current) => ({ ...current, [itemId]: status }))
  }

  function resetProgress() {
    const confirmed = window.confirm('Сбросить все отмеченные предметы? Это действие нельзя отменить.')
    if (!confirmed) return

    clearStatuses()
    setStatuses({})
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">ESCAPE FROM TARKOV · SEASONAL</p>
          <h1>Allergy Tracker</h1>
          <p className="subtitle">Отмечай проверенные расходники прямо во время рейда.</p>
        </div>
        <button className="reset-button" type="button" onClick={resetProgress}>
          Сброс
        </button>
      </section>

      <section className="stats-grid" aria-label="Прогресс">
        <article className="stat-card danger">
          <span className="stat-label">Аллергены</span>
          <strong>{Math.min(stats.allergic, 3)} / 3</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Проверено</span>
          <strong>{stats.tested} / {items.length}</strong>
        </article>
      </section>

      {stats.allergic >= 3 && (
        <section className="complete-banner">
          <strong>Все 3 аллергена найдены.</strong>
          <span>Остальные предметы можно считать безопасными по исключению.</span>
        </section>
      )}

      <section className="controls">
        <label className="search-box">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти предмет…"
            autoComplete="off"
          />
        </label>

        <div className="filter-row" aria-label="Фильтр по статусу">
          {(['all', 'unknown', 'safe', 'allergic'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              className={statusFilter === filter ? 'filter active' : 'filter'}
              onClick={() => setStatusFilter(filter)}
            >
              {filter === 'all' ? 'Все' : STATUS_LABELS[filter]}
            </button>
          ))}
        </div>

        <div className="filter-row" aria-label="Фильтр по категории">
          {(['all', 'food', 'medical'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              className={categoryFilter === filter ? 'filter active' : 'filter'}
              onClick={() => setCategoryFilter(filter)}
            >
              {filter === 'all' ? 'Все типы' : filter === 'food' ? 'Еда' : 'Медицина'}
            </button>
          ))}
        </div>
      </section>

      <div className="demo-note">Сейчас используется демонстрационный каталог — полная синхронизация предметов будет следующим шагом.</div>

      <section className="item-list" aria-live="polite">
        {visibleItems.map((item) => {
          const status = statuses[item.id] ?? 'unknown'

          return (
            <article className={`item-card status-${status}`} key={item.id}>
              <div className="item-icon" aria-hidden="true">
                {item.category === 'food' ? '▣' : '✚'}
              </div>
              <div className="item-copy">
                <div className="item-heading">
                  <strong>{item.shortName}</strong>
                  <span>{item.category === 'food' ? 'Еда' : 'Медицина'}</span>
                </div>
                <p>{item.name}</p>
                <small>{STATUS_LABELS[status]}</small>
              </div>
              <div className="item-actions">
                <button
                  type="button"
                  className={status === 'safe' ? 'safe selected' : 'safe'}
                  onClick={() => setItemStatus(item.id, status === 'safe' ? 'unknown' : 'safe')}
                  aria-label={`Отметить ${item.shortName} как безопасный`}
                >
                  ✓
                </button>
                <button
                  type="button"
                  className={status === 'allergic' ? 'allergic selected' : 'allergic'}
                  onClick={() => setItemStatus(item.id, status === 'allergic' ? 'unknown' : 'allergic')}
                  aria-label={`Отметить аллергию на ${item.shortName}`}
                >
                  !
                </button>
              </div>
            </article>
          )
        })}

        {visibleItems.length === 0 && <p className="empty-state">Ничего не найдено.</p>}
      </section>
    </main>
  )
}

export default App
