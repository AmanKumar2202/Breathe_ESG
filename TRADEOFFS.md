# TRADEOFFS.md

# Three Deliberate Omissions

## 1. Asynchronous Ingestion (Celery + Redis)

### What It Is

A production ESG ingestion system should process uploads asynchronously using:
- Celery workers
- Redis queues
- background task orchestration

instead of executing ingestion directly inside the API request cycle.

This is especially important for:
- very large CSV uploads
- OCR-heavy utility parsing
- long-running normalization jobs
- enterprise-scale onboarding batches

A mature implementation would also expose:
- live progress updates
- retry queues
- dead-letter queues
- ingestion monitoring

---

### Why I Did Not Build It

I intentionally kept ingestion synchronous for this prototype.

The assignment primarily evaluates:
- ingestion reasoning
- normalization architecture
- auditability
- workflow integrity

rather than distributed infrastructure scaling.

Adding:
- Celery
- Redis
- worker orchestration
- deployment complexity

would significantly increase infrastructure overhead while contributing relatively little to the core architectural reasoning being evaluated.

For the current prototype scale:
- synchronous ingestion remains understandable
- debugging is simpler
- operational flow is easier to demonstrate

---

### What Breaks Without It

Without asynchronous workers:
- uploads block the request thread
- large files increase API response time
- ingestion is limited by web worker timeout behavior

At larger scales:
- uploads above ~10k rows would become operationally problematic
- concurrent ingestion jobs would degrade responsiveness

---

### Production Path

A production migration path would likely involve:

```text
Django API
    ↓
Celery Queue
    ↓
Redis Broker
    ↓
Background Workers
```

along with:
- ingestion status polling
- WebSocket progress updates using Django Channels
- retry pipelines
- dead-letter queues

---

### Estimated Effort

Approximately:
```text
2 days
```

for:
- Celery integration
- Redis setup
- ingestion refactor
- deployment configuration
- progress reporting

---

# 2. Cloud Object Storage (S3) For Raw Uploaded Files

## What It Is

A production ingestion platform should persist uploaded raw files into durable cloud object storage such as:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

instead of relying on local filesystem storage.

This is especially important for:
- audit retention
- ingestion replayability
- disaster recovery
- multi-region deployments

---

## Why I Did Not Build It

For this prototype:
- ingestion-focused DB staging tables already preserve normalized operational data
- deployment simplicity mattered more than storage infrastructure

I also intentionally avoided deep cloud-provider coupling during initial development.

Platforms like Railway additionally use ephemeral container filesystems, meaning local file persistence is not production-safe anyway.

Implementing:
- S3 buckets
- IAM permissions
- signed upload flows
- storage abstraction

would increase deployment complexity significantly without improving the core ingestion reasoning being evaluated.

---

## What's Preserved Despite This

Even without cloud object storage:
- raw rows are preserved inside staging tables
- ingestion metadata is retained
- normalization traceability still exists
- audit workflows remain intact

This means the system still preserves:
- operational provenance
- source traceability
- ingestion debugging capability

even though original uploaded files themselves are not durably archived.

---

## What Breaks Without It

Without durable object storage:
- uploaded files may disappear after container restarts
- raw source documents are not permanently retained
- full ingestion replay from original files is limited

This becomes problematic for:
- enterprise audit retention
- long-term reproducibility
- compliance requirements

---

## Production Path

A production implementation would likely use:
- `django-storages`
- `boto3`
- S3 bucket versioning
- signed upload URLs
- lifecycle retention policies

Raw uploads would then be linked directly from:
```text
IngestionJob.raw_payload_ref
```

instead of local temporary paths.

---

## Estimated Effort

Approximately:
```text
4–6 hours
```

for:
- S3 integration
- bucket configuration
- storage abstraction
- deployment secrets
- signed upload handling

---

# 3. Scope 3 Supply Chain Emissions (Categories 1, 2, 4+)

## What It Is

This prototype currently focuses primarily on:
- operational Scope 1 emissions
- purchased electricity (Scope 2)
- business travel (Scope 3 operational subset)

A full ESG platform would also require:
- upstream purchased goods
- capital goods
- transportation and distribution
- supplier emissions
- spend-based accounting

especially:
- Scope 3 Category 1
- Category 2
- Category 4

---

## Why I Did Not Build It

Scope 3 supply-chain accounting is fundamentally a different problem from operational activity-based accounting.

It requires:
- spend-based emission factor databases
- supplier mapping
- procurement categorization
- economic intensity models
- uncertainty handling

A proper implementation would likely require integrating:
- Exiobase
- USEEIO
- spend-based carbon intensity datasets

This would substantially expand:
- ingestion complexity
- schema design
- calculation methodology
- analyst workflows

and effectively double the scope of the assignment.

---

## Why This Matters

For many manufacturers:
```text
Scope 3 Category 1
```

can represent:
```text
70%+ of total emissions footprint
```

This is one of the largest real-world ESG reporting challenges.

However, it is also one of the most methodologically complex areas of carbon accounting.

---

## What Would Be Needed In Production

A production implementation would likely require:
- `SpendRecord` models
- supplier master data
- procurement categorization pipelines
- spend-based factor databases
- supplier-specific emission factors
- uncertainty tracking
- hybrid activity/spend methodologies

This would significantly alter the current data model.

---

## Production Path

The likely production direction would include:

```text
ERP Procurement Data
    ↓
Supplier Mapping
    ↓
Spend Categorization
    ↓
Exiobase / USEEIO Matching
    ↓
Scope 3 Emission Estimation
```

along with:
- supplier overrides
- region-specific adjustments
- procurement taxonomy normalization

---

## Estimated Effort

Approximately:
```text
1–2 weeks
```

for a realistic first implementation with:
- spend categorization
- factor integration
- analyst workflows
- reporting support

and significantly more for production-grade accuracy.