# Lineage AI — Seed Round Pitch Deck
### 10-Slide Outline | March 2026

---

## Slide 1 — Cover

**Lineage AI**
*The Cascade Testing Coordination Platform for Genetic Counselors*

> "Seven out of ten at-risk family members never get tested — not because they refuse, but because the outreach never reaches them."

- **Stage:** Seed Round
- **Ask:** $[X]M
- **Founder:** [Name] | [Email]
- **Website:** lineage.ai

*Visual: Clean family tree graphic with nodes lighting up green as relatives complete testing*

---

## Slide 2 — The Problem

### Cascade Testing Is Broken at the Coordination Layer

- **<30% cascade testing completion rate** — stuck there for decades
- A genetic counselor identifies a BRCA1 or Lynch syndrome mutation → the family-wide follow-up stalls
- Current workflow: family tree sketches, sticky notes, phone tag, inconsistent records
- **5,500+ US genetic counselors** each managing "fifty spreadsheets" instead of one dashboard
- Letters go unsent. Calls go unreturned. At-risk relatives who would have said yes never get the chance.

**The bottleneck is coordination, not patient willingness.**

*Visual: Side-by-side — counselor's cluttered desk vs. clean Lineage AI dashboard*

---

## Slide 3 — The Market Opportunity

### A $58.71B Market With a Gaping Workflow Hole

| Metric | Figure |
|---|---|
| Global genetic testing market (2033) | **$58.71 billion** |
| CAGR | **12.4%** |
| US genetic counselors (primary buyers) | **5,500+** |
| Health systems with genetics programs | **1,200+** |
| Cascade testing completion rate today | **<30%** |

- **TAM:** $58.71B (global genetic testing market)
- **SAM:** $2.1B (US clinical genetics workflow software)
- **SOM (Year 3):** $50M (5,000 counselor seats × $833/month avg)

**Why now:**
- NGS cost collapse → multi-gene panels now routine
- Regulatory push toward early detection and personalized medicine
- Payer incentives align: catching BRCA pre-cancer saves $300K+ vs. post-diagnosis treatment
- First-mover window open — incumbents cannot fill this gap

*Visual: Market sizing funnel + CAGR growth curve*

---

## Slide 4 — The Solution

### One Platform. Every At-Risk Relative. Fully Coordinated.

**How Lineage AI works:**
1. Genetic counselor uploads patient test result (BRCA1, Lynch, BRCA2, etc.)
2. Platform maps the family tree and identifies at-risk relatives
3. Automated, HIPAA-compliant outreach fires via **email, SMS, or letter** — timed and personalized
4. Counselor tracks status in real time: contacted → responded → tested → result received
5. Consent logging, compliance audit trail, and EHR-ready export — all automatic

**Replaces:** sticky notes + spreadsheets + manual phone calls + disconnected EHR notes

**Key metric we move:** cascade completion rate from **<30% → 70%+**

*Visual: Lineage AI product screenshot — family tree dashboard with outreach status nodes*

---

## Slide 5 — The Technology & HIPAA Moat

### Enterprise-Grade Security Built In From Day One

This is not a bolt-on compliance checkbox. It is the foundation:

| Layer | Implementation |
|---|---|
| **Field-level encryption** | AES-256-GCM on all PII (names, emails, phone numbers) at rest in PostgreSQL |
| **Decryption boundary** | Only at authenticated controller level — never stored in plaintext |
| **Outreach delivery** | SendGrid (email) + Twilio (SMS) — both HIPAA Business Associate Agreement eligible |
| **Session security** | JWT + Redis-backed sessions with 7-day TTL |
| **Auth** | Google OAuth 2.0 + bcrypt password hashing |
| **Audit trail** | Every outreach event timestamped and status-logged in immutable DB records |
| **Queue architecture** | BullMQ with Redis — retries, exponential backoff, dead-letter handling |

**Why this matters to investors:**
- HIPAA compliance is the #1 barrier to entry for competitors
- Our encryption layer is a **technical moat** — not just a policy document
- Health system procurement requires this; we pass on day one

*Visual: Architecture diagram showing encryption flow from patient data → encrypted DB → decrypted only at API response layer*

---

## Slide 6 — Traction & Validation

### The Signal Is Already There

**Product:**
- Full-stack platform live: patient management, family tree mapping, automated outreach, dashboard analytics
- Demo environment seeded: 2 patients, 8 at-risk relatives, full outreach history
- Real email delivery operational (SendGrid); SMS pipeline built (Twilio)
- Dark mode, SEO-optimized condition pages (BRCA1, Lynch syndrome, BRCA2, FAP, MEN2)

**Market validation (from Ideabrowser research, March 2026):**
- Ideabrowser Opportunity Score: **9/10 (Exceptional)**
- Why Now Score: **9/10 (Perfect Timing)**
- Market Position: **Category King** (high uniqueness + high value)
- Reddit communities: **2.5M+ members** across r/genetics, r/23andMe, r/AncestryDNA, r/Genealogy
- Professional bodies engaged: NSGC, ESHG, ASHG

**Competitive gap confirmed:**
- Progeny ($1,000+/seat) — pedigree drawing tool, no workflow management
- CancerIQ — individual risk assessment only, no family coordination
- No existing tool manages family-wide cascade testing end-to-end

*Visual: Product screenshots + traction metrics dashboard*

---

## Slide 7 — Business Model

### SaaS With Clear Expansion Path

**Core pricing:**

| Segment | Price | Notes |
|---|---|---|
| Genetic counseling practices | $500–$2,000/month | Tiered by patient volume |
| Health systems / in-house genetics | $25,000–$100,000/year | Enterprise contracts |
| Payer partnerships | Revenue share | Insurers save on pre-cancer detection |

**Unit economics (target):**
- CAC: $10–$20 (webinar + professional community GTM)
- Churn: <15%
- Pilot conversion: 25%
- LTV/CAC: >20x at scale

**Expansion verticals (post-hereditary cancer):**
- Cardiovascular genetics
- Pharmacogenomics
- Rare disease registries

**Revenue milestones:**
- Seed → 5 pilot clinics → $100K ARR
- Series A → 15,000 cascade processes managed → $1M ARR
- Series B → health system contracts + payer deals → $10M ARR

*Visual: Revenue staircase chart*

---

## Slide 8 — Go-To-Market

### A Tight, Repeatable Playbook

**Phase 1 (0–6 months) — Land with counselors:**
- Educational webinars on cascade testing coordination (15–20% conversion expected)
- Direct outreach to NSGC members and genetic counseling practices
- Pilot program: $99/clinic for first 3 months
- Target: 5 anchor practices, 200 signups/month

**Phase 2 (6–18 months) — Expand to health systems:**
- Use pilot data (cascade rate improvement) as sales proof
- EHR integration partnerships (Epic, Cerner)
- Target: 15,000 cascade processes managed within year one

**Distribution channels:**
- Professional communities: NSGC, ESHG, ASHG conferences
- Content: YouTube (Doctor Mike, TED-Ed style), genetic counselor forums
- SEO: Condition-specific landing pages (BRCA1, Lynch syndrome) already live
- Partnerships: SOPHiA GENETICS, Geisinger MyCode, FORCE

*Visual: GTM funnel with conversion rates at each stage*

---

## Slide 9 — The Team

### Built for This Problem

**[Founder Name]** — CEO
- [Background: healthcare tech / genetics / B2B SaaS]
- [Relevant credential or prior exit]

**[Technical Co-founder]** — CTO
- Full-stack platform built: Node.js, PostgreSQL, React, BullMQ, Redis
- HIPAA encryption architecture designed and implemented
- SendGrid + Twilio outreach pipeline live

**Advisors:**
- [Genetic counselor / NSGC member]
- [Health system CIO or CMO]
- [Healthcare VC or angel]

**Why us:**
- Execution difficulty rated 8/10 — we've already built the hard parts
- HIPAA compliance, EHR-agnostic architecture, and real outreach delivery are live
- Deep understanding of the coordination bottleneck, not just the science

*Visual: Headshots + brief bios*

---

## Slide 10 — The Ask

### $[X]M Seed Round

**Use of funds:**

| Allocation | % | Purpose |
|---|---|---|
| Product & Engineering | 40% | EHR integrations, mobile app, AI risk scoring |
| Sales & GTM | 30% | Hire first sales rep, conference presence, webinar program |
| Compliance & Legal | 15% | BAA negotiations, SOC 2 Type II, HIPAA audit |
| Operations | 15% | Infrastructure, customer success, hiring |

**18-month milestones this round funds:**
- ✅ 5 pilot clinics → 50 paying clinics
- ✅ 15,000 cascade processes managed
- ✅ $1M ARR
- ✅ EHR integration (Epic sandbox)
- ✅ Series A ready with proven unit economics

**The investment thesis in one sentence:**
> Cascade testing is a $58.71B market with a <30% completion rate and zero purpose-built coordination tools — Lineage AI is the first platform to fix that, with HIPAA-grade infrastructure already live.

---

*Appendix available: Technical architecture, competitive analysis, financial model, HIPAA compliance documentation*

---
*Lineage AI | Confidential | March 2026*
