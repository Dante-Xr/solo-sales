/**
 * ============================================
 * 视口模式状态管理 (Phase 5 页面模式切换)
 * ============================================
 * 创建日期: 2026-04-14
 * 创建时间: 09:30
 * 功能说明：
 *   - 管理页面视口模式（网页端/手机端）
 *   - 网页端：正常宽度显示
 *   - 手机端：模拟手机屏幕宽度（375px）
 *   - 使用 Zustand persist middleware 实现 localStorage 持久化
 * ============================================
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ViewportMode = "desktop" | "mobile"

interface ViewportModeState {
  mode: ViewportMode
  setMode: (mode: ViewportMode) => void
  toggleMode: () => void
}

export const useViewportModeStore = create<ViewportModeState>()(
  persist(
    (set) => ({
      mode: "desktop",
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === "desktop" ? "mobile" : "desktop",
        })),
    }),
    {
      name: "solo_viewport_mode",
    }
  )
)
