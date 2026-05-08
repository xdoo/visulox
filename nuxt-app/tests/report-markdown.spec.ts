import { describe, expect, it } from 'vitest'

import { renderReportMarkdown } from '../app/utils/reportMarkdown'

describe('reportMarkdown', () => {
  it('renders supported markdown blocks and escapes raw html', () => {
    const html = renderReportMarkdown([
      '## Markt <Analyse>',
      '',
      'Ein **wichtiger** Absatz mit *Kontext*.',
      '',
      '- erster Punkt',
      '- zweiter Punkt',
      '',
      '![Marktbild](/report-assets/market.png)',
      '',
      '<script>alert("xss")</script>'
    ].join('\n'))

    expect(html).toContain('<h2>Markt &lt;Analyse&gt;</h2>')
    expect(html).toContain('<p>Ein <strong>wichtiger</strong> Absatz mit <em>Kontext</em>.</p>')
    expect(html).toContain('<ul><li>erster Punkt</li><li>zweiter Punkt</li></ul>')
    expect(html).toContain('<img src="/report-assets/market.png" alt="Marktbild">')
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
  })

  it('renders markdown tables with alignment', () => {
    const markdown = [
      '| Anbieter | Fachliche Bewertung | Kostenbewertung | Einordnung |',
      '|---|---:|---:|---|',
      '| Adesso | 82 % | 1,0 Mio. EUR | **Sehr ausgewogen** |',
      '| SAP Fioneer | 76 % | 1,4 Mio. EUR | Wirtschaftlich stark |'
    ].join('\n')
    const html = renderReportMarkdown(markdown)

    expect(html).toContain('<table>')
    expect(html).toContain('<th>Anbieter</th>')
    expect(html).toContain('<th style="text-align: right">Fachliche Bewertung</th>')
    expect(html).toContain('<td style="text-align: right">82 %</td>')
    expect(html).toContain('<td><strong>Sehr ausgewogen</strong></td>')
    expect(html).not.toContain('<p>| Anbieter')
  })
})
