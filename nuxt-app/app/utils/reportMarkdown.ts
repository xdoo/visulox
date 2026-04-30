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

function renderListItem(value: string) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return ''
  }

  const paragraphs = normalizedValue
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (paragraphs.length <= 1) {
    return renderInlineMarkdown(paragraphs[0] || normalizedValue)
  }

  return paragraphs.map((paragraph) => `<p>${renderInlineMarkdown(paragraph)}</p>`).join('')
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
  let currentListType: 'ul' | 'ol' | null = null
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

    const listTag = currentListType || 'ul'
    blocks.push(`<${listTag}>${listItems.map(item => `<li>${renderListItem(item)}</li>`).join('')}</${listTag}>`)
    currentListType = null
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
      if (currentListType && currentListType !== 'ul') {
        flushList()
      }
      currentListType = 'ul'
      listItems.push(listItemMatch[1]!)
      continue
    }

    const orderedListItemMatch = line.match(/^\d+[.)]\s+(.+)$/)

    if (orderedListItemMatch) {
      flushParagraph()
      if (currentListType && currentListType !== 'ol') {
        flushList()
      }
      currentListType = 'ol'
      listItems.push(orderedListItemMatch[1]!)
      continue
    }

    if (currentListType && listItems.length > 0 && /^\s{2,}\S/.test(rawLine)) {
      const lastIndex = listItems.length - 1
      const currentValue = listItems[lastIndex] || ''
      listItems[lastIndex] = currentValue ? `${currentValue}\n${line}` : line
      continue
    }

    flushList()
    paragraphLines.push(line)
  }

  flushParagraph()
  flushList()

  return blocks.join('\n')
}
