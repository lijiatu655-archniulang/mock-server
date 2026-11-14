const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', '..', 'cilent')
const pages = fs.readdirSync(path.join(root, 'pages'), { withFileTypes: true })
  .filter(d => d.isDirectory())
  .flatMap(d => fs.readdirSync(path.join(root, 'pages', d.name))
    .filter(f => f.endsWith('.wxml'))
    .map(f => path.join(root, 'pages', d.name, f)))

let problems = 0
const knownTags = new Set(['view', 'text', 'image', 'scroll-view', 'block', 'button', 'input', 'textarea', 'rich-text', 'picker'])
for (const wxml of pages) {
  const src = fs.readFileSync(wxml, 'utf8')
  const jsPath = wxml.replace(/\.wxml$/, '.js')
  const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : ''
  const tags = new Set()
  for (const m of src.matchAll(/<([A-Za-z][\w-]*)/g)) tags.add(m[1])
  for (const t of tags) if (!knownTags.has(t)) {
    console.log('UNKNOWN TAG', path.basename(wxml), t)
    problems++
  }
  const handlers = new Set()
  for (const m of src.matchAll(/(?:bind|catch)(?::)?(?:tap|input|confirm|change|blur|focus|longpress|chooseavatar|error)="([A-Za-z0-9_]+)"/g)) handlers.add(m[1])
  for (const h of handlers) {
    if (h === 'noop') continue
    const re = new RegExp('\\b' + h + '\\s*[:(]')
    if (!re.test(js)) {
      console.log('MISSING HANDLER', path.basename(wxml), h)
      problems++
    }
  }
  const assetRefs = [...src.matchAll(/src="([^"{}]+)"/g)].map(m => m[1]).filter(s => s.startsWith('/'))
  for (const ref of assetRefs) {
    const p = path.join(root, ref.replace(/^\//, ''))
    if (!fs.existsSync(p)) {
      console.log('MISSING ASSET', path.basename(wxml), ref)
      problems++
    }
  }
}
console.log(problems ? problems + ' problem(s)' : 'WXML checks OK')

