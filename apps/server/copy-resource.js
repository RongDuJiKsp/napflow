const { copyFileSync } = require('node:fs')
const path = require('node:path')
const { fileExistsSync } = require('tsconfig-paths/lib/filesystem')

const outputDir = './dist'
/** @type {(string|[string,string])[]} */
const resources = [
  'run.sh',
  '.env',
  '.env.production',
  '.env.production.local',
  ['./src/prisma/generated/create.sql', './'],
]

for(const resource of resources) {
  const src = typeof resource === 'string' ? resource : resource[0]
  const fileName = path.basename(src)
  const dstParam = typeof resource === 'string' ? resource : resource[1]
  const dst = path.join(outputDir, path.dirname(dstParam), fileName)
  
  if(fileExistsSync(src))
    copyFileSync(src, dst)
}
