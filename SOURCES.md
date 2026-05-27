# SOURCES.md

# Source Research And Realism

## Overview

The assignment intentionally required choosing realistic ingestion assumptions for three different operational systems:

- SAP procurement/fuel data
- utility electricity data
- corporate travel data

Rather than inventing artificial toy schemas, I researched how these systems commonly expose operational data in real enterprise environments and then intentionally modeled:

- realistic inconsistencies
- operational gaps
- malformed rows
- normalization challenges

This document explains:

- what I researched
- what I chose to simulate
- why I made those choices
- what limitations still exist compared to production deployments

---

# Emission Factor Research Sources

The emission factors used throughout the prototype were primarily derived from:

- UK DEFRA 2024 Conversion Factors
- EPA electricity emission guidance
- DEFRA aviation cabin-class multipliers

The primary reference used throughout the project was:

```text
UK Government GHG Conversion Factors for Company Reporting (2024)
```

particularly:

- "Fuels" tab
- "UK electricity" tab
- "Business travel — air" tab

These tables informed:

- diesel combustion factors
- natural gas factors
- electricity grid factors
- aviation cabin multipliers

Examples:

- ECONOMY = 1.0
- BUSINESS = 2.9
- FIRST = 4.0

The prototype intentionally simplifies some regional variations for assignment scope, but the normalization methodology follows the same conceptual structure used in real ESG accounting workflows.

EPA electricity guidance and regional electricity intensity references were additionally used for:

- US electricity factors
- regional grid comparisons
- country-level normalization assumptions

---

# 1. SAP Fuel And Procurement Data

# What I Researched

I researched:

- SAP MM procurement exports
- ERP fuel procurement workflows
- SAP flat-file exports
- typical ERP operational exports

I specifically focused on:

- procurement-style flat files
- operational reporting exports
- common export inconsistencies

rather than attempting to fully model SAP infrastructure itself.

I specifically modeled exports inspired by:

```text
SAP MM transaction MB51
```

which is commonly used for:

- material document reporting
- goods movement tracking
- operational inventory movements

In real SAP systems:

- movement type `201`
- movement type `261`

typically represent:

- operational goods issue
- fuel/material consumption

This became the conceptual basis for the procurement-style ingestion simulation.

---

# What I Observed

Real SAP exports frequently contain:

- ERP-specific field names
- multilingual column headers
- inconsistent units
- unclear plant/location identifiers
- malformed operational data
- procurement-focused rather than emissions-focused schemas

The data is usually operationally useful but not analytics-friendly.

This means ESG onboarding pipelines must:

- normalize aggressively
- handle malformed rows
- preserve source traceability

---

# What I Chose To Simulate

I modeled SAP ingestion using:

- flat-file CSV exports

inspired by ERP procurement extracts.

The dataset intentionally includes:

- German-style field names
- inconsistent units
- malformed dates
- procurement material codes
- operational procurement descriptions

---

## What My Sample Data Looks Like And Why

The SAP fixture dataset contains:

- 30 rows
- pipe-delimited export format
- reporting period Jan–Mar 2024

Sample operational dimensions include:

- plant codes: `DE01`, `IN03`, `US07`
- material codes: `FUEL-DSL`, `FUEL-PET`, `FUEL-NG`

I intentionally included:

- malformed rows
- invalid dates
- non-numeric quantity values

to verify:

- malformed row isolation
- partial ingestion behavior
- error logging integrity

I also intentionally included:

- European decimal formatting (`1.234,56`)
- German-style operational exports
- mixed unit formats

on several rows because:

- SAP German locale deployments are common in EU manufacturing environments
- localization inconsistencies are a realistic ESG onboarding problem

---

# Example Realism Included

## Inconsistent Units

Examples included:

- GAL
- L
- TO
- M3

These are normalized during ingestion.

---

## Malformed Dates

Example:

```text
INVALID
```

The parser:

- fails the row
- logs the error
- continues processing remaining rows

instead of aborting the full ingestion job.

---

## Procurement Material Mapping

Examples included:

- `PROC-OFFSUPP-01`
- `PROC-MISC`
- `FUEL-DSL-*`

The parser intentionally maps procurement-style material prefixes into:

- emission factor categories
- operational fuel classifications

This simulates how many real ERP integrations require:

- material master mapping
- configurable categorization logic
- client-specific procurement normalization

---

# Why I Chose Flat-File CSV Instead Of Live SAP APIs

Production SAP integrations are significantly more complex and usually involve:

- IDocs
- BAPIs
- SAP RFCs
- middleware systems
- enterprise networking constraints

For a prototype:

- ingestion reasoning mattered more
- normalization behavior mattered more
- parser resilience mattered more

than simulating true SAP connectivity.

CSV exports are also operationally realistic because many ESG onboarding workflows still begin with manually exported ERP data.

---

# What Would Break In Production — SAP

## 1. MATNR Mapping

The current parser maps materials using:

```text
prefix heuristics
```

Examples:

```text
FUEL-DSL-*
```

Real SAP material numbers are typically:

```text
18-character zero-padded integers
```

Example:

```text
000000000000001234
```

A real deployment would require:

- client-specific material mappings
- configurable fuel lookup tables
- master-data synchronization

---

## 2. Plant Code To Country Mapping

The prototype currently uses:

```text
2-character geographic prefixes
```

Example:

```text
DE → Germany
```

This breaks for clients using:

- non-geographic plant naming
- ERP-internal codes

Examples:

```text
P001
MAIN
HQ
```

A production deployment would require:

- explicit plant master tables
- configurable country mappings
- ERP reference synchronization

---

## 3. SAP Movement Types

The current prototype does not filter:

```text
SAP movement types
```

In real SAP MM workflows:

- `201`
- `261`

represent:

```text
goods issue / operational consumption
```

while:

- `101`

represents:

```text
goods receipt
```

Without filtering correctly:

- procurement inflates actual consumption
- emissions become overstated

A production deployment would therefore require:

- movement-type filtering
- configurable movement mappings
- plant-specific movement logic

---

# 2. Utility Electricity Data

# What I Researched

I researched:

- utility portal exports
- facilities electricity reporting workflows
- operational utility CSV formats
- energy reporting conventions

I focused specifically on:

- how facilities teams operationally manage utility data
- common billing export formats
- unit inconsistencies

---

# What I Observed

Utility data behaves differently from procurement data.

Typical utility exports contain:

- billing periods
- meter identifiers
- site names
- varying energy units
- tariff-aligned reporting periods

Another challenge is that billing periods often:

- do not align with calendar months
- contain partial-month usage
- vary by provider

---

# What I Chose To Simulate

I modeled utility ingestion using:

- CSV exports from utility portals

because this felt operationally realistic for:

- facilities teams
- ESG onboarding workflows
- manual monthly reporting

---

## What My Sample Data Looks Like And Why

The utility fixture dataset contains:

- 20 rows
- monthly utility billing exports
- reporting period Jan–Mar 2024

Sample facilities include:

- `DE01-Berlin`
- `IN03-Mumbai`
- `GB05-London`
- `US07-Texas`

The dataset intentionally includes mixed energy units:

- `MWh`
- `GJ`
- `therms`

to validate:

- normalization correctness
- unit conversion logic
- downstream reporting consistency

I intentionally included:

- anomalous high-consumption rows
- inconsistent billing periods
- mixed regional electricity profiles

to test:

- anomaly detection behavior
- multi-region factor handling
- reporting flexibility

One intentionally malformed row includes:

```text
usage_value = "INVALID"
```

to verify:

- row-level parser isolation
- failed-row logging
- partial ingestion behavior

The dataset also includes:

- industrial facilities
- warehouse-style facilities
- office-style facilities

because electricity intensity varies significantly across facility types.

Country codes are intentionally derived from:

- site prefixes (`DE`, `IN`, `GB`, `US`)

to simulate lightweight multi-region utility handling.

---

# Unit Normalization Implemented

The parser normalizes all energy values into:

```text
kWh
```

Supported conversions:

| Input Unit | Normalized |
| ---------- | ---------- |
| MWh        | kWh        |
| GJ         | kWh        |
| therms     | kWh        |

This ensures downstream analytics remain consistent.

---

# Why I Did Not Choose OCR/PDF Extraction

Many utilities still provide:

- PDF bills
- scanned invoices

However:

- OCR extraction becomes its own engineering problem
- vendor formats vary heavily
- document parsing quality becomes the dominant challenge

For this assignment, I believed:

- normalization quality
- workflow integrity
- ingestion reasoning

were more important than document extraction infrastructure.

---

# What Would Break In Production — Utility

## 1. Billing Period Alignment

The current implementation:

- assigns emissions using billing midpoint dates

Real ESG reporting often requires:

- prorated monthly allocation
- calendar alignment
- fiscal-period normalization

especially when:

- billing cycles overlap reporting periods

---

## 2. Grid Factor Granularity

The prototype uses:

```text
country-level grid factors
```

Real implementations often require:

- ISO-region grid factors
- utility-specific factors
- market-based accounting
- renewable energy certificate handling

The current model is therefore simplified for prototype scale.

---

## 3. Meter Deduplication

The prototype assumes:

- one clean utility record per billing cycle

Production systems frequently contain:

- duplicate invoices
- rebilled statements
- corrected usage periods

A real implementation would require:

- invoice deduplication logic
- meter-level reconciliation
- billing overlap detection

---

# 3. Corporate Travel Data

# What I Researched

I researched:

- Concur exports
- Navan APIs
- travel expense schemas
- business travel categorization

I focused on:

- what fields are commonly available
- what data is frequently missing
- how travel categories map to emissions logic

---

# What I Observed

Travel systems frequently expose:

- flights
- hotels
- rail
- taxis
- rental cars

but often:

- omit exact distance
- expose only airport codes
- contain inconsistent categories

This creates normalization challenges for emissions calculation.

Navan exposes expense data through endpoints similar to:

```text
/v1/expenses
```

with fields such as:

- `expense_id`
- `fareClass`
- `originAirportCode`
- `destinationAirportCode`

Concur’s newer REST APIs expose very similar structures.

These fields directly informed:

- cabin-class multipliers
- airport-code normalization
- haversine fallback logic

---

# What I Chose To Simulate

I modeled travel ingestion using:

- JSON payloads inspired by travel APIs

This allowed:

- category-specific handling
- nested travel data
- optional fields
- missing distance logic

---

## What My Sample Data Looks Like And Why

The travel fixture dataset contains:

- 25 rows
- mixed travel categories
- structured JSON payloads

Included activity types:

- flights
- hotels
- rail
- taxi
- rental car

The dataset intentionally includes:

- missing `distance_km`
- mixed cabin classes
- varying airport codes

to verify:

- haversine fallback logic
- cabin-class emission multipliers
- category-specific calculations

Cabin class examples include:

- ECONOMY
- BUSINESS
- FIRST

because cabin class materially changes aviation emissions intensity.

---

# Haversine Distance Fallback

One important realism choice was handling missing distance values.

When:

```text
distance_km == null
```

the system:

- maps airport codes to coordinates
- calculates haversine distance
- derives estimated travel distance

This simulates how real ESG systems frequently infer missing operational data.

---

# Why This Matters

Real ESG ingestion pipelines often operate on:

- incomplete operational systems
- imperfect reporting exports
- inconsistent travel metadata

I intentionally wanted the system to demonstrate:

- resilience
- fallback logic
- operational realism

instead of assuming perfectly structured travel data.

---

# What Would Break In Production — Travel

## 1. Airport Coverage

The prototype includes:

- a limited hardcoded airport mapping table

A production implementation would require:

- global airport datasets
- IATA/ICAO normalization
- geolocation updates

to avoid failed distance derivation.

---

## 2. Cabin-Class Assumptions

The current implementation uses:

- fixed DEFRA multipliers

Real aviation accounting may require:

- airline-specific methodologies
- radiative forcing adjustments
- long-haul vs short-haul treatment
- region-specific factors

---

## 3. Duplicate Expense Handling

The prototype assumes:

- unique expense rows

Production T&E systems often contain:

- reimbursement duplicates
- canceled trips
- partially refunded itineraries

A real implementation would therefore require:

- expense reconciliation
- itinerary deduplication
- refund handling

---

# Why I Prioritized Operational Realism

For all three sources, I intentionally prioritized:

- operational messiness
- malformed handling
- normalization complexity
- source traceability

instead of:

- artificially clean datasets
- unrealistic perfect schemas
- idealized APIs

The most important ESG engineering challenge is usually not:

```text
“How do we calculate carbon?”
```

It is:

```text
“How do we reliably normalize messy operational systems into auditable emissions records?”
```

That philosophy guided the ingestion design decisions throughout the project.

---

# Final Reflection

The ingestion pipelines were intentionally designed to reflect:

- real onboarding friction
- operational inconsistency
- parser resilience requirements
- auditability concerns

rather than optimized or idealized datasets.

The prototype therefore focuses on:

- normalization quality
- workflow integrity
- audit traceability
- realistic ingestion behavior

which I believe are the most important architectural concerns in ESG systems.
