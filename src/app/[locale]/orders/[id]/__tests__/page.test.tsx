import { render, waitFor } from "@testing-library/react"
import OrderDetailPage from "../page"

const routerPush = jest.fn()

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "order-123" }),
}))

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    back: jest.fn(),
  }),
}))

jest.mock("@/lib/auth-client", () => ({
  useSession: jest.fn(),
}))

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "zh",
}))

jest.mock("@/components/order/TrackingTimeline", () => ({
  TrackingTimeline: () => <div data-testid="tracking-timeline" />,
}))

import { useSession } from "@/lib/auth-client"

describe("OrderDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it("redirects unauthenticated viewers instead of leaving order tracking in loading state", async () => {
    ;(useSession as jest.Mock).mockReturnValue({ data: null, isPending: false })

    render(<OrderDetailPage />)

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith("/")
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
