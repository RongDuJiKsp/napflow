const { copyFileSync, existsSync } = require('node:fs')
const path = require('node:path')

const outputDir = './dist'
const monoDir = 'apps/server'
/** @type {(string|[string,string])[]} */
const resources = [
  'run.sh',
  '.env',
  '.env.production',
  '.env.production.local',
  './src/prisma/generated/create.sql',
]

for(const resource of resources) {
  if(existsSync(resource))
    copyFileSync(resource, path.join(outputDir, monoDir, resource))
}
