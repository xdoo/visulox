import { Pool } from 'pg'

let postgresPool: Pool | undefined
let cachedConnectionString: string | undefined

function getDatabaseUrl(databaseUrl: string | undefined) {
  const normalizedDatabaseUrl = databaseUrl?.trim()

  if (!normalizedDatabaseUrl) {
    throw new Error('runtimeConfig.databaseUrl is not set')
  }

  return normalizedDatabaseUrl
}

export function getPostgresPool(databaseUrl: string) {
  const connectionString = getDatabaseUrl(databaseUrl)

  if (!postgresPool || cachedConnectionString !== connectionString) {
    postgresPool = new Pool({
      connectionString
    })
    cachedConnectionString = connectionString
  }

  return postgresPool
}

export function getPostgresClient(databaseUrl: string) {
  return getPostgresPool(databaseUrl).connect()
}
