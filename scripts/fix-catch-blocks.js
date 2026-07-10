#!/usr/bin/env node

/**
 * 自动修复 catch 块类型声明
 * 将 catch (error) 替换为 catch (error: unknown)
 * 并添加错误处理工具的导入
 */

/* eslint-disable @typescript-eslint/no-require-imports -- This maintenance script runs directly in Node CommonJS. */
const fs = require('fs');
const { execSync } = require('child_process');

// 查找所有需要修复的文件
const findFilesWithCatchBlocks = () => {
  try {
    const output = execSync(
      'grep -rl "catch (error)" src --include="*.ts" --include="*.tsx"',
      { encoding: 'utf-8', cwd: process.cwd() }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
};

// 修复单个文件
const fixFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 检查是否已经有 error: unknown
    if (content.includes('catch (error: unknown)')) {
      console.log(`✓ ${filePath} - already fixed`);
      return false;
    }

    // 检查是否有 catch (error) 且没有类型注解
    if (/catch\s*\(\s*error\s*\)/.test(content)) {
      // 替换 catch (error) 为 catch (error: unknown)
      content = content.replace(/catch\s*\(\s*error\s*\)/g, 'catch (error: unknown)');

      // 检查是否需要添加 getErrorMessage 导入
      const needsGetErrorMessage = /error\.message/.test(content);
      const hasErrorImport = /import.*getErrorMessage.*from.*@\/types\/errors/.test(content);

      if (needsGetErrorMessage && !hasErrorImport) {
        // 查找第一个 import 语句的位置
        const importMatch = content.match(/^import\s+.*?from\s+['"].*?['"];?\s*$/m);
        if (importMatch) {
          const insertPos = content.indexOf(importMatch[0]) + importMatch[0].length;
          const importStatement = "\nimport { getErrorMessage } from '@/types/errors'";
          content = content.slice(0, insertPos) + importStatement + content.slice(insertPos);
        }
      }

      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✓ ${filePath} - fixed`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`✗ ${filePath} - error: ${error.message}`);
    return false;
  }
};

// 主函数
const main = () => {
  console.log('🔍 Finding files with catch blocks...\n');
  const files = findFilesWithCatchBlocks();
  console.log(`Found ${files.length} files\n`);

  let fixedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const fixed = fixFile(file);
    if (fixed) {
      fixedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`\n✅ Summary:`);
  console.log(`   Fixed: ${fixedCount} files`);
  console.log(`   Skipped: ${skippedCount} files`);
};

main();
