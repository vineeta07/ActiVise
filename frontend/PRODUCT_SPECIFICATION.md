# Activise Product Specification

## 1. Executive Summary

Activise is an AI-powered environmental campaign and civic engagement platform that converts citizen reports into verified impact outcomes.

Core value:

- Citizens: report issues, join campaigns, upload proof, earn certificates.
- Communities and NGOs: prioritize urgent campaigns with trustable evidence.
- Companies: sponsor campaigns, track ESG performance, and generate certification outputs.

Positioning:

- Premium civic-tech product with map-native workflows, AI trust layer, and corporate ESG reporting.

---

## 2. Product Goals and Differentiators

### Goals

- Reduce friction from issue discovery to verified action.
- Increase trust with evidence-first and AI-assisted verification.
- Connect individual climate action to corporate ESG accountability.
- Operate globally with multi-language support and accessibility-first UX.

### Differentiators

- Proof-based impact system with before/after pairing.
- AI verification: authenticity, impact change, manipulation checks.
- Map-driven campaign discovery with urgency and impact heat zones.
- Gamified recognition: digital impact certificates and leaderboards.
- Corporate ESG integration with measurable metrics and milestones.
- Consistent light and dark modes designed for all-day use.

---

## 3. Users, Roles, and Access Model

### Roles

- Citizen
- Volunteer
- Admin (NGO/Government)
- Company Admin
- Super Admin

### Authentication

- OAuth providers: Google, Microsoft, LinkedIn.
- Email/password fallback with MFA support.
- Session security: short-lived JWT access tokens + refresh rotation.

### RBAC (Role-Based Access Control)

- Citizen: report issues, browse campaigns, view own certificates.
- Volunteer: all citizen permissions + submit completion proof.
- Admin: campaign creation, prioritization, moderation, approvals.
- Company Admin: sponsorship, ESG dashboard, certification exports.
- Super Admin: policy control, audits, system-level overrides.

---

## 4. User Journey Flows

## 4.1 Landing to Conversion

1. User lands on premium homepage.
2. Sees mission statement and real-time counters.
3. Sees nearby map preview and featured verified campaigns.
4. Clicks primary CTA:

- Report an Issue
- Join a Campaign

## 4.2 Campaign Participation

1. User opens campaign discovery page.
2. Filters by urgency, location, and impact type.
3. Views pinned verified campaigns.
4. Joins campaign and gets task assignment.

## 4.3 Evidence and Verification

1. User starts reporting with Step 1 evidence capture (real-time camera or upload).
2. User completes form using voice input and AI-assisted drafting.
3. AI enhancer suggests description and volunteer-needed count (editable by user).
4. System auto-tags metadata: timestamp, location, category.
5. Submitted report is listed in campaign discovery immediately.
6. Volunteer uploads after photo.
7. System pairs before and after images.
8. AI verification produces status + confidence score.

## 4.4 Certification

1. If verification status is verified, certificate is generated.
2. User downloads or shares certificate preview.
3. Contribution appears in personal and organizational analytics.

## 4.5 Corporate ESG

1. Company sponsors campaigns.
2. Tracks offset and participation KPIs.
3. Monitors milestone completion.
4. Exports ESG report and certification readiness output.

---

## 5. Screen-by-Screen UI Layout Structure

## 5.1 Landing Page

Sections:

- Hero with mission statement.
- Real-time impact stats.
- Live map preview.
- Featured verified campaigns.
- Storytelling flow (Report -> Mobilize -> Verify -> Certify).
- Final CTA blocks for citizen and corporate users.

Design intent:

- Investor-grade visual narrative.
- Fast clarity + trust cues + conversion CTA hierarchy.

## 5.2 Campaign Discovery

Sections:

- Filter bar: urgency, impact type, verified-only toggle.
- Pinned high-priority verified cards.
- Interactive map with marker intensity and hotspot halos.
- Campaign list with tags and progress indicators.

Key behavior:

- Verified and urgent campaigns sorted first.
- Card click opens details and join action.

## 5.3 Reporting Flow

Step-by-step:

- Step 1: Issue details (title, category, urgency, summary).
- Step 1: Camera-first capture (mandatory first step, with upload fallback).
- Step 2: Issue details (title, category, urgency, summary).
- Step 2 add-ons: voice fill option + AI description enhancer.
- Step 2 add-ons: AI volunteer-needed recommendation with manual override.
- Step 3: Auto-tag preview (GPS, timestamp, issue type) + trust score preview.
- Step 4: Submission preview and confirm.

UX principles:

- Minimal cognitive load.
- One clear action per step.
- Error prevention and visible progress state.

## 5.4 Volunteer Dashboard

Sections:

- Assigned tasks list.
- Active task details.
- Before image from assignment.
- After image upload capture.
- Pairing status indicator and submit action.

## 5.5 AI Verification Console

Sections:

- Mission selector.
- Side-by-side before/after image upload.
- Fraud signal panels.
- Verification outcome panel: status + confidence + impact delta.
- Certificate CTA when verified.

Statuses:

- Pending
- Verified
- Rejected

## 5.6 Certificate Center

Sections:

- Certificate preview card.
- User identity and campaign details.
- Verified impact metrics.
- Download and share actions.

## 5.7 Corporate ESG Dashboard

Sections:

- KPI cards: offset, participation, completion.
- Sponsored campaign portfolio list.
- Zero-carbon milestone tracker.
- ESG report visualizations and readiness stage.

---

## 6. Design System

## 6.1 Style Direction

- Modern, clean, slightly futuristic.
- Card-based layout with glassmorphism and soft shadows.
- Micro-interactions and subtle reveal motion.
- Mobile-first with responsive behavior for dashboard density.

## 6.2 Typography

- Heading: Space Mono (brand-forward, technical tone).
- Body: DM Sans (high readability at small sizes).

## 6.3 Spacing and Radius

- Base spacing scale: 4, 8, 12, 16, 24, 32.
- Radius: 12px default, 16px for high-emphasis cards.

## 6.4 Theme Tokens

### Light Mode

- background: #FFFFFF
- surface/card: #F5F5F5 range with soft elevation
- brand green: #10B981
- tech blue: #3B82F6
- text primary: near-charcoal for readability

### Dark Mode

- background: #1A1A1A
- surface/card: #2D2D2D
- brand green: #34D399
- tech blue: #60A5FA
- text primary: high-contrast near-white

### Theme Behavior

- Toggle location: top-right of navigation near profile icon.
- Toggle interaction: one click switch.
- Transition: 0.3s smooth color transition.
- Persistence: localStorage.
- First visit behavior: system theme detection.

### Contrast and Accessibility

- All text and UI states target WCAG AA.
- Status colors remain distinguishable across themes.
- Map markers remain vivid in dark and light tiles.

---

## 7. Accessibility and Internationalization

## 7.1 Accessibility Requirements

- WCAG AA color contrast.
- Keyboard navigation for all key controls.
- Semantic headings and form labels.
- Focus visibility on interactive elements.
- Reduced motion support where applicable.
- Descriptive alt text for evidence previews and visuals.

## 7.2 Internationalization

- Language selector in global app shell.
- Translation-ready copy keys for all visible UI text.
- Locale-aware date/time formatting.
- Numeric formatting by locale.

---

## 8. Data and Analytics Layer

## 8.1 Real-Time Analytics

Per-user:

- Reports submitted.
- Verification success rate.
- Personal impact score.

Admin:

- Campaign velocity.
- Geo impact clustering.
- Verification queue health.

Corporate:

- Carbon offset by campaign and period.
- Participation and completion rates.
- Certification readiness stage.

## 8.2 Notifications

- Campaign updates.
- Verification status updates.
- Milestone and certificate availability.
- Sponsorship events for company admins.
- WhatsApp notification on campaign registration.
- WhatsApp notification for AI-verified high-priority campaigns.

Delivery channels:

- In-app notifications (implemented in shell).
- Push/email planned in backend integration phase.

---

## 9. Core Engine Details

## 9.1 AI Verification Logic

Inputs:

- Before image
- After image
- EXIF metadata
- Geolocation context

Signals:

- Metadata consistency (timestamp/device/geotag)
- Scene similarity and landmark consistency
- Manipulation artifacts (splicing, edits)
- Semantic impact delta (object and area change)

Decision model:

- Weighted score from signal outputs
- Confidence thresholds:
- > = 79: Verified
- 65 to 78: Pending Review
- < 65: Rejected

## 9.2 Map Intelligence Logic

- Campaign points are geocoded.
- Sorting priority: verified + urgency + local relevance.
- Heat clusters based on impact potential and urgency density.
- Map filters synchronize with card list filters.

## 9.3 Certification Rules

Certificate generated when:

- Verification status = verified.
- Confidence above threshold.
- Required metadata signals pass.

Certificate includes:

- Recipient name
- Campaign name
- Verified impact metric
- Confidence score
- Unique certificate id and issue date
- Blockchain anchor id and immutable content hash

Blockchain rule:

- Certificate content is hashed and anchored on-chain as immutable proof.
- Blockchain stores content proof hash and anchor metadata only.

## 9.4 ESG Metrics Definitions

- Carbon Offset: estimated tCO2e from campaign outcomes.
- Participation Rate: completed tasks / assigned tasks.
- Completion Rate: completed campaigns / sponsored campaigns.
- Verification Success: verified submissions / total submissions.

ESG report gating rule:

- ESG reports are generated only after company task completion count > 0.

---

## 10. Technical Architecture

## 10.1 Suggested Stack

- Frontend: React + TypeScript (or Next.js for SSR and SEO).
- Backend: Node.js + Express.
- Database: PostgreSQL (campaign, user, proof, certificate tables).
- Object storage: S3/Supabase Storage for media.
- Realtime: WebSocket or Supabase Realtime for live feeds.
- Maps: Mapbox GL JS (primary), Google Maps fallback.
- AI services: Python microservices (OpenCV, TensorFlow, or Vision APIs).
- Auth: OAuth 2.0 + RBAC middleware.
- Queue: BullMQ/SQS for async verification jobs.

## 10.2 High-Level Architecture Diagram (Text)

```text
[Web/PWA Client]
    |
    | HTTPS + JWT
    v
[API Gateway / BFF]
    |
    +--> [Auth Service]
    +--> [Campaign Service]
    +--> [Verification Orchestrator] --> [AI Image Service]
    +--> [Certificate Service]
    +--> [ESG Analytics Service]
    |
    v
[PostgreSQL] [Redis/Queue] [Object Storage]
```

## 10.3 Non-Functional Requirements

- Performance: LCP target < 2.5s on mobile.
- Availability: 99.9% for core API endpoints.
- Security: OWASP top 10 controls.
- Auditability: immutable verification logs and status history.

---

## 11. API Structure (Starter Contracts)

### Auth

- POST /api/v1/auth/oauth/google
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout

### Campaigns

- GET /api/v1/campaigns
- GET /api/v1/campaigns/:id
- POST /api/v1/campaigns
- POST /api/v1/campaigns/:id/join

### Reporting and Proof

- POST /api/v1/reports
- POST /api/v1/proofs/pair
- POST /api/v1/verification/scan
- GET /api/v1/verification/:proofId

### Certificates

- POST /api/v1/certificates/generate
- GET /api/v1/certificates/user/:userId

### Corporate and ESG

- POST /api/v1/sponsorships
- GET /api/v1/esg/company/:companyId/dashboard
- GET /api/v1/esg/company/:companyId/certification

### Notifications

- GET /api/v1/notifications
- PATCH /api/v1/notifications/:id/read

---

## 12. Optional Code Layer

## 12.1 React Skeleton

```tsx
// src/features/campaigns/CampaignDiscoveryPage.tsx
export function CampaignDiscoveryPage() {
  return (
    <main>
      <CampaignFilters />
      <VerifiedPriorityStrip />
      <CampaignMap />
      <CampaignCardGrid />
    </main>
  );
}
```

```tsx
// src/features/verification/VerificationPage.tsx
export function VerificationPage() {
  return (
    <main>
      <BeforeAfterUploader />
      <FraudSignalsPanel />
      <VerificationStatusCard />
      <CertificateActionBar />
    </main>
  );
}
```

## 12.2 Node/Express Route Example

```ts
// routes/verification.ts
router.post("/api/v1/verification/scan", async (req, res) => {
  const { beforeImageUrl, afterImageUrl, metadata } = req.body;
  const result = await verificationService.evaluate({
    beforeImageUrl,
    afterImageUrl,
    metadata,
  });
  return res.json(result);
});
```

---

## 13. Delivery Plan

Phase 1 (MVP):

- Landing, campaign discovery, reporting, verification, certificates.

Phase 2:

- Corporate sponsorship and ESG dashboards.
- Notifications and advanced analytics.

Phase 3:

- Advanced AI scoring and external certification integrations.
- Multi-region rollout with language expansion.

---

## 14. Success Metrics

- Report-to-campaign conversion rate.
- Verification turnaround time.
- Verified impact volume (kg/tCO2e).
- Monthly active volunteers.
- Corporate sponsorship retention.
- ESG certification completion rate.
