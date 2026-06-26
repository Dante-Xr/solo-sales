<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Admin Operations Spec

## Purpose

Define reproducible requirements for admin dashboard, products, orders, customers, imports, knowledge base, support chat, roles, permissions, admin users, profile, and settings.

## Requirement: Admin Page Capabilities

Admin pages SHALL provide listing, filtering, pagination, details, create, edit, delete, batch actions, and error feedback, controlled by RBAC.

### Scenario: Managing Products

- WHEN an admin creates, edits, or batch deletes products
- THEN the system SHALL check permissions, write data, and clear product-list plus featured caches
- AND products linked to order items SHALL NOT be hard-deleted

## Requirement: Dashboard

The admin dashboard SHALL aggregate sales, orders, products, customers, and inventory data, with caching and dependency failure degradation for high-frequency queries.

## Requirement: Imports And Knowledge Base

Imports SHALL support synchronous and asynchronous background jobs. Knowledge base management SHALL support categories, articles, version history, and support search.

