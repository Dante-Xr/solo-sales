<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Storefront Pages Spec

## Purpose

Define reproducible requirements for the storefront: home, product listing, product detail, search, cart, orders, profile, and mobile navigation.

## Requirement: Product Page Data Source

Storefront product pages SHALL read product, category, inventory, price, and publication status from server APIs or server data access. Hard-coded frontend products SHALL NOT be the source of truth.

### Scenario: Product Listing

- WHEN a user visits `/zh/products` or `/en/products`
- THEN the system SHALL render paginated products, category filters, search results, prices, stock status, and images
- AND database failure SHALL use an explicit fallback UI or fallback products to avoid a page-level 500

## Requirement: Product Detail

The product detail page SHALL show name, description, images, price, stock, category, review entry points, and add-to-cart actions.

### Scenario: Product Not Found

- WHEN a product ID does not exist or is unpublished
- THEN the system SHALL return 404 or a defined empty state
- AND it SHALL NOT expose unpublished product data

## Requirement: Cart And Checkout Entry

The cart SHALL keep frontend item state, but checkout SHALL submit only `productId` and `quantity`. Price and total amount SHALL be computed on the server.

