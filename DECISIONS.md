# DECISIONS.md

# Major Product And Technical Decisions

## Overview

This assignment intentionally involved a large number of ambiguities:
- ingestion format choice
- normalization strategy
- review workflow behavior
- auditability requirements
- error handling philosophy
- emission calculation approach

Instead of attempting to build a feature-heavy CRUD application, I focused on designing a system that reflects the operational realities of ESG onboarding workflows.

This document explains the major architectural and product decisions I made, why I made them, and what tradeoffs were involved.

---

# 1. Canonical Emissions Layer

## Decision

I designed the system around a single normalized emissions model:

```text
EmissionRecord
```

All ingestion pipelines eventually normalize into this model regardless of source system.

---

## Why I Chose This

The three source systems behave fundamentally differently:
- SAP procurement exports
- utility electricity data
- travel platform data

Each source has:
- different schemas
- different units
- different levels of completeness
- different operational semantics

Without normalization:
- dashboards become source-specific
- review workflows become fragmented
- exports become inconsistent
- auditability becomes difficult

A canonical layer simplified:
- frontend analytics
- filtering
- approval workflows
- audit operations

while still preserving source traceability.

---

## Alternative Considered

I considered storing:
- source-specific models only
- source-specific dashboards

but rejected this because:
- it increases frontend complexity
- workflows become duplicated
- analytics logic becomes fragmented

The canonical model approach felt much closer to how production ESG platforms behave.

---

# 2. Preserve Raw Source Rows

## Decision

I intentionally separated:
- raw imported rows
- normalized emissions records

Raw records are preserved in:
- `RawSAPRecord`
- `RawUtilityRecord`
- `RawTravelRecord`

while normalized emissions are stored in:
- `EmissionRecord`

---

## Why I Chose This

In real ESG systems:
- methodologies evolve
- emission factors change
- parser logic changes
- audits require traceability

If normalization destroys original source data:
- recalculation becomes difficult
- audit defensibility weakens
- debugging ingestion problems becomes harder

Preserving raw source rows also made malformed row debugging significantly easier during development.

---

## Alternative Considered

I considered directly transforming source data into final emissions records.

I rejected this because:
- source traceability becomes weak
- debugging becomes painful
- recalculation becomes difficult

For ESG systems specifically, preserving original operational data felt extremely important.

---

# 3. SAP Ingestion Format Choice

## Decision

I chose to model SAP ingestion using flat-file CSV exports inspired by SAP MM procurement exports.

I specifically modeled exports from:

```text
SAP MM transaction MB51
```

which represents:

```text
Material Document List
```

and tracks inventory goods movements.

In manufacturing environments:
- movement types `201` and `261`
- represent goods issue / operational consumption

which is commonly where fuel consumption appears in SAP-based manufacturing workflows.

---

## Why I Chose This

Real SAP integrations are extremely large in scope.

Production implementations often involve:
- IDocs
- BAPIs
- OData services
- middleware systems
- SAP RFC integrations

For a 4-day prototype:
- realistic export handling mattered more
- ingestion normalization mattered more
- parser resilience mattered more

than implementing true SAP connectivity.

CSV exports are still extremely common operationally because many enterprises:
- manually export ERP data
- share flat files internally
- onboard ESG vendors through spreadsheet-based workflows

---

## Realism Choices Included

I intentionally included:
- German field names
- inconsistent units
- malformed dates
- unmapped fuel types
- ERP-style procurement descriptions

because real ERP exports are rarely clean.

---

## What I Explicitly Ignored

I did not attempt to model:
- true SAP authentication
- live SAP synchronization
- IDoc parsing
- middleware orchestration

because those would dominate the entire assignment timeline without improving the core ingestion reasoning.

---

## What I Would Ask The PM

- "Does the client have SAP API credentials, or are we working with manual exports?"
- "Which SAP version — ECC or S/4HANA? This determines OData availability."
- "Are plant codes meaningful to the sustainability team, or do we need a lookup table?"
- "Do movement types differ across plants or subsidiaries?"
- "Are procurement exports already normalized by finance, or should the ESG pipeline handle vendor-specific fuel mappings?"

---

# 4. Utility Data Ingestion Choice

## Decision

I modeled utility ingestion using CSV exports from utility portals.

---

## Why I Chose This

I researched how facilities teams typically manage electricity data operationally.

In practice:
- many utilities still provide portal downloads
- facilities teams often manually upload monthly exports
- CSV workflows are common during ESG onboarding

This felt more realistic than building a mocked utility API.

---

## Important Design Considerations

Utility data behaves differently from procurement data because:
- billing periods do not align to calendar months
- energy units vary
- tariffs vary
- reporting intervals vary

The parser therefore normalizes all energy values into:
- `kWh`

before emissions are calculated.

---

## Alternative Considered

I considered:
- PDF OCR extraction
- utility APIs

but rejected them because:
- OCR becomes its own project
- utility APIs vary heavily by region
- neither improved the core normalization challenge

---

## What I Would Ask The PM

- "Are utility bills uploaded manually or pulled from a utility management platform?"
- "Do we need to support electricity only, or gas/water/steam as well?"
- "Are site names already standardized across facilities?"
- "Should billing periods align to calendar reporting months or invoice cycles?"
- "Do clients expect location-based grid factors or market-based accounting?"

---

# 5. Travel Data Design

## Decision

I used JSON payloads inspired by travel platforms such as:
- Navan
- Concur

---

## Why I Chose This

Travel systems usually expose:
- structured APIs
- categorized activities
- nested itinerary data

JSON allowed me to model:
- flights
- hotels
- taxis
- rail
- rental cars

inside a single ingestion pipeline.

---

## Real API Structures Referenced

Navan exposes expense data through endpoints similar to:

```text
/v1/expenses
```

with fields such as:
- `expense_id`
- `fareClass`
- `originAirportCode`
- `destinationAirportCode`

Concur’s newer REST APIs use similar JSON structures for travel itinerary handling.

The:

```text
fareClass
```

field directly informed the cabin-class emission multipliers used inside the travel parser.

Examples:
- `ECONOMY = 1.0`
- `BUSINESS = 2.9`
- `FIRST = 4.0`

based on DEFRA 2024 aviation methodology guidance.

---

## Important Realism Decision

Many travel systems do not provide exact trip distance.

Often the only available information is:
- airport codes
- origin/destination city

To simulate this:
- I implemented haversine fallback calculation
- airport coordinates are mapped internally
- distance is derived dynamically when missing

This felt significantly more realistic than assuming perfect source data.

---

## What I Would Ask The PM

- "Is the client already using Navan, Concur, or another T&E platform?"
- "Do we need hotel-night emissions or only transportation?"
- "Should cabin class materially affect reporting methodology?"
- "Are canceled trips still included in expense exports?"
- "Do we need employee-level attribution or only aggregate reporting?"

---

# 6. Unit Normalization Before Calculation

## Decision

All activity data is normalized before emissions are calculated.

Examples:
- GAL → litres
- MWh → kWh
- therms → kWh

---

## Why I Chose This

I wanted:
- consistent downstream analytics
- calculation transparency
- reduced ambiguity
- reliable emissions calculations

Storing inconsistent units in canonical records would eventually create:
- reporting inconsistency
- calculation drift
- analyst confusion

Normalization therefore happens during ingestion instead of later during reporting.

---

## What I Would Ask The PM

- "Should the system preserve original units for audit display purposes?"
- "Do clients require both normalized and source-unit reporting?"
- "Which unit standards should be considered authoritative — EPA, DEFRA, or client-specific conventions?"
- "Are there regional measurement formats we should explicitly support?"
- "Should normalization rules be configurable per tenant?"

---

# 7. Row-Level Error Handling

## Decision

Malformed rows fail individually while ingestion continues.

---

## Why I Chose This

Enterprise onboarding workflows almost always contain:
- malformed dates
- inconsistent units
- missing values
- corrupted rows

Aborting the entire ingestion job because of a few bad rows creates poor operational UX.

Instead:
- individual rows fail
- errors are logged
- processing continues

This felt much closer to how real ingestion systems behave operationally.

---

## Resulting Benefits

The ingestion pipeline now supports:
- partial success
- ingestion metrics
- analyst debugging
- operational visibility

through:
- `row_count_failed`
- `row_count_success`
- `error_log`

---

## What I Would Ask The PM

- "What ingestion failure threshold is acceptable before an entire job should fail?"
- "Should analysts be allowed to manually repair malformed rows from the UI?"
- "Do clients require downloadable error reports after ingestion?"
- "Should duplicate rows be treated as warnings or hard failures?"
- "Do malformed rows need long-term retention for compliance purposes?"

---

# 8. Review Workflow Design

## Decision

Imported records initially enter the system as:

```text
PENDING
```

Analysts may:
- approve
- reject
- flag

Approved rows become locked.

---

## Why I Chose This

ESG reporting workflows are review-heavy.

Operational data frequently requires:
- manual inspection
- anomaly review
- analyst signoff
- audit approval

I wanted the prototype to simulate this workflow rather than behaving like a basic upload tool.

---

## Why Approved Rows Become Locked

Once emissions are approved:
- silent edits become dangerous
- audit defensibility weakens
- reporting consistency suffers

Locking approved records felt operationally realistic.

---

# 9. RBAC Design

## Decision

I implemented three roles:

| Role | Responsibility |
|---|---|
| admin | full access |
| analyst | review + analysis |
| auditor | read-only |

---

## Why I Chose This

This mirrors real ESG workflows.

Auditors should:
- inspect
- verify
- export

but should never:
- modify records
- ingest data
- approve emissions

Analysts are allowed to review records but not manage ingestion infrastructure.

---

## Why Permissions Are Enforced Twice

Permissions are enforced:
- globally through DRF permissions
- locally inside sensitive endpoints

This avoids accidental privilege escalation through overlooked actions.

---

# 10. Why I Prioritized Backend Integrity Over Visual Complexity

The assignment heavily emphasized:
- data modeling
- ingestion realism
- auditability
- operational thinking

I therefore prioritized:
- normalization correctness
- parser resilience
- audit workflows
- source traceability

over:
- highly polished UI animations
- complex frontend state systems
- design-system abstraction

The frontend was designed to support analyst workflows clearly rather than maximize visual sophistication.

---

# 11. Why I Used AI Tools

AI tooling was used selectively to accelerate:
- repetitive CRUD scaffolding
- UI iteration
- serializer/view boilerplate
- documentation drafting

However, the core implementation decisions were manually designed and iterated:
- ingestion architecture
- normalization strategy
- RBAC behavior
- audit model
- parser logic
- workflow design

All parser behavior, calculation logic, normalization rules, and ingestion edge-case handling were manually reviewed and adjusted during implementation.

I treated AI primarily as:
- a productivity accelerator
- a debugging assistant
- a drafting tool

rather than a substitute for architectural reasoning.

---

# 12. What I Would Improve With More Time

If this evolved beyond a prototype, I would next prioritize:
- async ingestion workers
- dynamic emission factor versioning
- stronger anomaly detection
- tenant-level configuration
- ingestion replay pipelines
- observability/logging
- automated testing coverage
- utility PDF extraction
- real SAP integrations

The current implementation intentionally focuses on:
- operational realism
- normalization quality
- workflow integrity

within the assignment constraints.