#!/usr/bin/env node
/**
 * tsc 用 moduleResolution "node"（classic）編譯 ESM 輸出時，不會幫相對路徑
 * import/export 補上 .js 副檔名，導致 Node 原生 ESM loader 解析不到
 * （ERR_MODULE_NOT_FOUND）。這裡對 build/esm 底下所有 .js 檔案的相對路徑
 * import/export specifier 補上 .js，並放一份 { "type": "module" }
 * package.json 讓 Node（含未內建 ESM 語法自動偵測的版本，如 Node 18）
 * 正確把這個資料夾當 ESM 解析。
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const esmDir = join(__dirname, '..', 'build', 'esm')

const RELATIVE_IMPORT_RE = /((?:import|export)[^'"]*from\s+['"])(\.\.?\/[^'"]+)(['"])/g

// 相對路徑可能指向「同名 .js 檔」或「目錄下的 index.js」（barrel export），
// 需要照實際檔案系統判斷，不能一律補 .js（會補錯成不存在的檔名）。
function resolveExtension(fromFile, specifier) {
  const baseDir = dirname(fromFile)
  const asFile = join(baseDir, `${specifier}.js`)
  if (existsSync(asFile)) return `${specifier}.js`
  const asIndex = join(baseDir, specifier, 'index.js')
  if (existsSync(asIndex)) return `${specifier}/index.js`
  throw new Error(`[fix-esm-output] 無法解析相對路徑 ${specifier}（來自 ${fromFile}）`)
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      walk(fullPath)
      continue
    }
    if (!fullPath.endsWith('.js')) continue

    const original = readFileSync(fullPath, 'utf8')
    const fixed = original.replace(RELATIVE_IMPORT_RE, (match, prefix, specifier, suffix) => {
      if (specifier.endsWith('.js') || specifier.endsWith('.json')) return match
      return `${prefix}${resolveExtension(fullPath, specifier)}${suffix}`
    })

    if (fixed !== original) {
      writeFileSync(fullPath, fixed)
    }
  }
}

walk(esmDir)
writeFileSync(join(esmDir, 'package.json'), JSON.stringify({ type: 'module' }, null, 2) + '\n')

console.log('[fix-esm-output] 已修補 build/esm 相對路徑 import 副檔名並寫入 type:module package.json')
