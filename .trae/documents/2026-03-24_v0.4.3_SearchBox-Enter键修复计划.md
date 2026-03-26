# SearchBox 搜索逻辑修复计划

## 问题分析

### 当前问题代码
```typescript
// 第 83-86 行
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter" || e.key === "Search" || e.nativeEvent.isComposing === false) {
    performSearch(query)
  }
}
```

### 问题原因
- `e.nativeEvent.isComposing === false` 条件在每次按键时都为 `true`（只要不在输入中文时）
- 这导致输入任何字符都会触发搜索，而不是只响应 Enter 键

---

## 修复方案

### 修改文件
`src/components/storefront/SearchBox.tsx`

### 修改内容
将第 83-86 行改为只响应 Enter 键：

```typescript
// 修复后：只响应 Enter 键
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    performSearch(query)
  }
}
```

**说明**：
- `e.key === "Enter"` 已足够处理 PC 和手机键盘的回车事件
- 移除 `e.key === "Search"` 和 `e.nativeEvent.isComposing === false` 这两个不必要的条件

---

## 实施步骤

1. 修改 `SearchBox.tsx` 第 83-86 行的 `handleKeyDown` 函数
2. 仅保留 `e.key === "Enter"` 条件判断
3. 验证 TypeScript 类型检查通过

---

**计划制定完成，等待用户确认后执行。**