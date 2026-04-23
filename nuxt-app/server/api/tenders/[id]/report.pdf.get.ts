import { createError, defineEventHandler, getRequestURL, setHeader } from 'h3'
import { chromium } from 'playwright'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

function buildReportUrl(origin: string, tenderId: string) {
  return `${origin}/tenders/${encodeURIComponent(tenderId)}/report?pdf=1`
}

function sanitizeReportFilenamePart(value: string) {
  return value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .replace(/_+/g, '_')
    || 'Ausschreibung'
}

async function loadTenderName(tenderId: string) {
  const config = useRuntimeConfig()
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const result = await client.query<{ name: string }>(
      'SELECT name FROM ausschreibungen WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
      [tenderId]
    )

    return result.rows[0]?.name
  } finally {
    client.release()
  }
}

export default defineEventHandler(async (event) => {
  const tenderId = event.context.params?.id?.trim()

  if (!tenderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

  const tenderName = await loadTenderName(tenderId)

  if (!tenderName) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Ausschreibung wurde nicht gefunden.'
    })
  }

  const filename = `Zusammenfassung_${sanitizeReportFilenamePart(tenderName)}.pdf`
  const requestUrl = getRequestURL(event)
  const browser = await chromium.launch({
    headless: true
  })

  try {
    const page = await browser.newPage({
      viewport: {
        width: 1240,
        height: 1754
      }
    })

    await page.goto(buildReportUrl(requestUrl.origin, tenderId), {
      waitUntil: 'networkidle',
      timeout: 60_000
    })

    await page.waitForFunction(() => {
      return (window as Window & { __VISULOX_REPORT_READY__?: boolean }).__VISULOX_REPORT_READY__ === true
    }, undefined, {
      timeout: 60_000
    })

    await page.emulateMedia({ media: 'print' })

    const pdf = await page.pdf({
      format: 'A4',
      preferCSSPageSize: true,
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    })

    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(
      event,
      'Content-Disposition',
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    )

    return pdf
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PDF report could not be generated'

    throw createError({
      statusCode: 500,
      statusMessage: message
    })
  } finally {
    await browser.close()
  }
})
