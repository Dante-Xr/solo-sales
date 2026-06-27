# 颜色硬编码修复指南

## 映射规则

### 品牌色 (Klein Blue)
- `text-blue-500/600/700` → `text-brand`
- `bg-blue-500/600/700` → `bg-brand`
- `border-blue-500/600/700` → `border-brand`

### 强调色 (Red)
- `text-red-500/600/700` → `text-accent`
- `text-orange-500/600/700` → `text-accent` (热门/紧急)
- `bg-red-500/600/700` → `bg-accent`

### 成功 (绿色保留)
- `text-green-500/600/700` → `text-success`
- `bg-green-500/600/700` → `bg-success`

### 警告 (黄色保留)
- `text-yellow-500/600/700` → `text-warning`
- `text-orange-400/500` → `text-warning` (警告场景)
- `bg-yellow-500/600/700` → `bg-warning`

### 信息 (蓝色)
- `text-blue-400/500` → `text-info` (信息提示)
- `bg-blue-400/500` → `bg-info`

## 特殊场景

### 热门/火爆 (使用accent红色)
- `text-orange-600` (火焰图标) → `text-accent`
- `bg-orange-100 text-orange-700` (徽章) → `bg-accent/10 text-accent`

### 浏览人数 (使用brand)
- `text-orange-600` (用户图标) → `text-brand`

### 已售/销量 (使用success)
- `text-green-600` → `text-success`

### 价格 (已有专用类)
- 保持 `text-price` (已映射到Red)
