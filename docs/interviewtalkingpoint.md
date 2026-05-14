# Project Overview — Interview Preparation

> **Role:** Product / Project Manager
>
> **Context:** This document covers all projects across two workspaces: the **node-mono** monorepo and the standalone **promocodes-app-enhancement** workspace. For each project you will find a **Business Overview**, **Key Features & User Journeys**, **Technical Overview**, and **Talking Points** to help you answer questions confidently.

---

## Workspace Map

| #   | Project                         | Type           | Workspace          | User Persona             |
| --- | ------------------------------- | -------------- | ------------------ | ------------------------ |
| 1   | Subscription Manager            | MFE            | node-mono          | Customers + Agents       |
| 2   | Contingency Management          | MFE + API      | node-mono          | Internal Ops Agents      |
| 3   | Membership Management           | MFE            | node-mono          | Customers                |
| 4   | Promocode Lookup                | MFE            | node-mono          | Internal Agents          |
| 5   | Catalog Management              | MFE            | node-mono          | Internal Admins          |
| 6   | Contract Manager                | MFE            | node-mono          | Internal Admins          |
| 7   | Policy Rules                    | MFE            | node-mono          | Internal Admins          |
| 8   | Flow Configurator               | MFE (POC)      | node-mono          | Internal / Dev           |
| 9   | SM Contingency Container        | MFE Shell      | node-mono          | Internal Ops Agents      |
| 10  | Contract Management API         | Backend        | node-mono          | Service Layer            |
| 11  | UPM API                         | Backend        | node-mono          | Service Layer            |
| 12  | Agent Crew API                  | Backend (AI)   | node-mono          | Internal / Ops           |
| 13  | Agent LangGraph API             | Backend (AI)   | node-mono          | Internal / Ops           |
| 14  | MCP API                         | Backend        | node-mono          | Dev / AI Tooling         |
| 15  | Rules MCP Server                | Backend        | node-mono          | Dev / AI Tooling         |
| 16  | Rule Builder (Standalone + POC) | UI + Backend   | node-mono          | Internal / Dev           |
| 17  | Promocodes App Enhancement      | Full-Stack App | Separate workspace | Internal Admins + Agents |

---

## 1. Subscription Manager

### Business Overview

Subscription Manager is a customer-facing and agent-facing **self-serve widget** that allows Bell customers to manage their telecom and TV subscriptions through digital channels (MyBell web/app). The goal is to reduce call-centre volume by enabling customers to independently add, change, cancel, and upgrade their subscription packages online — improving both customer satisfaction and operational efficiency.

It is built as an **embeddable microfrontend widget** that any host platform (MyBell, Virgin Plus, etc.) can consume, meaning a single product serves multiple brand surfaces without duplication.

### Key Features & User Journeys

- **View current subscriptions** — customers see all active subscriptions tied to their household account.
- **Add subscription** — browse an eligible catalogue of services, organised by category (TV bundles, VAS, etc.), with discount banners and promotional offers surfaced inline.
- **Change subscription** — upgrade or downgrade an existing package through a guided review flow.
- **Cancel subscription** — initiate a cancellation through a confirmation and review journey.
- **Reverse actions** — undo a recent cancellation, downgrade, or bundle change (undo / reverse flows).
- **TV Add-Ons** — dedicated journey for adding television add-on packages.
- **Loyalty Programs integration** — embeds the Membership Management MFE directly for Aeroplan and other loyalty program linking inside the same widget.
- **Agent view** — a parallel set of pages available to Bell agents, with elevated capabilities.
- **Bilingual (EN/FR)** — full French-language support with custom URL path localisation (e.g. `/client/ajouter-abonnement`).
- **Marketing Tiles** — contextual promotional banners surfaced at key points in the journey.
- **Adobe Analytics / Omniture tracking** — events tracked throughout all flows for product insights and funnel reporting.

### Technical Overview

| Aspect               | Detail                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Framework**        | Next.js 14 (microfrontend, SSR + client-side)                                                                    |
| **Architecture**     | Webpack Module Federation — widget exported and consumed by host platforms                                       |
| **API Layer**        | AWS AppSync (GraphQL) — TanStack Query v5 for data fetching & mutation; codegen for TypeScript types from schema |
| **State Management** | React Context (subscriptions, data, flags)                                                                       |
| **Styling**          | Tailwind CSS, PostCSS                                                                                            |
| **Feature Flags**    | Unleash / OpenFeature — used to control new flows (VAS, undo actions, etc.)                                      |
| **i18n**             | Custom bilingual solution — local JSON files, CMS API integration, rewrite/redirect rules for FR paths           |
| **Auth**             | next-auth + SAML Jackson (BoxyHQ) for agent SSO                                                                  |
| **Testing**          | Jest (unit), Playwright (E2E)                                                                                    |
| **CI/CD**            | Multiple env builds: dev, UAT (1–5), prod; Dockerised; AWS ECS                                                   |
| **Analytics**        | Adobe Analytics / Omniture — custom event tracking utilities                                                     |

### Talking Points for Interview

- **Business impact:** Reduced call-centre dependency by giving customers a self-serve path for the most common subscription actions — add, change, and cancel.
- **Scalability via MFE:** The widget architecture means multiple products (MyBell, Virgin, agent portals) consume the same codebase, reducing duplication and enabling consistent feature releases across surfaces.
- **Bilingual complexity:** Managing EN/FR URL paths in Next.js without native i18n routing required a custom rewrite/redirect/path-map solution — a non-trivial technical constraint driven by a product requirement.
- **Feature flag strategy:** New flows are gated by feature flags (Unleash/OpenFeature), allowing the team to release incrementally and roll back safely — a key tool for managing risk in production.
- **CMS-backed translations:** Translations are served from a CMS API with a local JSON fallback, enabling content teams to update copy without a code deployment.
- **Undo/reverse flows:** The ability to reverse recent subscription changes is a differentiating customer experience feature that reduces complaints and supports retention.

---

## 2. Contingency Management (MFE)

### Business Overview

Contingency Management is an **internal operations tooling platform** built for Bell's operations and support teams. Its core purpose is to manage and resolve problematic or failed subscription orders that cannot be processed through the normal automated pipeline. It provides agents with search, investigation, editing, and bulk-import capabilities to deal with order exceptions, transaction failures, and subscriber issues at scale.

The platform directly supports operational continuity — without it, failed orders would require manual triage through disparate back-office systems, causing delays and customer-impacting errors.

### Key Features & User Journeys

- **Subscriber Search** — agents search for a subscriber by subscriber ID or billing account number to investigate issues.
- **Order Search & Detail** — look up individual orders by order ID; view full order history, status, and associated transactions. Enhanced search (subscriber ID, billing account) behind a feature flag.
- **Transaction Management** — view and manage transactions in paginated lists; filter by status and transaction type; create new transactions; view transaction history per order.
- **Pending Transactions** — dedicated view for transactions awaiting processing or resolution.
- **Bulk Order Import** — agents upload an Excel file to batch-import subscription orders; the system validates the file client-side, submits it, and displays processed results with row-level error reporting.
- **Product Offerings** — browse available product offerings to assist in order correction.
- **Promotions Management** — view and manage promotions associated with orders.
- **Field Audit Logs** — trace changes made to records (audit trail for compliance and debugging).
- **Transactional Orders** — manage the relationship between transactions and underlying orders.

### Technical Overview

| Aspect                | Detail                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**          | Next.js 14 microfrontend                                                                                                                       |
| **Backend API**       | Node.js / Express — `contingency-management-api`                                                                                               |
| **Database**          | PostgreSQL via Drizzle ORM (type-safe schema migrations)                                                                                       |
| **API Design**        | RESTful Express routes: `/orders`, `/transactions`, `/bulkOrders`, `/files`, `/pendingTransactions`, `/transactionalOrders`, `/fieldAuditLogs` |
| **Validation**        | Zod — strict input/query validation on all API endpoints                                                                                       |
| **State Transitions** | Server-side state machine validation for transaction status transitions                                                                        |
| **File Handling**     | Formidable — multipart file upload for bulk order import; client-side Excel validation before upload                                           |
| **Feature Flags**     | Unleash / OpenFeature — e.g. enhanced order search gated behind `enhanced_order_search` flag                                                   |
| **i18n**              | i18next / next-i18next                                                                                                                         |
| **Styling**           | Tailwind CSS                                                                                                                                   |
| **Testing**           | Jest (unit + integration)                                                                                                                      |
| **CI/CD**             | Dockerised; multi-env builds; Drizzle migrations as part of deployment                                                                         |

### Talking Points for Interview

- **Operational efficiency:** This tool directly reduces manual effort for operations teams handling failed orders, translating into faster resolution times and better customer outcomes.
- **Data integrity & audit trail:** Field audit logs and state machine validation on transaction transitions ensure that data cannot be corrupted by agents making invalid state changes — a critical compliance requirement.
- **Bulk import capability:** Rather than processing one order at a time, agents can upload hundreds of orders via Excel in a single transaction, with row-level validation feedback — a major productivity multiplier.
- **Progressive feature delivery:** The enhanced order search was delivered behind a feature flag, allowing the team to safely test a new search capability in production with a controlled rollout before full release.
- **Full-stack ownership:** Unlike the other projects, this one includes both a frontend MFE and a dedicated backend API, meaning the team owns the full vertical slice of the feature surface.
- **Risk management:** Input validation with Zod on every API endpoint protects the system from invalid data entering the database — important when agents are performing high-impact mutations on live data.

---

## 3. Membership Management

### Business Overview

Membership Management is a **customer-facing microfrontend** that allows Bell customers to link, manage, and earn points through third-party loyalty programs — most prominently **Aeroplan**. It sits within the subscription management experience and represents a strategic partnership between Bell and loyalty partners, enabling Bell to offer differentiated value to customers by integrating rewards into the telecom experience.

The product helps Bell increase customer stickiness: customers who link their Aeroplan account are more engaged and less likely to churn, as they have an additional incentive tied to their Bell account.

### Key Features & User Journeys

- **Membership Overview** — customers see all available loyalty programs with their linked/unlinked status displayed as tiles.
- **Link Membership** — a guided flow to input and verify a loyalty program account number (e.g. Aeroplan number), with format validation, T&C acceptance, and error handling.
- **Edit / Remove Membership** — manage an already-linked membership (update or disconnect the loyalty account).
- **Earn Points** — a dedicated link/section guiding customers on how to earn rewards through eligible Bell services.
- **Marketing Tile** — contextual promotional content surfaced to drive awareness of loyalty program benefits.
- **Multi-program support** — architected to support multiple loyalty programs, not just Aeroplan, with program-specific translations and branding.
- **Fraud-resistant data passing** — host platforms do not pass sensitive data as URL query params; instead, they exchange a payload for a one-time token via the Token API, and the MFE retrieves the payload securely.
- **Adobe Analytics tracking** — membership overview and interactions tracked for product insights.

### Technical Overview

| Aspect               | Detail                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**        | Next.js 14 microfrontend                                                                                                                                |
| **Architecture**     | Webpack Module Federation — consumed by Subscription Manager as a remote                                                                                |
| **API Integration**  | REST via local BFF proxy (`/api/membership/`) — abstracts direct calls to the Membership API                                                            |
| **Security Pattern** | Token-based payload exchange — host sends payload to Token API, gets UUID; MFE retrieves payload via BFF using that token. Mitigates query-param fraud. |
| **Type Generation**  | openapi-typescript — TypeScript types auto-generated from the Membership API OpenAPI YAML spec                                                          |
| **State Management** | React Context (app context, link membership context)                                                                                                    |
| **Styling**          | Tailwind CSS                                                                                                                                            |
| **i18n**             | Custom translation hooks; program-specific translation keys for per-loyalty-partner content                                                             |
| **Analytics**        | Adobe Analytics / Omniture                                                                                                                              |
| **Testing**          | Jest                                                                                                                                                    |
| **CI/CD**            | Dockerised; multi-env builds                                                                                                                            |

### Talking Points for Interview

- **Strategic partnership product:** This MFE is the technical expression of a commercial partnership between Bell and loyalty partners (Aeroplan). You were responsible for delivering a feature that directly supports customer retention and commercial agreements.
- **Security-first design:** The token-based payload exchange pattern was a deliberate product/architecture decision to avoid exposing customer data in URLs — a security and privacy requirement that shaped the integration design.
- **Composable microfrontend architecture:** The Membership MFE is loaded remotely inside the Subscription Manager at runtime using Module Federation — this allows the two teams to develop and deploy independently while delivering a seamless UX to the customer.
- **Multi-partner extensibility:** The architecture was designed to support multiple loyalty programs with per-program branding and translations — not just Aeroplan — demonstrating forward-thinking product design.
- **OpenAPI-driven development:** Type generation from the OpenAPI spec creates a contract between the frontend and backend, catching integration issues at compile time rather than in production.

---

## 4. Promocode Lookup

### Business Overview

Promocode Lookup is an **internal agent-facing tool** that allows Bell's sales and support agents to search for and inspect promotional codes. Agents use it to verify whether a promo code is valid, what offers it unlocks, whether it has been redeemed, and how many times it has been used — enabling faster and more accurate customer support around promotions and discount offers.

The tool supports multiple Bell brands (Bell, Virgin Plus, etc.) from a single codebase, with the active brand determined dynamically from the URL path.

### Key Features & User Journeys

- **Promo Code Search** — agents enter a promo code and retrieve its details: validity, expiry, associated offers, and cap limits.
- **Promo Code Details** — display structured information about the promotion including code type (generic vs. unique), offer details, and associated product offering IDs.
- **Offer Listings** — show the specific product offers unlocked by the promo code.
- **Redemption Data** — if the `ENABLE_REDEEMED_COMPONENT` flag is on and the code is a non-generic type, display who redeemed it and when.
- **Cap Limit Display** — feature-flagged (`capLimitLookupTool`) to show the usage cap limit of a promo code, helping agents understand inventory and availability.
- **Expiry Handling** — codes past their expiry date are identified and handled gracefully with appropriate messaging.
- **Multi-brand support** — the `[brand]` dynamic route param drives brand-specific theming and configuration (Bell, Virgin, etc.).
- **Language toggle** — configurable EN/FR language support via `ENABLE_LANGUAGE_TOGGLE` env flag.
- **Back to Search navigation** — stateful navigation allowing agents to return to their previous search context.

### Technical Overview

| Aspect                | Detail                                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Framework**         | Next.js 14 microfrontend                                                                                                |
| **Architecture**      | Dynamic route `[brand].tsx` — single page supports all brand surfaces                                                   |
| **API Integration**   | REST via `useFetch` hook — three APIs: Promocode API, Catalog API (offering details), Redemption API                    |
| **Feature Flags**     | OpenFeature (`capLimitLookupTool`) + environment variable flags (`ENABLE_REDEEMED_COMPONENT`, `ENABLE_LANGUAGE_TOGGLE`) |
| **State Management**  | Local React state (`useState`) — self-contained component                                                               |
| **Styling**           | Tailwind CSS                                                                                                            |
| **i18n**              | Shared translation utilities from `@packages/utils`; supports EN and FR                                                 |
| **Shared Components** | Consumes `@packages/components` — `PromocodeDetails`, `PromocodeSearch`, `PromocodeOffers` shared across the monorepo   |
| **Theme**             | `@packages/theme` — ThemeProvider used to apply brand-level theming                                                     |
| **Testing**           | Jest                                                                                                                    |
| **CI/CD**             | Dockerised                                                                                                              |

### Talking Points for Interview

- **Agent productivity tool:** By giving agents a fast, accurate way to look up promo code status, the tool reduces handle time on promotional support calls and minimises agent error when applying or explaining discounts to customers.
- **Multi-brand single codebase:** One application serves all Bell brands by using a dynamic route parameter — this is a cost-efficient architectural decision that reduces duplication and keeps promotional tooling consistent across brands.
- **Feature flag-driven iteration:** New capabilities (cap limits, redemption data) are delivered behind feature flags and environment variables, enabling safe experimentation and phased rollout without branch deployments.
- **Monorepo shared components:** Key UI components (`PromocodeDetails`, `PromocodeSearch`, `PromocodeOffers`) are published in the shared `@packages` workspace and consumed here — demonstrating the value of the monorepo architecture in accelerating development and maintaining design consistency.
- **Expiry and cap handling:** Handling edge cases like expired codes and cap-limited promotions cleanly in the UI reduces agent confusion and prevents incorrect commitments to customers.

---

## 5. Catalog Management

### Business Overview

Catalog Management is an **internal admin microfrontend** used by Bell's marketing and product teams to manage the full product catalogue — the master data layer that defines what Bell sells, at what price, and under what conditions. This includes product offerings, promotions, promotion groups, pricing, categories, stackability rules, and offer keys. Any subscription or promotional offer visible to customers traces its origin back to configuration made in this tool.

Without a reliable catalog management system, incorrect or inconsistent product data would flow downstream to customer-facing channels, causing pricing errors, eligibility mismatches, and billing issues.

### Key Features & User Journeys

- **Product Offering Management** — search, view, create, edit, expire, and cancel product offerings; confirmation modals with success/error banners.
- **Promotions Management** — manage promotion specifications that apply to product offerings; expire and cancel workflows with state management.
- **Categories** — browse and manage product categories that organise the catalogue structure.
- **Prices** — manage pricing data associated with product offerings.
- **Promotion Groups** — group related promotions for coordinated management.
- **Stackability Rules** — define which promotions or products can be combined (stacked) on a customer's account.
- **Offer Keys** — manage unique offer identifiers used across ordering systems.
- **Product Specifications** — detailed product attribute management.
- **Enhanced Info** — supplemental product information for downstream systems.
- **Group Criteria** — criteria management for offer group eligibility.
- **NM1 Translation** — manage translations for NM1 downstream system compatibility.
- **Role-based access** — admin actions gated by user roles; UPM success banners for cross-system feedback.

### Technical Overview

| Aspect               | Detail                                                           |
| -------------------- | ---------------------------------------------------------------- |
| **Framework**        | Next.js 14 microfrontend                                         |
| **API Layer**        | GraphQL — queries/mutations for product offerings and promotions |
| **Data Fetching**    | Custom `useFetch` hook consuming GraphQL endpoints               |
| **State Management** | Local React state; client-side filtering and sorting utilities   |
| **Styling**          | Tailwind CSS                                                     |
| **i18n**             | Translation context provider with local JSON files               |
| **Testing**          | Jest                                                             |
| **CI/CD**            | Dockerised; multi-env builds                                     |

### Talking Points for Interview

- **Single source of truth:** The catalog is the foundational data layer — every promotion, product, and price that flows to customer-facing apps originates here. Data quality in this tool directly impacts revenue and customer experience.
- **Complex data relationships:** Managing stackability rules and promotion groups requires understanding of business eligibility logic — the PM role here demands close collaboration between product, marketing, and technical teams.
- **Expire vs. cancel workflows:** The distinction between expiring (time-based deactivation) and cancelling (immediate deactivation) a product or promotion reflects real business rules around contractual obligations and system downstream impacts.
- **GraphQL-driven:** The shift to GraphQL enables the frontend to request exactly the data it needs, reducing over-fetching in what could be a very large product catalogue.

---

## 6. Contract Manager

### Business Overview

Contract Manager is an **internal admin microfrontend** for managing Bell's wireline customer contracts. It allows authorised teams to view, create, edit, and track the lifecycle of customer contracts — including contract terms, exclusions, province eligibility, disconnect reasons, and full contract history. This tool ensures that contract data is accurately managed and auditable, which is critical for compliance, billing accuracy, and dispute resolution.

### Key Features & User Journeys

- **Contract Summary** — searchable list of all contracts with filtering and pagination; entry point for all contract operations.
- **Contract Details** — full detail view of an individual contract including terms, status, province coverage, and linked offers.
- **Create Contract** — guided form to create a new wireline contract with all required fields.
- **Edit Contract** — modify an existing contract's properties with validation.
- **Contract Exclusion** — manage exclusions that apply to a contract (product/service types excluded from coverage).
- **Contract History Details** — full audit trail of changes made to a contract over time.
- **Disconnect Reasons** — manage the reference list of reasons used when a contract is disconnected.
- **Provinces** — manage province eligibility settings for contracts.
- **Bilingual support** — full EN/FR rendering based on host language passed as prop.

### Technical Overview

| Aspect               | Detail                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Framework**        | Next.js 14 microfrontend                                                                                                                         |
| **Architecture**     | Webpack Module Federation — consumed by the Promocodes App Enhancement host as a remote (`FederatedCatalogManager` / `FederatedContractManager`) |
| **API Integration**  | REST via TanStack Query; communicates with the `contract-management-api` GraphQL backend                                                         |
| **State Management** | TanStack Query v5 (server state); local React state for UI                                                                                       |
| **Styling**          | Tailwind CSS                                                                                                                                     |
| **i18n**             | Shared translation utilities from `@packages/utils`; host passes `hostLanguage` prop                                                             |
| **Testing**          | Jest, Playwright (E2E)                                                                                                                           |
| **CI/CD**            | Dockerised; multi-env builds                                                                                                                     |

### Talking Points for Interview

- **Compliance and audit:** Contract management requires a full audit trail — the history view and field-level logging ensure that any change to a customer contract is traceable, which is essential for regulatory compliance and dispute resolution.
- **Federated deployment:** This MFE is loaded remotely into the Promocodes App Enhancement host, meaning it was developed and tested independently but integrates seamlessly at runtime — a strong example of the microfrontend pattern delivering team autonomy.
- **Domain complexity:** Wireline contracts involve province eligibility, ETF calculations, duration, exclusions, and offer linking — a rich domain that requires a PM to deeply understand business rules before writing requirements.

---

## 7. Policy Rules

### Business Overview

Policy Rules is an **internal admin microfrontend** for managing the business rules that govern promotional and product eligibility decisions. These rules act as guardrails that determine who qualifies for a given promotion, under what conditions, and for how long. By centralising rule management in a dedicated tool, Bell's marketing and operations teams can modify eligibility logic without requiring code changes, enabling faster promotional campaign execution.

### Key Features & User Journeys

- **Rules Summary** — paginated, searchable table of all policy rules with status filtering (active, expired, cancelled).
- **Rule Detail** — view full detail of a rule including its parameters, conditions, and status.
- **Create Rule** — form-driven workflow to define a new policy rule with its eligibility parameters.
- **Rule Parameters** — manage the parameter definitions that rules can reference.
- **Expire / Cancel Rule** — lifecycle management for rules; confirmation modals and status banners.
- **AI-Powered Search** — an `useAISearch` hook enables natural language querying of rules, allowing non-technical users to find rules by intent rather than exact field matching.
- **Role-based access** — reader, editor, and admin roles with environment-scoped permissions (dev vs. prod).

### Technical Overview

| Aspect               | Detail                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| **Framework**        | Next.js 14 microfrontend                                                                                |
| **Architecture**     | Webpack Module Federation — consumed by Promocodes App Enhancement as a remote (`FederatedPolicyRules`) |
| **API Integration**  | REST via `useFetch` hook and TanStack Query                                                             |
| **AI Search**        | Custom `useAISearch` hook — natural language search over rules data                                     |
| **State Management** | TanStack Query; local React state for table/search/filter state                                         |
| **Styling**          | Tailwind CSS                                                                                            |
| **i18n**             | Translation context; host passes `hostLanguage`, `userRoles`, `currentEnv` props                        |
| **Testing**          | Jest, Playwright (E2E)                                                                                  |
| **CI/CD**            | Dockerised; multi-env builds                                                                            |

### Talking Points for Interview

- **Configuration over code:** By externalising business rules into a managed system, Bell can launch or modify promotional eligibility criteria without a software release — a significant reduction in time-to-market for campaigns.
- **AI-assisted usability:** The AI search capability is a meaningful UX enhancement for non-technical administrators who need to find rules by describing intent ("rules for new internet customers in Ontario") rather than using structured query filters.
- **Role + environment scoping:** Separating prod vs. non-prod roles means a rules editor can safely work in lower environments without the risk of accidentally modifying production rules — a governance requirement in a regulated environment.

---

## 8. Flow Configurator

### Business Overview

Flow Configurator is a **visual workflow builder** that allows users to compose multi-step automated processes using a drag-and-drop node canvas. It is built on the ReactFlow (XYFlow) library and provides a low-code interface for assembling workflows from a catalogue of typed nodes (input, conditional, API call, output). The project is in early-stage / POC phase but represents the foundation for a capability that could allow business teams to define automated flows without engineering intervention.

### Key Features & User Journeys

- **Node Canvas** — a pannable, zoomable canvas where users assemble workflow graphs by connecting nodes.
- **Node Catalog** — a scrollable sidebar of draggable node types categorised by function.
- **Node Types** — `input` (data entry), `conditional` (branching logic), `api` (external call), `output` (result action).
- **Drag-and-drop** — nodes are dragged from the catalog onto the canvas and connected via edges.
- **Form-driven node configuration** — each node type has its own configuration panel (react-hook-form).
- **Workflow serialisation** — nodes and edges represented as typed graph data for persistence or execution.
- **Template system** — `SimpleFormTemplate` defines the available node types and their default configurations.

### Technical Overview

| Aspect               | Detail                                                                             |
| -------------------- | ---------------------------------------------------------------------------------- |
| **Framework**        | Next.js 14                                                                         |
| **Graph Engine**     | @xyflow/react (ReactFlow) — the industry-standard React library for node-based UIs |
| **Forms**            | react-hook-form + FormProvider for node configuration panels                       |
| **Styling**          | Tailwind CSS, shadcn/ui components (`ScrollArea`, `Button`)                        |
| **State Management** | Local React state; ReactFlow manages node/edge state                               |

### Talking Points for Interview

- **Low-code vision:** The long-term goal is to give non-engineers a way to build and modify automated processes — a capability that reduces dependency on development teams for workflow changes.
- **Extensible node model:** The typed node catalog (input, conditional, API, output) provides a composable building block system that can be extended with new node types as requirements grow.
- **Early-stage management:** Managing a POC/early-stage product means defining a clear graduation criteria — when does it move from POC to production? What are the MVP feature requirements? This is a PM conversation about investment vs. value.

---

## 9. SM Contingency Container (Shell)

### Business Overview

SM Contingency Container is the **unified shell / dashboard application** that serves as the entry point for all of Bell's contingency management tooling. Rather than navigating to separate applications, agents log in once and are presented with a dashboard of tool cards — each linking into the appropriate capability (subscribers, orders, product offerings, promotions, transactions, subscription order import). It handles authentication, role-based access, and acts as the host for the Contingency Management MFE features.

This shell architecture means Bell can add new operational tools to the dashboard without changing the underlying MFEs — it is an organisational and navigational layer.

### Key Features & User Journeys

- **Dashboard** — a responsive grid of tool cards, each with an icon, title, description, and direct navigation link.
- **Tool Cards** — Subscribers, Orders, Product Offerings, Promotions, Transactions, Subscription Order Import.
- **Super-User Role** — only super-users see the "Subscription Order Import" card, restricting bulk import access.
- **Authentication** — full auth flow (`WithAuth` HOC); agents must be authenticated to access any tool.
- **Navigation** — consistent sidebar/header layout for all contingency management tools.
- **Translations** — bilingual support for all dashboard text.

### Technical Overview

| Aspect              | Detail                                                                          |
| ------------------- | ------------------------------------------------------------------------------- |
| **Framework**       | Next.js 14 (shell/container application)                                        |
| **Architecture**    | Webpack Module Federation host — routes agents into individual MFE capabilities |
| **Auth**            | `WithAuth` HOC wrapping all protected pages                                     |
| **Role Management** | `useIsSuperUser` hook for fine-grained feature access                           |
| **Styling**         | Tailwind CSS (Bell brand colours — `bg-medium-blue`)                            |
| **i18n**            | Translation context                                                             |
| **Testing**         | Jest                                                                            |
| **CI/CD**           | Dockerised; multi-env builds                                                    |

### Talking Points for Interview

- **Shell as a product:** The container itself is a product decision — rather than siloed tools, agents get a single authenticated experience. This reduces login friction and makes it easier to onboard new agents.
- **Role-based dashboard:** Surfacing different tools to different roles (super-user vs. standard agent) keeps the UI focused and reduces the risk of agents performing actions outside their authorised scope.
- **Platform extensibility:** Adding a new operational tool requires adding one card configuration — the shell architecture means the container grows with the capability portfolio without architectural changes.

---

## 10. Contingency Management API

### Business Overview

The Contingency Management API is the **dedicated backend service** that powers the Contingency Management MFE. It manages the data persistence, business logic, and state transitions for failed subscription orders, transactions, bulk imports, and associated audit logs. It is the authoritative source of truth for the operational status of subscription orders that have failed or require agent intervention.

### Key Features

- Orders retrieval by ID, subscriber ID, and billing account number
- Full transaction lifecycle: create, read, update, paginated listing, status filtering, history per order
- Transactional orders (linking transactions to underlying orders)
- Bulk order import: file upload, validation, processing, result tracking
- Pending transactions queue
- Field audit log recording all field-level changes
- State machine validation: prevents invalid transaction status transitions

### Technical Overview

| Aspect            | Detail                                                                |
| ----------------- | --------------------------------------------------------------------- |
| **Runtime**       | Node.js / Express                                                     |
| **Database**      | PostgreSQL via Drizzle ORM                                            |
| **Validation**    | Zod — all query params and request bodies validated at API boundaries |
| **File Handling** | Formidable — multipart file upload                                    |
| **State Machine** | Custom validator for transaction state transitions                    |
| **DTOs**          | Structured response transformation layer                              |
| **Testing**       | Jest                                                                  |
| **CI/CD**         | Dockerised; Drizzle migrations run as part of deployment              |

### Talking Points for Interview

- See **Contingency Management MFE** section — the API and MFE are a vertically integrated product owned by the same team.

---

## 11. Contract Management API

### Business Overview

The Contract Management API is the **GraphQL backend** for the Contract Manager MFE. It manages the persistence and retrieval of Bell's wireline customer contracts, including contract types, terms, exclusions, capabilities, and province eligibility. The GraphQL-first design replaced earlier REST endpoints, providing a flexible query interface that supports the complex, nested data structures contracts require.

### Key Features

- Full CRUD for contracts and contract types via GraphQL mutations/queries
- Contract type schema: duration, price protection, ETF (Early Termination Fee) cap/value/calculation, province, LOBs, offer IDs, exclusions, capabilities
- Bilingual descriptions (EN/FR) stored per contract type
- Drizzle ORM for type-safe schema migrations

### Technical Overview

| Aspect         | Detail                                             |
| -------------- | -------------------------------------------------- |
| **Runtime**    | Node.js / Express                                  |
| **API**        | GraphQL (`POST /graphql`) — REST routes deprecated |
| **Database**   | PostgreSQL via Drizzle ORM                         |
| **Validation** | Zod schema validators                              |
| **Testing**    | Jest                                               |
| **CI/CD**      | Dockerised                                         |

### Talking Points for Interview

- **GraphQL migration:** The decision to deprecate REST in favour of GraphQL reflects a maturity shift — the contract domain has deep nested types (exclusions, capabilities, descriptions) that benefit from GraphQL's ability to query exactly the shape needed.
- **ETF management:** Early Termination Fees are a legally mandated construct in telecom contracts — the API correctly models ETF cap, value, and calculation method as first-class fields, showing domain knowledge baked into the data model.

---

## 12. UPM API

### Business Overview

The UPM API (Unified Promo Management API) is a **backend service** that manages channel data — the sales channels and ordering systems through which Bell distributes promotional offers. It provides a paginated, searchable API for channel records, used by both internal tools and downstream systems that need to know which channels are available for a given promotion or product.

### Key Features

- Retrieve all channels (paginated, up to 100 per page)
- Retrieve channel by ID
- Retrieve channels by multiple IDs in a single call
- Retrieve channel by name
- Rate limiting on all channel endpoints

### Technical Overview

| Aspect            | Detail                                                         |
| ----------------- | -------------------------------------------------------------- |
| **Runtime**       | Node.js / Express                                              |
| **Database**      | PostgreSQL via Drizzle ORM                                     |
| **Rate Limiting** | Per-endpoint rate limiter middleware                           |
| **Validation**    | Input validation in controller layer                           |
| **Routes**        | `/api/channels` — GET /, `/id/:id`, `/ids/:ids`, `/name/:name` |
| **CI/CD**         | Dockerised                                                     |

### Talking Points for Interview

- **Data integrity at the distribution layer:** Channels are a foundational reference entity — if a channel is missing or misconfigured, promotions cannot be correctly targeted, causing revenue loss or incorrect billing. This API ensures channels are always available and consistent.
- **Rate limiting as a product requirement:** Protecting the API with rate limiting is not just a technical concern — it prevents accidental bulk reads from impacting database performance during peak promotional periods.

---

## 13. Agent Crew API

### Business Overview

The Agent Crew API is an **AI-powered backend** that provides a multi-agent system for automated production issue triage and resolution. It uses specialised AI "crews" — coordinated groups of agents — to analyse incoming production incidents, identify root causes, generate resolution plans, and execute remediation commands. The goal is to reduce mean time to resolution (MTTR) for production incidents by automating the first-response analysis and suggesting (or automatically executing) corrective actions.

### Key Features

- **Triage Crew** — two specialised agents: RootCauseAnalystAgent (pattern matching + LLM analysis) and ActionPlanCreatorAgent (LLM-powered plan with priorities, owners, timeframes).
- **Execution Crew** — automated command execution from resolution plans with dry-run safety mode.
- **Pattern Matching** — knowledge-base pattern matching for known issue types; LLM fallback for novel issues.
- **CrewRegistry** — self-registering crew pattern with dynamic endpoint generation; no hardcoded crew names.
- **Safety First** — dry-run mode for destructive operations; danger detection heuristics.

### Technical Overview

| Aspect             | Detail                                                            |
| ------------------ | ----------------------------------------------------------------- |
| **Runtime**        | Node.js / TypeScript                                              |
| **AI**             | LLM-powered agents with configurable role, goal, and backstory    |
| **Architecture**   | CrewRegistry pattern — self-registering, dynamically routed crews |
| **Knowledge Base** | Pattern matching against stored knowledge for common issue types  |
| **Safety**         | Dry-run mode, danger detection                                    |
| **CI/CD**          | Dockerised                                                        |

### Talking Points for Interview

- **AI in operations:** This is a next-generation operational tool — rather than agents manually diagnosing issues, AI crews perform the first layer of analysis and provide structured resolution plans, freeing human engineers for higher-order problem-solving.
- **Safety by design:** The dry-run mode and danger detection are deliberate product decisions — in production, automated command execution must be fail-safe. Executing the wrong command on a live system could cause an outage.
- **Extensibility through registry:** The CrewRegistry pattern means new specialised crews can be added without changing the routing or server code — a scalable architecture for growing the AI capability portfolio.

---

## 14. Agent LangGraph API

### Business Overview

The Agent LangGraph API is an **advanced AI workflow engine** built on the LangGraph state machine framework. It powers complex, multi-step AI workflows with conditional routing, human-in-the-loop (HITL) approval gates, and integration with multiple LLM providers. It connects Bell's internal self-hosted vLLM infrastructure, Ollama for local development, and cloud providers (OpenAI, Anthropic) as fallbacks — giving the team model flexibility and cost control. RAG (Retrieval-Augmented Generation) via AWS Bedrock integrates internal knowledge bases into AI responses.

### Key Features

- **LangGraph Workflows** — state machine workflows with conditional routing and HITL approval gates
- **Multi-Model Support** — vLLM (self-hosted reasoning + lightweight), Ollama (local/offline), OpenAI, Anthropic
- **Human-in-the-Loop (HITL)** — DynamoDB-based approval workflows with a web UI and REST API for human review before critical AI actions
- **RAG** — AWS Bedrock Knowledge Base integration for context-aware, document-grounded responses
- **Crew API Integration** — connects to Agent Crew API for production incident triage and resolution
- **LangGraph Studio** — visual workflow development and debugging

### Technical Overview

| Aspect             | Detail                                        |
| ------------------ | --------------------------------------------- |
| **Runtime**        | Node.js / TypeScript (Node 20+)               |
| **Framework**      | LangGraph state machine                       |
| **Models**         | vLLM (self-hosted), Ollama, OpenAI, Anthropic |
| **Approval Store** | AWS DynamoDB — persists HITL approval state   |
| **RAG**            | AWS Bedrock Knowledge Base                    |
| **CI/CD**          | Dockerised                                    |

### Talking Points for Interview

- **Responsible AI deployment:** The HITL pattern ensures that high-stakes AI actions require human sign-off before execution — a critical governance mechanism when AI is operating on production infrastructure.
- **Multi-model strategy:** Supporting multiple LLM providers is a cost and resilience strategy. Self-hosted vLLM reduces cloud spend for high-volume inference; cloud providers serve as fallback when local capacity is constrained.
- **RAG for enterprise knowledge:** Connecting the AI to Bell's internal knowledge bases via Bedrock means responses are grounded in Bell-specific context — not just generic model knowledge — significantly improving accuracy for internal use cases.

---

## 15. MCP API

### Business Overview

The MCP API (Model Context Protocol API) is a **specialised backend** that enables AI agents and tools to safely query Bell's production databases using the Model Context Protocol standard. By exposing a restricted, read-only SQL execution interface, it allows AI assistants (including GitHub Copilot, Claude Desktop, and internal agents) to answer questions about live data without requiring direct database access. This is a key infrastructure component of Bell's AI toolchain.

### Key Features

- Read-only SQL query execution (SELECT, WITH, SHOW, DESCRIBE, EXPLAIN only — no mutations)
- PostgreSQL connection pooling
- Tools discovery endpoint (lists available MCP tools)
- Health check endpoint
- CORS enabled

### Technical Overview

| Aspect       | Detail                                                         |
| ------------ | -------------------------------------------------------------- |
| **Runtime**  | Node.js / TypeScript                                           |
| **Protocol** | Model Context Protocol (MCP)                                   |
| **Database** | PostgreSQL (read-only)                                         |
| **Safety**   | SQL statement type validation — only read operations permitted |
| **CI/CD**    | Dockerised                                                     |

### Talking Points for Interview

- **AI-safe data access:** The MCP API is the bridge between AI tools and production data. By enforcing read-only access and validating SQL statement types, it enables AI-assisted analytics without the risk of accidental data mutation.
- **Standardised AI tooling:** MCP is an emerging standard for AI-tool integration. Adopting it early positions Bell's AI capabilities for seamless integration with a growing ecosystem of AI assistants and agents.

---

## 16. Rules MCP Server

### Business Overview

The Rules MCP Server is a **production-grade Model Context Protocol server** that provides AI tools and agents with structured access to database schema and data. While the MCP API focuses on raw SQL execution, this server exposes higher-level, purpose-built tools (list tables, describe table, get stats) with dual transport support — both stdio (for local AI tools like Claude Desktop) and HTTP/SSE (for remote integrations). It also provides pre-built prompts that guide AI models in schema analysis, query construction, and data exploration.

### Key Features

- `query` — read-only SQL execution
- `list_tables` — list all tables in a schema
- `describe_table` — column information for a specific table
- `get_table_stats` — row counts and size statistics
- Resources: server info, database connection status
- Pre-built prompts: schema analysis, query assistant, data exploration guide
- Dual transport: stdio (local) + HTTP/SSE (remote)
- Docker-ready with health checks

### Technical Overview

| Aspect        | Detail                                                             |
| ------------- | ------------------------------------------------------------------ |
| **SDK**       | Official `@modelcontextprotocol/server` TypeScript SDK (v1.27.1)   |
| **Transport** | Dual — stdio for local tools (Claude Desktop), HTTP/SSE for remote |
| **Database**  | PostgreSQL (read-only)                                             |
| **CI/CD**     | Dockerised                                                         |

### Talking Points for Interview

- **Developer productivity:** Pre-built prompts for schema analysis and query assistance dramatically reduce the time a developer spends understanding an unfamiliar database — the AI can answer "what tables exist and what do they contain?" in seconds.
- **Dual transport design:** Supporting both stdio and HTTP/SSE means the same server works for local developer workflows (Claude Desktop) and remote integrations (web-based AI agents) — maximising reuse.

---

## 17. Rule Builder (Standalone + POC)

### Business Overview

Rule Builder is an **AI-assisted rule authoring tool** that allows non-technical users to create, test, and manage business rules through a conversational and visual interface. The standalone version (`standalone/rule-builder-ui`) is a production-grade application with an AI orchestrator, vector database, and Playwright-based test automation. The POC (`poc/rule-builder`) is an earlier exploration of the concept. Together, they represent Bell's investment in democratising rule authoring — enabling business analysts to define logic without writing code.

### Key Features

- **AI Orchestrator** — an AI agent that assists users in authoring rules through natural language
- **Vector Database** — stores rule context for AI retrieval and similarity search
- **Playwright Agent Runner** — automated test execution driven by AI
- **Task execution** — AI executes tasks from sample task definitions
- **Server + UI** — Express server + Vite-based frontend
- **Failure caching** — failed tasks cached to avoid re-running known failures

### Technical Overview

| Aspect       | Detail                                     |
| ------------ | ------------------------------------------ |
| **Frontend** | Vite + React                               |
| **Backend**  | Node.js / Express                          |
| **AI**       | AI orchestrator with vector DB integration |
| **Testing**  | Playwright (AI-driven agent runner)        |
| **CI/CD**    | Dockerised                                 |

### Talking Points for Interview

- **Democratising rule authoring:** The business case is reducing the engineering bottleneck for rule changes. If a business analyst can author and test a rule via a conversational AI, the time from business decision to production rule drops from days to hours.
- **AI-driven testing:** The Playwright agent runner is a novel approach — using AI to generate and execute test scenarios rather than hand-coding test scripts. This is a forward-looking investment in test automation efficiency.

---

## 18. Promocodes App Enhancement (UPCM Dashboard)

### Business Overview

Promocodes App Enhancement — also referred to as the **UPCM (Unified Promo Code Management) Dashboard** — is the **central command centre** for Bell's promotional code and marketing operations. It is a full-stack application (not just an MFE) that manages the entire lifecycle of promotional codes: from creation and campaign association through to reporting and export to downstream ordering systems.

The platform consolidates multiple capabilities into a single, role-gated portal used by marketing, sales, and operations teams across Bell and its sub-brands (Bell, Virgin Plus, etc.). It is the system of record for all promotional activity and serves as the host that federates other MFEs (Catalog Management, Policy Rules, Contract Manager) into a unified workflow.

### Key Features & User Journeys

- **Promo Code Management** — the core module: create individual promo codes, bulk-create from file, search with advanced filters (status, type, province, brand, campaign, channel, offer, dates, recurrence), view details, compare promo codes, reporting.
- **Campaign Management** — create, edit, and delete marketing campaigns; associate brands, ordering systems, and provinces; manage recurrence and NBA (Next Best Action) code flags.
- **Lookup Tool** — embedded Bell and Virgin lookup tool (federating the `promocode-lookup` MFE) so agents can validate codes without leaving the portal.
- **Catalog Management** — federated view of the Catalog Management MFE for product offering and promotion management (role-gated).
- **Rules Management** — federated view of the Policy Rules MFE (role-gated; separate prod/non-prod role sets).
- **Wireline Contracts** — federated view of the Contract Manager MFE (role-gated).
- **Brands** — manage the master list of Bell brands.
- **Competitors** — manage competitor reference data.
- **Sales Channels** — manage the distribution channels available for promotions.
- **Ordering Systems** — manage the ordering system reference data.
- **Feature Flags** — admin interface for managing feature flag states within the application.
- **Role-based access** — granular role system: Admin, Creator, Reporter, Contract Admin/User, Catalog roles (reader/editor/admin, prod variants), Rules roles (reader/editor/admin, prod variants).
- **Bilingual (EN/FR)** — full French language support via next-translate.
- **Export pipeline** — promo codes have an export status lifecycle (READY_TO_EXPORT → STAGED_REEXPORT → EXPORTED / FAILED / CANCELLED) for downstream system integration.

### Technical Overview

| Aspect              | Detail                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------- |
| **Stack**           | T3 Stack — Next.js + Prisma + tRPC + Tailwind CSS                                        |
| **Database**        | PostgreSQL via Prisma ORM (`marketing` schema)                                           |
| **API Layer**       | tRPC — end-to-end type-safe API; all data calls type-checked from DB to UI               |
| **Auth**            | next-auth — session-based authentication                                                 |
| **Key Data Models** | PromoCode, Campaign, Brand, Channel, Province, OrderingSystem, ExportStatus, Cell, Store |
| **Federation**      | Hosts Catalog Management, Policy Rules, and Contract Manager MFEs via Module Federation  |
| **i18n**            | next-translate — `locales/en` and `locales/fr` JSON namespaces                           |
| **Testing**         | Jest (unit + component), Playwright (E2E)                                                |
| **Code Quality**    | ESLint, Prettier, Husky pre-commit hooks                                                 |
| **CI/CD**           | Dockerised, docker-compose, GitLab CI (`.gitlab-ci.yml`)                                 |
| **DB Tooling**      | Prisma Studio, seed scripts (dev, delete, prod)                                          |

### Data Model Highlights

- **PromoCode** — linked to Campaign, has type (Generic/Unique), status, provinces, export status lifecycle
- **Campaign** — has brands, ordering systems, provinces; supports recurrence, Unica, NBA code flags
- **Brand** — linked to ordering system; has channels and cells
- **ExportStatus** — state machine: READY_TO_EXPORT → STAGED_REEXPORT → EXPORTED / FAILED / CANCELLED

### Talking Points for Interview

- **System of record for promotions:** This is the authoritative platform for all Bell promotional activity. Any promo code a customer receives originates in UPCM — making data accuracy, audit trails, and access control critical requirements.
- **T3 Stack choice:** The T3 Stack (tRPC + Prisma) was chosen for end-to-end type safety — any schema change in the database propagates type errors to the API and UI at compile time, dramatically reducing runtime data bugs.
- **Export lifecycle management:** The READY_TO_EXPORT → EXPORTED state machine is a product design decision that decouples promo code creation from downstream system pushes, allowing marketing to prepare campaigns in advance and release them on a controlled schedule.
- **Federation hub:** Rather than building separate portals for catalog, rules, and contracts, UPCM acts as the hub that federates those capabilities — reducing context-switching for internal teams and enabling cross-functional workflows within a single authenticated session.
- **Granular RBAC:** The role system distinguishes between prod and non-prod environments for sensitive roles (catalog admin, rules admin) — this is a governance control that prevents accidental prod changes while allowing full dev/test access.
- **Bilingual by design:** All promotional content (codes, campaigns, descriptions) is managed in both EN/FR, reflecting the legal requirement to serve French-speaking Canadian customers.

---

## 19. Cross-Cutting Themes (Monorepo Architecture)

These are themes that span all projects and are worth raising in an interview to demonstrate system-level thinking.

### Business Value

- All 17 node-mono projects live in a **single monorepo** — enabling shared packages (`@packages/components`, `@packages/types`, `@packages/utils`, `@packages/hooks`) to be reused across all MFEs, reducing development time and ensuring consistency.
- The **microfrontend architecture** (Module Federation) allows individual product teams to deploy independently, reducing coordination overhead and release risk.
- **Feature flags** (Unleash / OpenFeature) are used universally, enabling the organisation to decouple deployment from release — a critical capability for a large-scale telco with complex change management requirements.
- The **AI capabilities** (Crew API, LangGraph API, MCP API, Rules MCP Server, Rule Builder) represent a deliberate investment in reducing operational toil and enabling intelligent automation — a strategic differentiator.
- **UPCM (Promocodes App Enhancement)** sits outside the monorepo but federates several node-mono MFEs, making it the **business operations hub** that ties customer-facing promotions to the internal management toolchain.

### Technical Consistency

| Concern         | Solution Used Across Projects             |
| --------------- | ----------------------------------------- |
| Framework       | Next.js 14 (all MFEs)                     |
| Styling         | Tailwind CSS                              |
| Type Safety     | TypeScript throughout                     |
| Testing         | Jest (unit), Playwright (E2E on key apps) |
| Code Quality    | ESLint, Prettier                          |
| CI Environments | dev → UAT1–5 → prod pipeline              |
| Containers      | Docker + AWS ECS                          |
| Analytics       | Adobe Analytics / Omniture                |
| Feature Flags   | Unleash + OpenFeature                     |
| Auth            | next-auth (customer/agent flows)          |

### PM/PjM Talking Points

- **Delivery at scale:** Managing 9 concurrent MFEs + 8 backend services in a monorepo means coordinating shared package changes, which requires clear ownership, versioning discipline, and cross-team communication.
- **Two distinct user personas:** Customer-facing products (Subscription Manager, Membership Management) and internal operations tools (Contingency Management, Catalog Management, Contract Manager, Policy Rules, Promocode tools) require entirely different UX standards, success metrics, and stakeholder groups.
- **Risk management:** Feature flags give the team control over production exposure — you can deploy code without releasing it, which is critical when managing delivery timelines under uncertainty.
- **AI strategy:** The suite of AI backends (Crew API, LangGraph, MCP, Rules MCP, Rule Builder) represents a coherent strategy: use AI to assist agents (lookup, rule authoring), automate ops (triage, resolution), and enable data access (MCP) — not just one-off experiments.
- **Technical debt awareness:** The team uses feature flags with TODO comments to track temporary workarounds (e.g., `// TODO: Remove feature flag once HHOREO-5113 backend is stable`) — demonstrating a culture of intentional debt tracking.
- **Bilingual product management:** Delivering a bilingual (EN/FR) product in Canada is a regulatory and business requirement, not optional — managing translation workflows, CMS integration, and URL localisation adds meaningful scope to every feature.
- **Federated MFE governance:** When MFEs are consumed by multiple hosts (UPCM consuming Policy Rules, Catalog, Contracts; Subscription Manager consuming Membership Management), changes to any remote MFE must be backward-compatible — a coordination and versioning challenge that the PM must factor into sprint planning.
