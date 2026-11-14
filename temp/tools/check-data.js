const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', '..', 'cilent')
const dirs = fs.readdirSync(path.join(root, 'pages'), { withFileTypes: true }).filter(d => d.isDirectory())

const loopAliases = new Set(['item', 'index', 'ref', 'tag', 'condition', 'material', 'rule', 'faq', 'step', 'stepIndex', 'field', 'q', 'path', 'pi', 'group', 'row', 'tagIndex', 'opt', 'fi', 'mi', 'log', 'logIndex', 'topic', 'topicIndex'])
const globals = new Set(['true', 'false', 'null', 'undefined', 'Math', 'JSON'])

for (const dir of dirs) {
  const wxmlPath = path.join(root, 'pages', dir.name, dir.name + '.wxml')
  const files = fs.readdirSync(path.join(root, 'pages', dir.name)).filter(f => f.endsWith('.wxml'))
  for (const file of files) {
    const wxml = fs.readFileSync(path.join(root, 'pages', dir.name, file), 'utf8')
    const js = fs.readFileSync(path.join(root, 'pages', dir.name, file.replace('.wxml', '.js')), 'utf8')
    const dataMatch = js.match(/data:\s*\{([\s\S]*?)\n  \},/)
    const keys = new Set()
    if (dataMatch) {
      for (const line of dataMatch[1].split('\n')) {
        const m = line.match(/^\s{4}([A-Za-z_$][\w$]*):/)
        if (m) keys.add(m[1])
      }
    }
    const roots = new Set()
    for (const m of wxml.matchAll(/\{\{([\s\S]*?)\}\}/g)) {
      let expr = m[1].replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""')
      for (const id of expr.matchAll(/(^|[^.\w$])([A-Za-z_$][\w$]*)/g)) {
        const name = id[2]
        if (!loopAliases.has(name) && !globals.has(name) && !/^[A-Z]/.test(name)) roots.add(name)
      }
    }
    const missing = [...roots].filter(r => !keys.has(r))
    if (missing.length) console.log(file, 'possible missing data:', missing.join(', '))
  }
}
