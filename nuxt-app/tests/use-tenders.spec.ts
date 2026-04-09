import { effectScope } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useTenders } from '../app/composables/useTenders'

const useStateMock = vi.fn()
const stateStore = new Map<string, { value: unknown }>()

vi.stubGlobal('useState', useStateMock)

function getState<T>(key: string, init: () => T) {
  if (!stateStore.has(key)) {
    stateStore.set(key, { value: init() })
  }

  return stateStore.get(key) as { value: T }
}

describe('useTenders', () => {
  beforeEach(() => {
    stateStore.clear()
    useStateMock.mockImplementation(<T>(key: string, init: () => T) => getState(key, init))
  })

  it('loads ausschreibungen and exposes the latest name', async () => {
    const fetcher = vi.fn().mockResolvedValue([
      { id: '2', name: 'Neue Ausschreibung' },
      { id: '1', name: 'Alte Ausschreibung' }
    ])

    let composable!: ReturnType<typeof useTenders>

    effectScope().run(() => {
      composable = useTenders(fetcher)
    })

    await composable.loadTenders()

    expect(composable.items.value).toEqual([
      { id: '2', name: 'Neue Ausschreibung' },
      { id: '1', name: 'Alte Ausschreibung' }
    ])
    expect(composable.latestTenderName.value).toBe('Neue Ausschreibung')
  })

  it('prepends a newly created ausschreibung to the navigation state', () => {
    let composable!: ReturnType<typeof useTenders>

    effectScope().run(() => {
      composable = useTenders(vi.fn())
    })

    composable.addTender({ id: '1', name: 'Rahmenvertrag' })

    expect(composable.items.value).toEqual([{ id: '1', name: 'Rahmenvertrag' }])
    expect(composable.latestTenderName.value).toBe('Rahmenvertrag')
  })

  it('keeps existing ausschreibungen when a second one is added', () => {
    let composable!: ReturnType<typeof useTenders>

    effectScope().run(() => {
      composable = useTenders(vi.fn())
    })

    composable.addTender({ id: '1', name: 'Erste Ausschreibung' })
    composable.addTender({ id: '2', name: 'Zweite Ausschreibung' })

    expect(composable.items.value).toEqual([
      { id: '2', name: 'Zweite Ausschreibung' },
      { id: '1', name: 'Erste Ausschreibung' }
    ])
  })
})
