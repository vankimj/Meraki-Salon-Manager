# Free Tier Sunset Playbook (Internal — Do Not Publish)

**Status:** Draft v2 (2026-05-09)
**Owner:** Jonathan VanKim
**Purpose:** A pre-written, rehearsed plan for restructuring the Solo tier — primarily for the **Founders' cohort**, since the public deadline already handles new-signup transition.
**Why this exists now:** Even with the Founders' Year model bounding most sunset risk, the cohort itself could need migration in extreme scenarios (vendor cost shock, regulatory shift). This playbook is the contingency.

**Important — read before opening:** With the Founders' Year model, the planned end of Solo's free availability for new signups is **NOT a sunset** — it's a pre-announced promotion ending. That's a marketing event with public lead time, handled by the marketing team, not this playbook. This playbook applies only if you ever need to migrate the existing Founders' cohort, which violates immutable principle #1 below. Do not open this playbook to "graduate" Founders' Members into paid tiers.

> **Do not publish.** Do not link to it. Do not reference it externally. The existence of a sunset plan is itself sensitive — it implies a possibility we don't want prospects worrying about. Internal Notion / shared drive only.

---

## 0. Read this first

Three immutable principles, written in calm conditions so they survive a crisis:

1. **Existing users keep what they had at signup, period.** The sunset is for *new* signups, not retroactive. Anyone who signed up under "free Solo" stays on free Solo as long as they stay active. Breaking this rule trades short-term revenue for long-term brand poison.
2. **Communicate the change before the change.** The PUBLIC announcement happens 90 days before the change takes effect. Not 30 days. Not 60 days. 90 days. The cost of long lead time is small; the cost of a short one is catastrophic (Heroku tried 60 days and spent two years recovering).
3. **Be generous on the way out.** Migration offers should feel like a gift, not a discount. Lose money on the migration. Make it back on the relationship.

If a future version of you is tempted to violate any of these principles — re-read this section twice and call your lawyer.

---

## 1. Triggers — when to start this conversation

Don't open the playbook for a hunch. Open it when one of these fires:

| Trigger | What it means |
|---|---|
| Free tier serving costs > 25% of MRR for 2+ consecutive quarters | Unit economics broken; needs structural fix |
| Free → paid conversion rate < 2% over rolling 180 days | Free isn't a funnel, it's a leak |
| Single competitor product launches with materially better free offering | We're now a "trial" by comparison; reposition or sunset |
| Vendor cost spike (AI, SMS) makes free margin negative | Forced economic move |
| Series A / strategic raise term sheet conditional on freemium changes | Investor-driven |
| Acquisition in flight requiring tier rationalization | M&A-driven |
| Legal/regulatory change that increases per-user compliance cost | Forced |

**One trigger ≠ sunset.** Two or more = serious conversation. None of the above = stay the course.

**First action when a trigger fires:** Pull this document into a working session. Don't decide. Just acknowledge the trigger, set a 30-day exploration window, and decide *whether to decide* by end of that window.

---

## 2. Decision framework

Before sunsetting, exhaust these alternatives in order:

| Tier of intervention | Examples | Brand cost |
|---|---|---|
| **1. Reduce caps** | Lower client cap from 500 → 250 | Low — frames as "natural growth signal" |
| **2. Raise paid prices** | $99 → $129 Studio | Low-Med — long-time customers grandfathered |
| **3. Move features to paid** | AI report queries become Studio-only | Med — risks "they're paywalling things that used to be free" |
| **4. Convert free to limited free trial** | "Free for 30 days, then Solo Plus required" | High — direct breach of "always-free" promise |
| **5. Full sunset of free tier** | "We're discontinuing the free Solo plan" | Highest — last resort |

**Rule:** Try options 1-3 before considering 4-5. Document why options 1-3 weren't sufficient. Options 4-5 require board / advisor sign-off (or your equivalent — even if it's just three trusted advisors).

**The "is it really sunset?" test:** If existing free users keep their tier untouched and only new signups are affected, you're doing option 4 or 5. If existing free users are downgraded, you've done something rarer and more dangerous — let's call that "retroactive sunset." Don't.

---

## 3. Phase timeline

90-day public lead time. Working backward from change-effective day (T-0):

### T-180 days (six months before): Internal decision

- [ ] Trigger acknowledged, working session opened
- [ ] Alternatives 1-3 (above) exhausted or ruled out with documented reasoning
- [ ] Decision: yes/no/which option
- [ ] Counsel engaged for ToS/contract review
- [ ] Migration offer drafted (see §5)
- [ ] Internal alignment with co-founders / advisors / board
- [ ] Documented decision rationale (will be referenced in post-mortem)

### T-120 days: Operational prep

- [ ] Engineering: build the sunset-mode feature flag (see §6)
- [ ] Engineering: cap-enforcement updates if needed
- [ ] Engineering: in-app banner system for affected users
- [ ] Customer support: scripts updated, FAQ drafted, escalation tree defined
- [ ] Billing: migration-offer pricing live in Stripe (as new product/coupon)
- [ ] Analytics: dashboards for tracking migration uptake, churn, sentiment
- [ ] Legal: ToS update reviewed + ready to publish on T-90
- [ ] Press / PR: HN-ready blog post drafted (see §8)

### T-90 days: PUBLIC announcement

This is the day the world hears about it. Everything ships in coordinated sequence:

- [ ] **08:00 ET:** Email to ALL affected users (free + relevant paid)
- [ ] **08:00 ET:** In-app banner + dedicated /announcement page goes live
- [ ] **08:00 ET:** Blog post live at plumenexus.com/blog/[slug]
- [ ] **08:30 ET:** Tweet / LinkedIn / social post
- [ ] **09:00 ET:** Updated ToS effective (linked from email + announcement)
- [ ] **09:00 ET:** Founder posts on Hacker News (Show HN or Ask HN format) — **do not post defensively, post the news**
- [ ] **09:00 ET:** Founder available on Twitter, email, Reddit r/salonowners for the next 8 hours

Tone of all comms: honest, generous, specific, no corporate-speak. See §7.

### T-60 days: First nudge wave

- [ ] In-product banner becomes more prominent
- [ ] Email #2 to free users: "30 days left — here's the migration offer one more time"
- [ ] Customer-support team monitors sentiment, surfaces objections to founder
- [ ] Migration uptake dashboard reviewed weekly

### T-30 days: Final wave

- [ ] Final email: "Action needed by [date] — here's what happens"
- [ ] In-product modal (dismissible, but visible) on every login
- [ ] Phone outreach to highest-value free users (top 5% by usage)
- [ ] Final extension request window (some users will need a few more weeks; grant up to 30 extra days for those who ask)

### T-7 days: Last-call

- [ ] Daily email reminders to users who haven't acted
- [ ] Modal becomes non-dismissible until they choose: upgrade, export data, or accept downgrade

### T-0: Change effective

- [ ] Affected accounts moved to new tier (or restricted, depending on scenario)
- [ ] Data preserved per data-retention policy (90-day soft-archive minimum)
- [ ] All comms references updated (pricing page, ToS, FAQ)
- [ ] Status page noted with effective date

### T+7 days: Acute support phase

- [ ] Support team in elevated mode for inbound questions
- [ ] Founder personally responds to any escalation
- [ ] Daily sentiment monitoring (Twitter, Reddit, HN, G2, Capterra)
- [ ] Daily metrics review: churn rate, migration rate, refund rate

### T+30 days: Post-mortem

- [ ] Quantitative review (see §10)
- [ ] Qualitative review (sentiment, themes, objections)
- [ ] Post-mortem doc filed (see §10)
- [ ] Playbook updated based on lessons learned

---

## 4. The four sunset scenarios (decide which you're running)

The phase timeline is the same; the comms differ.

### Scenario A — Full sunset (free → no longer offered to new signups)
Existing free users stay free forever (per immutable principle #1). New signups must pick a paid plan.
**Brand risk:** Medium-High. The "always-free" promise is breached for prospects but kept for existing users.
**Use when:** Free tier economics are unworkable AND options 1-3 didn't fix it.

### Scenario B — Partial paywall (specific features move from free to paid)
Existing free users keep all current features. New signups get a more limited free tier without those features.
**Brand risk:** Medium. Less dramatic than full sunset.
**Use when:** A specific feature is the cost driver (e.g. AI calls).

### Scenario C — Cap reduction
Lower the limits on what free can do (e.g. 500 → 250 clients). Existing users grandfathered at old caps.
**Brand risk:** Low-Medium. Frames naturally as "we calibrated the caps based on usage data."
**Use when:** Caps are too generous and conversion is suffering.

### Scenario D — Retroactive sunset (NOT RECOMMENDED — included for completeness)
Existing free users are downgraded or paywalled.
**Brand risk:** Catastrophic. Heroku, Atom, Mailchimp all tried this. None recovered cleanly.
**Use when:** Bankruptcy is the only alternative. Otherwise no.

---

## 5. Migration offers (the gift, not the discount)

Pick one to lead with. Make it generous enough that the user feels respected, not punished.

| Offer | Cost to us | Customer perception | Best for |
|---|---|---|---|
| **Lifetime grandfather of free tier (existing users)** | Ongoing serving cost | "They honored their promise" | Default for Scenarios A, B, C |
| **Lifetime 50% off Studio for migrating free users** | Recurring 50% margin loss | "I'm getting a real deal" | Most aggressive conversion play |
| **12 months at $0 on Solo Plus, then full price** | 12 months Solo Plus serving cost | "Generous transition" | Balanced |
| **6 months at 50% off any paid tier** | 6 months × 50% margin | "Reasonable migration window" | Cost-controlled |
| **Free data export + $0 for 30 days on any paid tier to evaluate** | Minimal | "Fair shake" | Floor offer if budget-constrained |

**Stack the offers if needed.** The migration email can offer multiple choices: "Pick whichever works for you."

**Always include:** A free, complete data export option for users who choose not to migrate. No exceptions, no exit fees, no "you have 30 days to download." Lifetime data-export availability for sunset users is a one-line ToS addition that buys enormous goodwill.

---

## 6. Engineering work required

Built in advance, gated behind a feature flag, exercised in staging before T-180:

- **`tierLimits` config** with sunset-mode flag. When flagged, new signups get the new tier; old users see the legacy tier code path.
- **Per-user tier override field** so individual users can be grandfathered or migrated independently.
- **In-app banner system** with dismiss tracking, scoped to user cohort (e.g. "free Solo signed up before [date]").
- **Migration-offer Stripe products** pre-created (don't create in production on day-of).
- **Cap-enforcement that knows about grandfather** — old free users keep old caps, new free users get new caps (if Scenario C).
- **Account state: `pendingDowngrade` flag** that holds back enforcement until T-0.
- **Audit log** for every tier change, with reason code.
- **Analytics events:** `sunset_announced_seen`, `migration_offer_viewed`, `migration_completed`, `data_exported_pre_sunset`, `account_deleted_post_sunset`, `support_ticket_re_sunset`.

**Time estimate:** 2-3 weeks of focused engineering. Don't try to build it in the T-90 to T-0 window.

---

## 7. Communication templates (draft now, polish at T-90)

### 7.1 The T-90 email to free users

> **Subject:** Important changes to your free Plume Nexus plan
>
> Hi [first name],
>
> I'm writing to share a change to the free Solo plan you signed up for. I want to be straight with you about what's changing, why, and what your options are.
>
> **What's changing:** [Specific change in one or two sentences. No marketing language.]
>
> **What's NOT changing for you:** Because you signed up under our "always-free" promise, your account stays on free Solo with the same features and limits you have today, [forever | until [date]]. We're honoring that promise.
>
> [If applicable: **What this means for new signups starting [date]:** [specifics]]
>
> **Your options if you'd like to upgrade:**
> - [Migration offer 1]
> - [Migration offer 2]
> - [Free data export + leave the platform — link]
>
> **Why we're doing this:** [Honest reason. Not "to better serve you." Real economics, real strategy.]
>
> If you have questions, reply to this email — it goes to me directly.
>
> — Jonathan VanKim
> Founder, Plume Nexus

### 7.2 The T-90 blog post (HN-ready)

> **Title:** A change to our free tier — and why we waited 90 days to make it
>
> [3-4 paragraphs of honest context: what's changing, why now, what existing users keep, how we picked the migration offer, what we'd do differently if we were starting over.]
>
> [Acknowledge the broader pattern: lots of companies have made bad sunset moves. Here's how we're trying not to be one of them.]
>
> [End with: a way to reach you personally for any questions. Twitter @, email, etc.]

### 7.3 The HN post (don't make this defensive)

> **Title:** Plume Nexus is restructuring our free tier. Existing users keep what they had.
>
> Body: 4-6 sentences. Link to the blog post. Then participate in comments — answer every reasonable question, don't get into flame wars, take feedback seriously.

### 7.4 The "you didn't act, here's what happens" T-7 email

> **Subject:** Last-call: Your free Plume Nexus plan changes in 7 days
>
> Hi [first name],
>
> Just a final heads-up: starting [date], [specific change] takes effect on your account.
>
> If you'd like to:
> - **Upgrade:** [link to migration offer]
> - **Export your data:** [link]
> - **Do nothing:** [explain what happens — your data stays, your account becomes [new state], you can re-activate any time]
>
> No pressure, just want to make sure you're not surprised.
>
> — Jonathan

### 7.5 Press inquiry response template

If a journalist or analyst reaches out:

> Thanks for reaching out. Happy to talk about this. The short version: [1-paragraph summary]. The longer version is in our blog post here: [link]. Available for a 15-min call this week — what works?

---

## 8. Press / social response plan

**Anticipate the negative narrative.** Whatever the change is, someone will frame it as "Plume Nexus betrays free users." Pre-write your response.

### The response framework

1. **Don't go silent.** Silence becomes "they have something to hide."
2. **Don't get defensive.** Don't argue with critics. Acknowledge the disappointment, restate the rationale, point to the migration offer.
3. **Don't engage with bad-faith trolls.** Reply once, civilly, then move on. Pinned tweet > 12 replies.
4. **Do engage with thoughtful critique.** Real customers with real concerns get real responses, even if the answer is "I hear you, here's why we're doing it anyway."
5. **Update the blog post if new objections emerge.** Living document. Note "Updated [date]" so people see you're listening.

### Channels to monitor

- Twitter / X (search for "Plume Nexus", "@plumenexus")
- Hacker News (your post + any reactions)
- Reddit (r/salonowners, r/smallbusiness, r/SaaS)
- G2 / Capterra reviews
- Indie Hackers
- LinkedIn comments on company page
- Direct email (founder address)

### Pre-written social posts

**The acknowledgment:**
> "I hear you. We knew this would land hard for some folks. Existing free Solo users keep what they had — that promise is intact. For new signups, here's our reasoning: [link]"

**The "we made a mistake" post (if applicable):**
> "Update: based on feedback over the last 24 hours, we're [adjustment]. Original announcement: [link]. Apologies to anyone who felt blindsided."

(Be willing to make this post. Most companies aren't, and it's why their sunsets become catastrophes.)

---

## 9. Customer-support readiness

Before T-90, the support team (even if it's just you) needs:

- **A 1-page "What you need to know" cheat sheet** with: the change, the reasoning, the migration offer, the data-export option, the escalation path
- **A canned-response library** for the top 10 expected questions
- **An escalation tree** — what gets responded to immediately vs queued, what gets routed to founder
- **A daily 15-minute standup** during T-90 to T+7 to surface emerging objections
- **A "make it right" budget** — if a customer is in genuine hardship, what's the support team authorized to offer? (e.g. extra grandfather period, additional discount, free month, etc.)

Top 10 expected questions (draft answers ready):

1. "Why are you doing this?" → Honest economic/strategic answer.
2. "Did I just get screwed?" → "If you signed up under free Solo, your plan is unchanged. Here's what stays the same."
3. "Can I keep my free plan?" → Yes, if existing user. No, if new signup.
4. "I just signed up last week — am I grandfathered?" → Define cutoff date publicly. Be generous with edge cases.
5. "Will my data be deleted?" → No. Full export available indefinitely.
6. "How do I cancel and download my data?" → Self-serve link.
7. "What's the migration offer again?" → Restate.
8. "Will you do this again?" → Honest answer about the conditions under which it might happen again.
9. "I'm a small business, this hurts" → Acknowledge, point to migration offer + extension request.
10. "I'm posting this to [HN/Twitter/Reddit]" → "Understood. We're watching the conversation, happy to engage."

---

## 10. Post-mortem template (file at T+30)

### Quantitative review

| Metric | Pre-sunset baseline | Post-sunset actual | Delta | Notes |
|---|---|---|---|---|
| Free-user count | | | | |
| Paid-user count | | | | |
| MRR | | | | |
| Migration uptake (free → paid) | | | | |
| Churn rate (free users deleting accounts) | | | | |
| Refund/credit issued (sum) | | | | |
| Support tickets per day during T-90 → T+7 | | | | |
| NPS / sentiment score change | | | | |
| Press / social mentions (positive/negative) | | | | |

### Qualitative review

1. What went well that we should repeat?
2. What went wrong that we should change next time?
3. What surprised us (positively or negatively)?
4. What did we under-communicate?
5. What did we over-communicate?
6. Were the migration offers right (too generous / not generous enough)?
7. Was the timeline right (too long / too short)?
8. Did the engineering prep hold up?
9. Did support / founder bandwidth hold up?
10. What would we tell our past selves if we could?

### Decision artifacts

- Trigger that opened this playbook
- Alternatives considered + why rejected
- Migration offer rationale
- Cutoff date rationale
- Comms tone choices
- Anything we changed mid-flight + why

### Update this playbook

After post-mortem, edit this document with lessons learned. Bump version. Note in changelog.

---

## 11. What other companies got wrong (learn from them)

Brief case notes — re-read these before any sunset decision:

- **Heroku free dynos (2022)** — 60-day notice was too short, no grandfather, no migration discount. Result: huge community backlash, perceived as the moment Heroku stopped caring about indie devs. Lesson: longer notice, grandfather existing users, generous migration offer.
- **Mailchimp free tier (2022)** — caps reduced from 2,000 → 500 contacts with little notice. Customers felt nickel-and-dimed. Lesson: don't reduce existing-user caps; only adjust caps for new signups.
- **GitHub Atom sunset (2022)** — entire product killed with 6-month notice. Better notice, but no migration path. Lesson: even a sunset of a product (not just a tier) needs a migration story.
- **Notion AI add-on launch (2023)** — added a paid tier on top of existing plans, framed as a "feature unlock" not a removal. Worked because it was additive, not subtractive. Lesson: when possible, add paid features rather than remove free ones.
- **GitLab "Starter" tier removal (2021)** — removed a paid tier and migrated users to a higher-priced one with little notice. Major customer revolt. Lesson: tier consolidation is a sunset, treat it as such.
- **Twitter API free → paid (2023)** — short notice, hostile tone, no migration offer. Reputational damage outlasted the revenue gain. Lesson: how you sunset matters as much as whether you do.

---

## 12. Decision tree (the TL;DR)

```
TRIGGER FIRES
  ↓
Is this a real trigger (vs anxiety)?
  → No: stay the course
  → Yes: continue
  ↓
Have you tried alternatives 1-3 (caps, paid prices, feature moves)?
  → No: try those first
  → Yes: continue
  ↓
Will this be Scenario A, B, C, or D?
  → D: stop. Try anything else first. If you must, get extra counsel + advisor sign-off.
  → A/B/C: continue
  ↓
Engineering: is the sunset-mode flag built and tested?
  → No: build it. T-180 onward.
  → Yes: continue
  ↓
Is the migration offer generous enough that you'd take it yourself?
  → No: improve it
  → Yes: continue
  ↓
Are the comms drafted and ready?
  → No: draft them
  → Yes: continue
  ↓
T-90: announce publicly. Then follow the timeline.
  ↓
T+30: post-mortem. Update this playbook.
```

---

## Document changelog

- **v1 — 2026-05-09** — initial draft based on review of Heroku, Mailchimp, GitHub, Notion, GitLab, and Twitter sunset events; integrated with FREE-TIER-RISKS.md (D5, H3, H5)
- **v2 — 2026-05-09** — scope narrowed after switching to Founders' Year model. Solo-for-new-signups ending at Founders' Year deadline is a planned, pre-announced event handled by marketing — not a sunset. This playbook now applies only to the contingency where the Founders' cohort itself needs migration (which violates immutable principle #1; should remain a true contingency)
