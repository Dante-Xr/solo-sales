#!/usr/bin/env node

/**
 * 类型检查脚本
 * 运行 TypeScript 编译器的严格模式检查
 * 检测 any 类型警告和类型错误
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}🔍 Running TypeScript type check...${RESET}\n`);

try {
  // 运行 tsc --noEmit --strict
  const output = execSync('npx tsc --noEmit --strict', {
    encoding: 'utf-8',
    cwd: process.cwd(),
    stdio: 'pipe'
  });

  console.log(`${GREEN}✅ Type check passed with no errors!${RESET}\n`);
  process.exit(0);
} catch (error) {
  const output = error.stdout || error.stderr || '';

  // 解析错误输出
  const lines = output.split('\n');
  let errorCount = 0;
  let anyWarningCount = 0;
  const anyWarnings = [];

  for (const line of lines) {
    // 统计错误数量
    if (line.includes('error TS')) {
      errorCount++;
    }

    // 检测 any 类型警告
    if (line.includes('implicitly has an \'any\' type') ||
        line.includes('\'any\' type') ||
        line.includes('no-explicit-any')) {
      anyWarningCount++;
      anyWarnings.push(line.trim());
    }
  }

  // 输出统计
  console.log(`${RED}❌ Type check failed${RESET}\n`);

  if (errorCount > 0) {
    console.log(`${RED}Errors found: ${errorCount}${RESET}`);
  }

  if (anyWarningCount > 0) {
    console.log(`${YELLOW}⚠️  'any' type warnings: ${anyWarningCount}${RESET}\n`);

    if (anyWarnings.length <= 10) {
      console.log(`${YELLOW}Any type warnings:${RESET}`);
      anyWarnings.forEach(w => console.log(`  ${w}`));
    } else {
      console.log(`${YELLOW}First 10 'any' type warnings:${RESET}`);
      anyWarnings.slice(0, 10).forEach(w => console.log(`  ${w}`));
      console.log(`  ... and ${anyWarnings.length - 10} more`);
    }
  }

  console.log('\n' + output);

  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    errors: errorCount,
    anyWarnings: anyWarningCount,
    output: output
  };

  const reportPath = path.join(process.cwd(), '.trae', 'type-check-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`${BLUE}📝 Full report saved to: ${reportPath}${RESET}\n`);

  process.exit(1);
}
