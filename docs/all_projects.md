## 1. Skye Bank Plc — Nigeria (Jan 2014 – Feb 2017)

**Role:** Credit Card Services Specialist

**Credit Card Dispute Resolution Workflow Redesign**
Led an informal review of the end-to-end dispute resolution process after noticing that average resolution time exceeded regulatory guidance. Mapped the current-state process, identified three handoff points causing delays, and proposed a revised routing logic. The updated workflow reduced average resolution time and improved customer satisfaction scores.

**Fraud Detection Pattern Analysis**
Compiled and analysed six months of card transaction decline data to identify patterns associated with fraudulent activity. Presented findings to the risk team in a structured memo recommending two new rule categories for the fraud detection engine. Both were implemented in the next quarterly rules update.

**New Co-Branded Card Launch — Operational Readiness**
Supported the operational readiness planning for the launch of a new co-branded credit card. Responsible for documenting operational procedures, identifying gaps between the product design and what the operations team could execute, and coordinating with IT on system parameter changes required before launch day.

**Collections Strategy Pilot**
Worked with the collections team to design and run a 90-day pilot of a tiered early-arrears outreach strategy. Defined customer segments, scripted outreach sequences, tracked roll-rate outcomes, and presented a post-pilot analysis recommending which segments warranted continued investment. The pilot directly informed the bank's revised collections policy.

**Staff Training Programme — Credit Card Products**
Developed a structured 3-hour training module for new operations staff covering credit card product features, processing rules, and common customer scenarios. Delivered the programme to two cohorts and iterated on content based on participant feedback and post-training error rates.

---

## 2. CIBC — Ontario, Canada (Mar 2017 – Dec 2020)

**Role:** Finance Professional

**Client Onboarding Data Quality Project**
Identified recurring data quality issues in client account records that were causing downstream errors in regulatory reporting. Built a structured analysis of error types, their frequency, and root causes. Proposed a validation rule set that was reviewed by the data team and partially implemented in the CRM system, reducing downstream rework.

**Regulatory Reporting Reconciliation Tool**
Built a semi-automated Excel-based reconciliation tool to cross-check monthly regulatory report outputs against source system data. Reduced the time required for the monthly reconciliation check from two days to half a day and eliminated a class of manual errors that had previously required rework before submission.

**Process Documentation for System Migration**
Contributed to an internal initiative to standardise financial reporting workflows ahead of a system migration. Responsible for documenting current-state processes, identifying variations across teams, and producing a standardised template set used as the baseline for the new system's configuration.

**Stakeholder Communication Templates**
Developed standardised communication templates for client correspondence covering the most common account inquiry and compliance scenarios. Templates were reviewed and approved by legal, adopted by the team, and reduced average correspondence drafting time significantly while improving consistency.

**Financial Controls Gap Analysis**
Conducted a structured gap analysis of internal financial controls against updated regulatory requirements. Documented findings, categorised gaps by risk severity, and presented a prioritised remediation plan to the finance team lead — demonstrating the ability to translate compliance requirements into actionable work items.

---

## 3. General Electric (Genpact) — Mississauga, ON (Jan 2018 – Sept 2020)

**Role:** Finance and Operations Analyst

**Finance Process Standardisation Initiative**
Part of a cross-functional team tasked with standardising finance processes across multiple GE business units. Responsible for documenting current-state workflows, identifying process variations, and proposing a unified process model. Delivered process maps and standard operating procedures adopted across the account.

**Month-End Close Optimisation**
Identified inefficiencies in the monthly financial close cycle that were causing recurring delays in reporting. Mapped the end-to-end close process, pinpointed bottlenecks at the reconciliation and approval stages, and proposed a revised sequencing and escalation protocol. The changes reduced average close time and improved on-time reporting rates.

**Accounts Payable Automation Assessment**
Led an assessment of the accounts payable workflow to identify tasks suitable for automation. Produced a prioritised list of automation candidates with estimated effort and value, which was used to inform a technology investment proposal submitted to GE's finance leadership.

**KPI Reporting Dashboard**
Designed and built a management reporting dashboard consolidating key finance metrics across the GE account. Worked with stakeholders to define the right metrics, built the reporting model in Excel, and transitioned it to a shared reporting environment. Dashboard became the standard weekly reporting tool for the account team.

**Vendor Reconciliation Process Redesign**
Identified a recurring source of vendor payment disputes caused by mismatches between purchase orders and invoices. Mapped the root cause to a gap in the three-way matching process. Proposed and documented a revised matching workflow, coordinated with the vendor management team to implement, and tracked error rate reduction over the following quarter.

---

## 4. Canada Revenue Agency — Hamilton, ON (Oct 2020 – Dec 2022)

**Role:** Tax and Compliance Professional

**Digital Filing Initiative — Process Documentation**
Contributed to an internal initiative to improve consistency of audit file documentation ahead of a system migration. Responsible for documenting current-state workflows, identifying variations across audit teams, and producing a standardised template set. Output was used as the baseline for the new digital file management system.

**Tax Compliance Process Mapping**
Mapped the end-to-end workflow for a specific category of corporate tax review, identifying steps where manual data re-entry was occurring unnecessarily. Presented a process improvement proposal to the team lead that eliminated two redundant steps and reduced processing time per file.

**Taxpayer Correspondence Templates**
Developed a set of standardised communication templates for taxpayer correspondence covering the most common audit inquiry scenarios. Templates were reviewed and approved by legal, adopted by the team, and reduced average correspondence drafting time significantly while improving consistency across the department.

**Internal Audit Readiness Review**
Led a readiness review of a portfolio of active audit files to assess compliance with updated documentation standards. Identified files with gaps, coordinated with file owners to remediate before the review deadline, and produced a summary report for the team lead covering risk areas and corrective actions taken.

**Process Improvement Proposal — Audit Triage**
Observed that incoming audit cases were being assigned without a structured triage framework, leading to uneven workload distribution. Drafted a triage framework based on case complexity indicators, presented it to the team supervisor, and piloted it informally on a subset of new cases over a six-week period.

---

## 5. Bell Canada — Mississauga, ON (Jan 2023 – Present)

**Role:** Software Engineer

### Subscription Manager

Subscription Manager is a customer-facing and agent-facing **self-serve widget** that allows Bell customers to manage their telecom and TV subscriptions through digital channels (MyBell web/app). The goal is to reduce call-centre volume by enabling customers to independently add, change, cancel, and upgrade their subscription packages online — improving both customer satisfaction and operational efficiency.

- **Framework:** Next.js 14 (microfrontend, SSR + client-side)
- **Architecture:** Webpack Module Federation — widget exported and consumed by host platforms
- **API Layer:** AWS AppSync (GraphQL) — TanStack Query v5 for data fetching & mutation; codegen for TypeScript types from schema
- **State Management:** React Context (subscriptions, data, flags)
- **Styling:** Tailwind CSS, PostCSS
- **Feature Flags:** Unleash / OpenFeature — used to control new flows (VAS, undo actions, etc.)
- **i18n:** Custom bilingual solution — local JSON files, CMS API integration, rewrite/redirect rules for FR paths
- **Auth:** next-auth + SAML Jackson (BoxyHQ) for agent SSO
- **Testing:** Jest (unit), Playwright (E2E)
- **CI/CD:** Multiple env builds: dev, UAT (1–5), prod; Dockerised; AWS ECS
- **Analytics:** Adobe Analytics / Omniture — custom event tracking utilities

---

### Contingency Management (MFE)

Contingency Management is an **internal operations tooling platform** built for Bell's operations and support teams. Its core purpose is to manage and resolve problematic or failed subscription orders that cannot be processed through the normal automated pipeline. It provides agents with search, investigation, editing, and bulk-import capabilities to deal with order exceptions, transaction failures, and subscriber issues at scale.

- **Frontend:** Next.js 14 microfrontend
- **Backend API:** Node.js / Express — `contingency-management-api`
- **Database:** PostgreSQL via Drizzle ORM (type-safe schema migrations)
- **API Design:** RESTful Express routes: `/orders`, `/transactions`, `/bulkOrders`, `/files`, `/pendingTransactions`, `/transactionalOrders`, `/fieldAuditLogs`
- **Validation:** Zod — strict input/query validation on all API endpoints
- **State Transitions:** Server-side state machine validation for transaction status transitions
- **File Handling:** Formidable — multipart file upload for bulk order import; client-side Excel validation before upload
- **Feature Flags:** Unleash / OpenFeature — e.g. enhanced order search gated behind `enhanced_order_search` flag
- **i18n:** i18next / next-i18next
- **Styling:** Tailwind CSS
- **Testing:** Jest (unit + integration)
- **CI/CD:** Dockerised; multi-env builds; Drizzle migrations as part of deployment

---

### Membership Management

Membership Management is a **customer-facing microfrontend** that allows Bell customers to link, manage, and earn points through third-party loyalty programs — most prominently **Aeroplan**. It sits within the subscription management experience and represents a strategic partnership between Bell and loyalty partners, enabling Bell to offer differentiated value to customers by integrating rewards into the telecom experience.

- **Framework:** Next.js 14 microfrontend
- **Architecture:** Webpack Module Federation — consumed by Subscription Manager as a remote
- **API Integration:** REST via local BFF proxy (`/api/membership/`) — abstracts direct calls to the Membership API
- **Security Pattern:** Token-based payload exchange — host sends payload to Token API, gets UUID; MFE retrieves payload via BFF using that token. Mitigates query-param fraud.
- **Type Generation:** openapi-typescript — TypeScript types auto-generated from the Membership API OpenAPI YAML spec
- **State Management:** React Context (app context, link membership context)
- **Styling:** Tailwind CSS
- **i18n:** Custom translation hooks; program-specific translation keys for per-loyalty-partner content
- **Analytics:** Adobe Analytics / Omniture
- **Testing:** Jest
- **CI/CD:** Dockerised; multi-env builds

---

### Promocode Lookup

Promocode Lookup is an **internal agent-facing tool** that allows Bell's sales and support agents to search for and inspect promotional codes. Agents use it to verify whether a promo code is valid, what offers it unlocks, whether it has been redeemed, and how many times it has been used — enabling faster and more accurate customer support around promotions and discount offers.

- **Framework:** Next.js 14 microfrontend
- **Architecture:** Dynamic route `[brand].tsx` — single page supports all brand surfaces
- **API Integration:** REST via `useFetch` hook — three APIs: Promocode API, Catalog API (offering details), Redemption API
- **Feature Flags:** OpenFeature (`capLimitLookupTool`) + environment variable flags (`ENABLE_REDEEMED_COMPONENT`, `ENABLE_LANGUAGE_TOGGLE`)
- **State Management:** Local React state (`useState`) — self-contained component
- **Styling:** Tailwind CSS
- **i18n:** Shared translation utilities from `@packages/utils`; supports EN and FR
- **Shared Components:** Consumes `@packages/components` — `PromocodeDetails`, `PromocodeSearch`, `PromocodeOffers` shared across the monorepo
- **Theme:** `@packages/theme` — ThemeProvider used to apply brand-level theming
- **Testing:** Jest
- **CI/CD:** Dockerised

---

### Catalog Management

Catalog Management is an **internal admin microfrontend** used by Bell's marketing and product teams to manage the full product catalogue — the master data layer that defines what Bell sells, at what price, and under what conditions. This includes product offerings, promotions, promotion groups, pricing, categories, stackability rules, and offer keys. Any subscription or promotional offer visible to customers traces its origin back to configuration made in this tool.

- **Framework:** Next.js 14 microfrontend
- **API Layer:** GraphQL — queries/mutations for product offerings and promotions
- **Data Fetching:** Custom `useFetch` hook consuming GraphQL endpoints
- **State Management:** Local React state; client-side filtering and sorting utilities
- **Styling:** Tailwind CSS
- **i18n:** Translation context provider with local JSON files
- **Testing:** Jest
- **CI/CD:** Dockerised; multi-env builds

---

### Contract Manager

Contract Manager is an **internal admin microfrontend** for managing Bell's wireline customer contracts. It allows authorised teams to view, create, edit, and track the lifecycle of customer contracts — including contract terms, exclusions, province eligibility, disconnect reasons, and full contract history. This tool ensures that contract data is accurately managed and auditable, which is critical for compliance, billing accuracy, and dispute resolution.

- **Framework:** Next.js 14 microfrontend
- **Architecture:** Webpack Module Federation — consumed by the Promocodes App Enhancement host as a remote
- **API Integration:** REST via TanStack Query; communicates with the `contract-management-api` GraphQL backend
- **State Management:** TanStack Query v5 (server state); local React state for UI
- **Styling:** Tailwind CSS
- **i18n:** Shared translation utilities from `@packages/utils`; host passes `hostLanguage` prop
- **Testing:** Jest, Playwright (E2E)
- **CI/CD:** Dockerised; multi-env builds

---

### Promocodes App Enhancement (UPCM Dashboard)

Promocodes App Enhancement — also referred to as the **UPCM (Unified Promo Code Management) Dashboard** — is the **central command centre** for Bell's promotional code and marketing operations. It is a full-stack application that manages the entire lifecycle of promotional codes: from creation and campaign association through to reporting and export to downstream ordering systems.

- **Stack:** T3 Stack — Next.js + Prisma + tRPC + Tailwind CSS
- **Database:** PostgreSQL via Prisma ORM (`marketing` schema)
- **API Layer:** tRPC — end-to-end type-safe API; all data calls type-checked from DB to UI
- **Auth:** next-auth — session-based authentication
- **Key Data Models:** PromoCode, Campaign, Brand, Channel, Province, OrderingSystem, ExportStatus, Cell, Store
- **Federation:** Hosts Catalog Management, Policy Rules, and Contract Manager MFEs via Module Federation
- **i18n:** next-translate — `locales/en` and `locales/fr` JSON namespaces
- **Testing:** Jest (unit + component), Playwright (E2E)
- **Code Quality:** ESLint, Prettier, Husky pre-commit hooks
- **CI/CD:** Dockerised, docker-compose, GitLab CI
- **DB Tooling:** Prisma Studio, seed scripts
