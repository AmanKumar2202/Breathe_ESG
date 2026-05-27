# Breathe ESG — Data Model

## Overview

The core challenge in ESG accounting is not calculating carbon emissions itself. The difficult part is handling operational data coming from different enterprise systems that were never designed to work together.

For this prototype, I designed the backend around a canonical normalized emissions model capable of ingesting heterogeneous source data while preserving traceability, auditability, and review workflows.

The architecture needed to support:

- multi-tenant isolation
- Scope 1 / 2 / 3 classification
- ingestion from multiple source systems
- row-level auditability
- unit normalization
- analyst review workflows
- immutable audit trails
- malformed source handling
- realistic enterprise ingestion behavior

Instead of tightly coupling dashboards and workflows to source-specific schemas, all ingestion pipelines normalize into a single canonical emissions layer.

The ingestion architecture follows this structure:

```text
Raw Source Data
    ↓
Raw Source Tables
    ↓
Validation + Normalization
    ↓
EmissionRecord (Canonical Layer)
    ↓
Review + Audit Workflow
```

This separation became the foundation for the rest of the system.

---

# High-Level Architecture

The backend architecture intentionally separates:

| Layer             | Responsibility                  |
| ----------------- | ------------------------------- |
| Raw Source Models | Preserve original imported data |
| Parser Layer      | Validation + normalization      |
| Canonical Layer   | Standardized emissions records  |
| Workflow Layer    | Review + approval               |
| Audit Layer       | Immutable change history        |

This design was chosen because ESG systems are fundamentally ingestion-heavy and audit-heavy systems rather than traditional CRUD applications.

---

# Core Design Principles

## 1. Canonical Emissions Model

Different systems represent operational activity differently.

Examples:

- SAP procurement exports may use gallons for diesel
- Utility exports may use MWh or therms
- Travel systems may omit distance entirely

If every downstream workflow depended on source-specific schemas:

- dashboards become fragmented
- review workflows become inconsistent
- analytics become difficult to maintain

To avoid this, all ingestion pipelines normalize into:

```text
EmissionRecord
```

which acts as the single source of truth for:

- dashboards
- analyst workflows
- exports
- audit operations
- anomaly detection

This decision significantly simplified downstream logic.

---

## 2. Preserve Raw Imported Data

I intentionally separated:

- raw imported rows
- normalized emissions records

Instead of directly transforming source data into final emissions rows, the system stores raw imports first.

Examples:

- `RawSAPRecord`
- `RawUtilityRecord`
- `RawTravelRecord`

This allows:

- ingestion debugging
- parser improvements
- future recalculation
- audit defensibility
- replayability

In real ESG systems, preserving source-of-truth operational data is extremely important because emission methodologies evolve over time.

Destroying raw imports during normalization would make recalculation difficult later.

---

## 3. Multi-Tenant Isolation

Every major entity is scoped to:

```text
client
```

including:

- emission records
- ingestion jobs
- audit logs
- profiles

This ensures tenant isolation throughout the system.

The application filters data at the ViewSet layer using the authenticated user’s associated client.

This design supports SaaS-style multi-tenant scaling while keeping the implementation relatively simple for a prototype.

---

# Main Models

# Client

Represents a customer organization onboarded into the platform.

### Responsibilities

- tenant boundary
- ownership of records
- ownership of ingestion jobs
- ownership of audit logs
- user organization grouping

All operational records are associated with a client.

This became the primary mechanism for data isolation.

---

# Profile

Extends Django’s built-in User model.

### Fields

| Field  | Purpose            |
| ------ | ------------------ |
| user   | authentication     |
| client | tenant association |
| role   | RBAC               |

### Supported Roles

| Role    | Access           |
| ------- | ---------------- |
| admin   | full access      |
| analyst | review workflows |
| auditor | read-only        |

Role-based permissions are enforced:

- globally through DRF permissions
- locally inside sensitive actions

I intentionally enforced RBAC both globally and locally because analyst workflows are security-sensitive.

---

# IngestionJob

Tracks ingestion lifecycle and processing state.

This model exists because enterprise ingestion pipelines are:

- asynchronous
- failure-prone
- operationally monitored

The frontend analyst dashboard depends heavily on ingestion visibility.

### Important Fields

| Field             | Purpose                                   |
| ----------------- | ----------------------------------------- |
| source_type       | SAP / UTILITY / TRAVEL                    |
| status            | PROCESSING / COMPLETED / FAILED / PARTIAL |
| row_count_success | ingestion metrics                         |
| row_count_failed  | ingestion metrics                         |
| initiated_by      | auditability                              |
| error_log         | malformed row tracking                    |
| started_at        | operational visibility                    |
| completed_at      | operational visibility                    |

---

## Why `error_log` Exists

Real-world ingestion pipelines rarely receive perfectly structured data.

Typical ingestion problems include:

- invalid dates
- inconsistent units
- malformed rows
- unmapped categories
- missing fields

Instead of aborting the entire import:

- individual rows fail
- errors are preserved
- processing continues

This behavior is much closer to how enterprise onboarding workflows operate in practice.

---

# Raw Source Models

# RawSAPRecord

Stores raw ERP fuel and procurement exports.

### Why A Dedicated Raw SAP Table Exists

SAP exports are often operationally messy:

- inconsistent units
- multilingual headers
- ERP-specific field names
- malformed dates
- unclear plant codes

The parser normalizes these inconsistencies into canonical emissions rows while preserving the original raw record.

### Parser Responsibilities

The SAP parser handles:

- German column names
- fuel mapping
- inconsistent units
- malformed dates
- unit normalization

Supported normalization includes:

| Input | Normalized |
| ----- | ---------- |
| GAL   | litres     |
| L     | litres     |
| TO    | kg         |
| M3    | m3         |

---

# RawUtilityRecord

Stores electricity utility exports.

### Why Utility Data Needed Separate Handling

Utility data behaves differently from procurement data.

Real-world utility exports usually contain:

- billing periods
- tariff-aligned consumption
- inconsistent energy units
- non-calendar billing cycles

The parser normalizes all energy usage into:

```text
kWh
```

Supported conversions:

| Input  | Normalized |
| ------ | ---------- |
| MWh    | kWh        |
| GJ     | kWh        |
| therms | kWh        |

---

# RawTravelRecord

Stores travel platform exports inspired by systems like:

- Concur
- Navan

### Why Travel Needed Its Own Parser Logic

Travel data behaves differently from operational procurement data.

Different categories imply different emission logic:

- flights
- hotels
- rail
- taxi
- car rental

Another challenge is that distance is often missing.

To handle this:

- airport codes are mapped to coordinates
- haversine distance is calculated when needed

This was implemented because many real travel systems expose incomplete itinerary-level information.

---

# EmissionRecord (Canonical Model)

This is the most important model in the system.

Each row represents:

```text
one normalized emission event
```

regardless of original source system.

---

# Why I Chose This Structure

I intentionally separated:

- activity data
- emission factors

instead of storing only final CO2 values.

This improves:

- auditability
- explainability
- recalculation ability
- traceability

---

# Activity Data

Represents the operational event itself.

Examples:

- litres of diesel
- kWh of electricity
- km traveled

Stored in:

- `activity_value`
- `activity_unit`

All values are normalized before storage.

---

# Emission Factors

Represents how emissions were calculated.

Stored separately:

- emission_factor
- emission_factor_source
- emission_factor_unit
- calculation_method

This was important because ESG systems frequently update emission methodologies over time.

Separating factors from activity data makes recalculation easier later.

---

## Why Emission Factor Values Are Denormalized

`EmissionRecord` stores the emission factor values directly at ingestion time:

- `emission_factor`
- `emission_factor_source`
- `emission_factor_unit`

instead of storing only a foreign key reference to an `EmissionFactor` table.

This decision was intentional for audit integrity.

In real ESG systems, emission factor databases are updated frequently:

- DEFRA yearly revisions
- EPA methodology changes
- regional grid factor updates
- supplier-specific factor corrections

If historical `EmissionRecord` rows referenced only a live `EmissionFactor` row through a foreign key relationship, future updates to the factor table could silently change:

- calculated emissions
- approved records
- historical reporting outputs

without any operational review.

That would break audit defensibility because previously approved emissions could change retroactively.

By denormalizing the factor value directly into the emission record during ingestion:

- historical calculations remain immutable
- approved records remain reproducible
- audit trails remain stable
- recalculation becomes an explicit operational decision rather than an accidental side effect

This mirrors how many real financial and ESG systems snapshot critical calculation inputs at transaction time.

---

# Source Traceability

Every emission row stores:

- source type
- source row ID
- source model
- ingestion job

This creates a complete audit chain:

```text
Dashboard Metric
→ EmissionRecord
→ Raw Source Row
→ Original Import Batch
```

This level of traceability is extremely important in ESG audit workflows.

---

# Scope Categorization

The system supports:

- Scope 1
- Scope 2
- Scope 3

Examples:

| Source          | Scope   |
| --------------- | ------- |
| fuel combustion | Scope 1 |
| electricity     | Scope 2 |
| travel          | Scope 3 |

The categorization is intentionally explicit inside parser logic rather than inferred dynamically later.

---

# Unit Normalization

One of the major backend concerns was preventing inconsistent calculations caused by heterogeneous units.

All ingestion pipelines normalize units before emissions are calculated.

Normalized values are directly stored in:

- `activity_value`
- `activity_unit`

This avoids downstream ambiguity and prevents recalculation drift.

---

# Review Workflow

Every imported record initially enters the system as:

```text
PENDING
```

Analysts may:

- APPROVE
- FLAG
- REJECT

Approved rows become immutable:

```text
is_locked = True
```

This simulates real ESG audit workflows where finalized records should not silently change after review.

---

# AuditLog

Tracks immutable workflow history.

### Captured Actions

- ingestion started
- ingestion completed
- record edits
- approvals
- rejections
- anomaly flags

### Stored Metadata

| Field          | Purpose                 |
| -------------- | ----------------------- |
| actor          | who performed action    |
| details.before | previous state snapshot |
| details.after  | updated state snapshot  |
| timestamp      | audit trace             |
| notes          | analyst reasoning       |

This allows auditors to reconstruct workflow history later.

AuditLog is append-only by design. No existing log entry is ever updated or deleted.

The `details.before` and `details.after` JSON snapshots allow full reconstruction of any record’s history.

Combined with `is_locked` on approved `EmissionRecord` rows, this creates a two-layer immutability guarantee:

- workflow immutability through append-only logging
- data immutability through record locking

This was intentionally designed to support audit defensibility.

---

# Anomaly Detection

The ingestion layer performs lightweight anomaly detection.

Examples:

- unusually large fuel procurements
- abnormal electricity consumption
- excessive travel emissions

Flagged rows surface directly inside analyst workflows.

I intentionally chose simple rule-based anomaly detection instead of ML-based detection because:

- explainability matters in audit systems
- rule-based systems are easier to defend
- historical training data was unavailable

---

# Scope 3 Limitations

This prototype currently handles only:

```text
Scope 3 Category 6 — Business Travel
```

The following categories are intentionally not modeled:

- Category 1 — Purchased Goods & Services
- Category 2 — Capital Goods
- Category 4 — Upstream Transportation & Distribution
- Category 11 — Use Of Sold Products

For many manufacturing organizations:

```text
Category 1
```

can represent:

```text
60–80% of total Scope 3 emissions
```

Implementing these categories correctly would require:

- spend-based accounting
- supplier mapping
- procurement categorization
- economic intensity datasets
- hybrid calculation methodologies

This was a deliberate scope tradeoff for the assignment and is discussed further in:

```text
TRADEOFFS.md
```

---

# Why UUIDs Were Used

UUIDs were used for:

- EmissionRecord
- ingestion-linked entities

instead of sequential integer IDs.

Reasons:

- safer external APIs
- reduced enumeration risk
- better distributed ingestion compatibility
- more production-oriented architecture

---

# Why This Architecture Fits ESG Systems

Most ESG systems are not traditional CRUD applications.

The difficult parts are:

- ingestion
- normalization
- traceability
- workflow review
- audit defensibility

The architecture prioritizes:

- operational realism
- resilience
- explainability
- analyst workflows
- audit traceability

over abstract theoretical perfection.

That tradeoff was intentional for this assignment.
