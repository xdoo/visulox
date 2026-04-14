import type { PoolClient } from 'pg'

export interface TenderRow {
  id: string | number
}

export interface SectionRow {
  id: string | number
  ausschreibung_id: string | number
  name: string
  weight: number
}

export interface VendorRow {
  id: string | number
  ausschreibung_id: string | number
  name: string
}

type Queryable = Pick<PoolClient, 'query'>

export async function loadTender(client: Queryable, tenderId: string) {
  const result = await client.query<TenderRow>(
    'SELECT id FROM ausschreibungen WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
    [tenderId]
  )

  return result.rows[0] || null
}

export async function loadSection(client: Queryable, sectionId: string) {
  const result = await client.query<SectionRow>(
    'SELECT id, ausschreibung_id, name, weight FROM abschnitte WHERE id = $1 LIMIT 1',
    [sectionId]
  )

  return result.rows[0] || null
}

export async function loadVendor(client: Queryable, vendorId: string) {
  const result = await client.query<VendorRow>(
    'SELECT id, ausschreibung_id, name FROM anbieter WHERE id = $1 LIMIT 1',
    [vendorId]
  )

  return result.rows[0] || null
}

export async function hasSectionQuestions(client: Queryable, sectionId: string) {
  const result = await client.query<{ id: string | number }>(
    'SELECT id FROM abschnittsfragen WHERE abschnitt_id = $1 LIMIT 1',
    [sectionId]
  )

  return Boolean(result.rows[0])
}

export async function hasVendorQuestions(client: Queryable, vendorId: string) {
  const result = await client.query<{ id: string | number }>(
    'SELECT id FROM abschnittsfragen WHERE anbieter_id = $1 LIMIT 1',
    [vendorId]
  )

  return Boolean(result.rows[0])
}
