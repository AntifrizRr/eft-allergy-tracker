import { useEffect, useMemo, useState } from 'react'
import { catalogSyncedAt, items } from './data/items'
import { clearStatuses, loadStatuses, saveStatuses } from './storage'
import type { AppLanguage, ItemCategory, ItemStatus, StatusMap, TarkovItem } from './types'

type StatusFilter = 'all' | ItemStatus
type CategoryFilter = 'all' | ItemCategory

const LANGUAGE_KEY = 'eft-allergy-language'

const STATUS_LABELS: Record<AppLanguage, Record<ItemStatus, string>> = {
  ru: { unknown: 'Не проверено', safe: 'Безопасно', allergic: 'Аллергия' },
  en: { unknown: 'Untested', safe: 'Safe', allergic: 'Allergy' },
}

function itemText(item: TarkovItem, language: AppLanguage) {
  return language === 'ru'
    ? { shortName: item.shortNameRu || item.shortName, name: item.nameRu || item.name }
    : { shortName: item.shortName, name: item.name }
}

function ItemIcon({ item }: { item: TarkovItem }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="item-icon" aria-hidden="true">
      {item.imageLink && !failed ? (
        <img src={item.imageLink} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span>{item.category === 'food' ? '▣' : '✚'}</span>
      )}
    </div>
  )
}

function App() {
  const [statuses, setStatuses] = useState<StatusMap>(() => loadStatuses())
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    return saved === 'en' ? 'en' : 'ru'
  })

  useEffect(() => saveStatuses(statuses), [statuses])
  useEffect(() => localStorage.setItem(LANGUAGE_KEY, language), [language])

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
        const searchable = [item.name, item.shortName, item.nameRu, item.shortNameRu]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
        const matchesStatus = statusFilter === 'all' || status === statusFilter
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
        return matchesQuery && matchesStatus && matchesCategory
      })
      .sort((a, b) => {
        const aStatus = statuses[a.id] ?? 'unknown'
        const bStatus = statuses[b.id] ?? 'unknown'
        if (aStatus !== bStatus) {
          if (aStatus === 'unknown') return -1
          if (bStatus === 'unknown') return 1
        }
        return itemText(a, language).shortName.localeCompare(itemText(b, language).shortName, language)
      })
  }, [categoryFilter, language, query, statusFilter, statuses])

  function toggleLanguage() {
    setLanguage((current) => (current === 'ru' ? 'en' : 'ru'))
  }

  function setItemStatus(itemId: string, status: ItemStatus) {
    const currentStatus = statuses[itemId] ?? 'unknown'
    if (status === 'allergic' && currentStatus !== 'allergic' && stats.allergic >= 3) return
    setStatuses((current) => ({ ...current, [itemId]: status }))
  }

  function resetProgress() {
    const message = language === 'ru'
      ? 'Сбросить все отмеченные предметы? Это действие нельзя отменить.'
      : 'Reset all marked items? This cannot be undone.'
    if (!window.confirm(message)) return
    clearStatuses()
    setStatuses({})
  }

  const syncedLabel = catalogSyncedAt === 'fallback'
    ? (language === 'ru' ? 'Локальный резервный каталог' : 'Local fallback catalog')
    : new Date(catalogSyncedAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">ESCAPE FROM TARKOV · SEASONAL</p>
          <h1>Allergy Tracker</h1>
          <p className="subtitle">
            {language === 'ru'
              ? 'Отмечай проверенные расходники прямо во время рейда.'
              : 'Mark tested consumables during the raid.'}
          </p>
        </div>
        <div className="hero-actions">
          <button className="language-button" type="button" onClick={toggleLanguage}>{language.toUpperCase()}</button>
          <button className="reset-button" type="button" onClick={resetProgress}>
            {language === 'ru' ? 'Сброс' : 'Reset'}
          </button>
        </div>
      </section>

      <section className="stats-grid" aria-label={language === 'ru' ? 'Прогресс' : 'Progress'}>
        <article className="stat-card danger">
          <span className="stat-label">{language === 'ru' ? 'Аллергены' : 'Allergens'}</span>
          <strong>{stats.allergic} / 3</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">{language === 'ru' ? 'Проверено' : 'Tested'}</span>
          <strong>{stats.tested} / {items.length}</strong>
        </article>
      </section>

      {stats.allergic >= 3 && (
        <section className="complete-banner">
          <strong>{language === 'ru' ? 'Все 3 аллергена найдены.' : 'All 3 allergens found.'}</strong>
          <span>{language === 'ru' ? 'Остальные предметы можно считать безопасными по исключению.' : 'All remaining items are safe by elimination.'}</span>
        </section>
      )}

      <section className="controls">
        <label className="search-box">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={language === 'ru' ? 'Найти предмет…' : 'Find item…'}
            autoComplete="off"
          />
        </label>

        <div className="filter-row" aria-label={language === 'ru' ? 'Фильтр по статусу' : 'Status filter'}>
          {(['all', 'unknown', 'safe', 'allergic'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              className={statusFilter === filter ? 'filter active' : 'filter'}
              onClick={() => setStatusFilter(filter)}
            >
              {filter === 'all' ? (language === 'ru' ? 'Все' : 'All') : STATUS_LABELS[language][filter]}
            </button>
          ))}
        </div>

        <div className="filter-row" aria-label={language === 'ru' ? 'Фильтр по категории' : 'Category filter'}>
          {(['all', 'food', 'medical'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              className={categoryFilter === filter ? 'filter active' : 'filter'}
              onClick={() => setCategoryFilter(filter)}
            >
              {filter === 'all'
                ? (language === 'ru' ? 'Все типы' : 'All types')
                : filter === 'food'
                  ? (language === 'ru' ? 'Еда' : 'Provisions')
                  : (language === 'ru' ? 'Медицина' : 'Medical')}
            </button>
          ))}
        </div>
      </section>

      <div className="catalog-note">
        <span>{language === 'ru' ? 'Каталог Tarkov.dev' : 'Tarkov.dev catalog'} · {items.length}</span>
        <span>{syncedLabel}</span>
      </div>

      <section className="item-list" aria-live="polite">
        {visibleItems.map((item) => {
          const status = statuses[item.id] ?? 'unknown'
          const text = itemText(item, language)
          const allergyLocked = stats.allergic >= 3 && status !== 'allergic'

          return (
            <article className={`item-card status-${status}`} key={item.id}>
              <ItemIcon item={item} />
              <div className="item-copy">
                <div className="item-heading">
                  <strong>{text.shortName}</strong>
                  <span>{item.category === 'food' ? (language === 'ru' ? 'Еда' : 'Provisions') : (language === 'ru' ? 'Медицина' : 'Medical')}</span>
                </div>
                <p>{text.name}</p>
                <small>{STATUS_LABELS[language][status]}</small>
              </div>
              <div className="item-actions">
                <button
                  type="button"
                  className={status === 'safe' ? 'safe selected' : 'safe'}
                  onClick={() => setItemStatus(item.id, status === 'safe' ? 'unknown' : 'safe')}
                  aria-label={`${language === 'ru' ? 'Безопасно' : 'Safe'}: ${text.shortName}`}
                >
                  ✓
                </button>
                <button
                  type="button"
                  className={status === 'allergic' ? 'allergic selected' : 'allergic'}
                  onClick={() => setItemStatus(item.id, status === 'allergic' ? 'unknown' : 'allergic')}
                  disabled={allergyLocked}
                  aria-label={`${language === 'ru' ? 'Аллергия' : 'Allergy'}: ${text.shortName}`}
                >
                  !
                </button>
              </div>
            </article>
          )
        })}

        {visibleItems.length === 0 && <p className="empty-state">{language === 'ru' ? 'Ничего не найдено.' : 'Nothing found.'}</p>}
      </section>
    </main>
  )
}

export default App
