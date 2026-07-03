#!/usr/bin/env node

/**
 * 批量替换查询条件和更新数据的 Record<string, unknown> 为 Prisma 类型
 */

const fs = require('fs');
const path = require('path');

// 递归查找所有 TypeScript 文件
function findTsFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        findTsFiles(fullPath, files);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

// 检测 Prisma 模型名称
function detectPrismaModel(content, lineIndex) {
  const lines = content.split('\n');

  // 向下查找 prisma 查询
  for (let i = lineIndex; i < Math.min(lineIndex + 10, lines.length); i++) {
    const line = lines[i];

    // 匹配 prisma.xxx.findMany/update/create 等
    const match = line.match(/prisma\.([\w]+)\.(findMany|findUnique|findFirst|update|updateMany|create|delete)/);
    if (match) {
      const modelName = match[1];
      // 首字母大写
      return modelName.charAt(0).toUpperCase() + modelName.slice(1);
    }
  }

  return null;
}

// 修复单个文件
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    const lines = content.split('\n');
    let modified = false;

    // 查找需要替换的行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 匹配 const where: Record<string, unknown> = ...
      if (/const\s+where:\s*Record<string,\s*unknown>\s*=/.test(line)) {
        const modelName = detectPrismaModel(content, i);
        if (modelName) {
          lines[i] = line.replace(
            /Record<string,\s*unknown>/,
            `Prisma.${modelName}WhereInput`
          );
          modified = true;
        }
      }

      // 匹配 const updateData: Record<string, unknown> = ...
      // 或 const data: Record<string, unknown> = ...
      if (/const\s+(updateData|data):\s*Record<string,\s*unknown>\s*=/.test(line)) {
        const modelName = detectPrismaModel(content, i);
        if (modelName) {
          lines[i] = line.replace(
            /Record<string,\s*unknown>/,
            `Prisma.${modelName}UpdateInput`
          );
          modified = true;
        }
      }
    }

    if (modified) {
      content = lines.join('\n');

      // 确保导入了 Prisma
      if (!content.includes('import') || !content.includes('Prisma')) {
        // 查找第一个从 @prisma/client 的导入
        const prismaImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]@prisma\/client['"]/);
        if (prismaImportMatch) {
          const imports = prismaImportMatch[1];
          if (!imports.includes('Prisma')) {
            content = content.replace(
              /import\s+{([^}]+)}\s+from\s+['"]@prisma\/client['"]/,
              `import {$1, Prisma} from '@prisma/client'`
            );
          }
        }
      }

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

  console.log('🔍 Finding TypeScript files with Record<string, unknown>...\n');
  const allFiles = findTsFiles(srcDir);

  // 过滤出包含 Record<string, unknown> 的文件
  const targetFiles = allFiles.filter(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      return /Record<string,\s*unknown>/.test(content) &&
             !/\.test\.ts/.test(file) &&
             !/\.d\.ts/.test(file);
    } catch {
      return false;
    }
  });

  console.log(`Found ${targetFiles.length} files with Record<string, unknown>\n`);

  let fixedCount = 0;

  for (const file of targetFiles) {
    const fixed = fixFile(file);
    if (fixed) {
      fixedCount++;
      const relativePath = path.relative(process.cwd(), file);
      console.log(`✓ ${relativePath}`);
    }
  }

  console.log(`\n✅ Summary:`);
  console.log(`   Checked: ${targetFiles.length} files`);
  console.log(`   Fixed: ${fixedCount} files`);
  console.log(`   Unchanged: ${targetFiles.length - fixedCount} files`);
}

main();
