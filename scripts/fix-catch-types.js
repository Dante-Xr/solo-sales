#!/usr/bin/env node

/**
 * 自动修复 catch 块类型声明
 * 将 catch (error) 替换为 catch (error: unknown)
 */

const fs = require('fs');
const path = require('path');

// 递归查找所有 TypeScript 文件
function findTsFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // 跳过 node_modules 和 .next
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        findTsFiles(fullPath, files);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

// 修复单个文件
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // 替换 catch (error) 为 catch (error: unknown)
    // 但跳过已经有类型注解的
    content = content.replace(/catch\s*\(\s*error\s*\)\s*{/g, 'catch (error: unknown) {');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// 主函数
function main() {
  const srcDir = path.join(process.cwd(), 'src');

  console.log('🔍 Finding TypeScript files in src/...\n');
  const files = findTsFiles(srcDir);
  console.log(`Found ${files.length} TypeScript files\n`);

  let fixedCount = 0;
  let processedCount = 0;

  for (const file of files) {
    const fixed = fixFile(file);
    if (fixed) {
      fixedCount++;
      const relativePath = path.relative(process.cwd(), file);
      console.log(`✓ ${relativePath}`);
    }
    processedCount++;
  }

  console.log(`\n✅ Summary:`);
  console.log(`   Processed: ${processedCount} files`);
  console.log(`   Fixed: ${fixedCount} files`);
  console.log(`   Unchanged: ${processedCount - fixedCount} files`);
}

main();
