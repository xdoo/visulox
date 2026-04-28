function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInlineMarkdown(value: string) {
  const escapedValue = escapeHtml(value)

  return escapedValue
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

function renderImage(line: string) {
  const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)

  if (!imageMatch) {
    return null
  }

  const [, alt = '', src = ''] = imageMatch

  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`
}

export function renderReportMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: string[] = []
  let paragraphLines: string[] = []
  let listItems: string[] = []

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return
    }

    blocks.push(`<p>${renderInlineMarkdown(paragraphLines.join(' '))}</p>`)
    paragraphLines = []
  }

  function flushList() {
    if (listItems.length === 0) {
      return
    }

    blocks.push(`<ul>${listItems.map(item => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`)
    listItems = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    const imageHtml = renderImage(line)

    if (imageHtml) {
      flushParagraph()
      flushList()
      blocks.push(imageHtml)
      continue
    }

    const headingMatch = line.match(/^(#{2,4})\s+(.+)$/)

    if (headingMatch) {
      flushParagraph()
      flushList()
      const level = headingMatch[1]!.length
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2]!)}</h${level}>`)
      continue
    }

    const listItemMatch = line.match(/^[-*]\s+(.+)$/)

    if (listItemMatch) {
      flushParagraph()
      listItems.push(listItemMatch[1]!)
      continue
    }

    flushList()
    paragraphLines.push(line)
  }

  flushParagraph()
  flushList()

  return blocks.join('\n')
}
