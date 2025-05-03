import { execSync } from 'node:child_process'
import { copyFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { version } from '../package.json'

const rootDir = resolve()
const readmePath = join(rootDir, 'README.md')
const licensePath = join(rootDir, 'LICENSE')
const packagesDir = join(rootDir, 'packages')

let command = 'pnpm publish -r --access public --no-git-checks'

if (version.includes('beta')) {
  command += ' --tag beta'
}

const packages = await readdir(packagesDir, { withFileTypes: true })

for (const pkg of packages) {
  if (!pkg.isDirectory())
    continue

  const targetDir = join(packagesDir, pkg.name)
  await Promise.all([
    copyFile(readmePath, join(targetDir, 'README.md')),
    copyFile(licensePath, join(targetDir, 'LICENSE')),
  ])
}

execSync(command, { stdio: 'inherit' })
