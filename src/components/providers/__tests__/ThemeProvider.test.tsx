import { render, screen, fireEvent } from "@testing-library/react"
import { ThemeProvider, useTheme } from "../ThemeProvider"

function TestComponent() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
    </div>
  )
}

describe("ThemeProvider", () => {
  it("should render children", () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Hello</div>
      </ThemeProvider>
    )
    expect(screen.getByTestId("child")).toBeInTheDocument()
  })

  it("should provide theme context", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    expect(screen.getByTestId("theme-value")).toBeInTheDocument()
  })

  it("should allow theme switching", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByText("Set Dark"))
    expect(screen.getByTestId("theme-value").textContent).toBe("dark")

    fireEvent.click(screen.getByText("Set Light"))
    expect(screen.getByTestId("theme-value").textContent).toBe("light")
  })
})
