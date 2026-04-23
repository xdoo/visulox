import { createError, defineEventHandler, getRequestURL, setHeader } from 'h3'
import { chromium } from 'playwright'

function buildReportUrl(origin: string, tenderId: string) {
  return `${origin}/tenders/${encodeURIComponent(tenderId)}/report?pdf=1`
}

export default defineEventHandler(async (event) => {
  const tenderId = event.context.params?.id?.trim()

  if (!tenderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

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
    setHeader(event, 'Content-Disposition', `attachment; filename="ausschreibung-${tenderId}-report.pdf"`)

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
