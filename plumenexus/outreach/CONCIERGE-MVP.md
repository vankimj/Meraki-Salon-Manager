# Concierge MVP Playbook — Onboarding Your First Founders' Members

**Purpose:** A specific, hands-on plan for the first 2-3 Founders' Cohort salons. The goal isn't scale — it's learning. You'll do things that don't scale on purpose, because the lessons you extract from doing the work yourself become the entire product roadmap for year 2.

**Why this matters:** Software is built on assumptions about what customers do. Two days inside a real customer's salon will overturn 30% of your assumptions. The first 2-3 salons are the cheapest insurance you'll ever buy against building the wrong thing.

**Time investment:** 30-50 hours total per salon over 90 days. That's a lot. Treat each Founders' Member like an investor in your business — because they basically are (their feedback is more valuable than the cash you'd charge them).

---

## The mindset shift

Stop thinking "I built software, they're using it."

Start thinking **"I'm running their salon's software operations for them, manually, and writing down every step that should one day be automated."**

This is the Eric Ries / Lean Startup move. Famous applications:
- Stripe's first customers had Patrick Collison physically at their office
- Airbnb's founders flew to NYC to take photos of every host's apartment
- Buffer's founder ran every social-media post by hand for the first 50 customers

Your version: you migrate their data by hand, sit with their front desk for the first day live, answer every support email personally for 30 days, and shadow at least one full day inside their salon.

If you do this for 3 salons, you'll know your product 100x better than competitors who never left their laptops.

---

## Pre-onboarding — from signup to day one (1-2 weeks)

### Day 0 — They apply / accept

After a Founders' Cohort application is approved:

- [ ] Reply within 4 hours with the welcome email (template in [BETA-INTAKE-FORM.md](BETA-INTAKE-FORM.md))
- [ ] Send Calendly link to book a 30-min "kickoff call"
- [ ] Add their salon to your tracking sheet with a "Stage: Pre-onboarding" tag
- [ ] Block 4 hours on YOUR calendar within the next 7 days for their migration day

### Day 1-3 — Kickoff call (30 min)

Goals: align on timeline, gather what you need, set expectations.

**Agenda:**
1. **What I need from you (15 min):**
   - Export of your client list from current platform (CSV)
   - Export of your appointment history (CSV) — last 12 months minimum
   - Export of your transactions / receipts (CSV) — last 12 months
   - Photos: your logo, staff photos, brand colors
   - Service menu: list of services + prices + durations
   - Staff list: names, emails, phones, roles, comp models
   - Hours of operation per day
   - Booking page URL preferences
   - Stripe account (or willingness to create one)
2. **What I'll do for you (10 min):**
   - Migrate everything → working sandbox in 2-3 days
   - Schedule a 2-hour migration session with your front desk
   - Be physically present (or on video call) for your first business day live
   - Be on call for the first 30 days for any question
3. **Set the migration date (5 min):**
   - Pick a slow day. Not Saturday. Not before a holiday. Often a Tuesday.
   - Schedule it 1-2 weeks out so you have prep time
   - Block their calendar for the morning of, your calendar for the full day

**End of call:** Send a recap email with the agreed dates and a checklist of files they need to send you.

### Day 3-7 — Migration prep (you, on your laptop)

- [ ] Once they send their CSVs, run the import on a STAGING tenant (not production)
- [ ] Audit the import: count clients, count appointments, count receipts. Compare to source.
- [ ] Spot-check 5 random client records. Spot-check 5 random receipts. Spot-check 5 random appointments.
- [ ] Look for dedupe issues, encoding issues, weird date formats, missing fields
- [ ] Set up their staff accounts, roles, comp models manually
- [ ] Configure their booking page, hours, services
- [ ] Connect Stripe (or guide them through it on a follow-up call)
- [ ] Configure SMS (Twilio number provisioning if they're getting one)
- [ ] Branding: logo, colors, custom domain if they have one

**Output:** A staging environment that looks like THEIR salon, ready for prod-sync on migration day.

### Day 7-12 — Final prep call (15 min)

Just before migration day:
- [ ] Confirm the date and time still works
- [ ] Confirm front desk lead can be present for 2 hours
- [ ] Send "what to expect" prep email (see template below)

**"What to expect" email template:**

```
Subject: Tomorrow's the day — what to expect

Hi [first name],

Quick rundown for tomorrow's migration:

What I'll be doing (between 7-9am):
- Final data sync from your old platform
- Activate your Plume Nexus account
- Send your team their login emails
- Test bookings end-to-end

What you'll be doing:
- Send your team a heads-up that today's the day
- Have your front desk lead ready for our 2-hour walkthrough at 10am
- Have a short list of "must-work" workflows ready (your top 3 daily tasks)

What might go sideways (and what we'll do):
- Some clients might briefly see two booking pages while DNS propagates — I'll
  handle that with a redirect on your old domain
- Some staff may forget their password — I'll be on standby to help reset
- The first checkout might feel slow as they learn the UI — I'll be there to walk
  through it

I'll text you at 7am tomorrow when I start. Cell number to reach me directly: [your cell].

Talk tomorrow.

— Jonathan
```

---

## Migration day (1 full day, on-site if local)

### Morning — Tech work (2-3 hours, before they open)

- [ ] 7am: text them "starting now"
- [ ] Final data sync from old platform → Plume Nexus
- [ ] Activate the production tenant
- [ ] Send each staff member their welcome email + temp password
- [ ] Run end-to-end smoke tests (book → check in → checkout → receipt)
- [ ] Verify SMS sends correctly (test to your own phone)
- [ ] Verify booking page is live + correct
- [ ] Set up the redirect on their old platform (if applicable)
- [ ] Document any issues discovered for the running issues log

### Late morning — Front-desk walkthrough (2 hours, with their lead)

In person if local; video call if not. Their front-desk lead drives, you guide.

**Walk them through:**
1. Today's schedule view — drag-to-reschedule, walk-in handling
2. Client lookup — search, profile, history, notes
3. Checkout flow — multi-tech splits, tips, gift cards, receipts
4. Booking new appointments — recurring, time-off respect, conflict detection
5. Inbound SMS — opening a thread, replying, marking handled
6. Notifications panel — what comes in, who handles what
7. The export button (yes — show them the export button. Trust signal day 1.)

**While they drive:**
- Take notes on every micro-confusion — "they hesitated at...", "they searched for X but it's labeled Y"
- Don't fix UX live unless it's blocking. Note it.
- Answer questions in their language, not your tech language

### Afternoon — Sit at the front desk (2-4 hours, observation mode)

This is the highest-value period of your entire week.

- [ ] Sit (literally) at or beside the front desk during their first business hours live
- [ ] Watch every transaction, every booking, every SMS
- [ ] Help only when explicitly asked (otherwise observe + take notes)
- [ ] Note things they DON'T do — features they could be using but aren't
- [ ] Listen to staff banter — "this thing keeps doing X" tells you what to fix
- [ ] At end of day, debrief with the front desk lead for 15 min:
  - "What surprised you (good or bad)?"
  - "What was harder than expected?"
  - "What was easier than expected?"
  - "What did you wish was different?"

**Document immediately after** — these notes get fuzzy fast. Spend 30 min in your car / at a coffee shop right after, writing it all down.

### Evening — Owner debrief (30 min)

Quick call with the owner at end of day:
- "How did it go from your view?"
- "Did anything go badly that I should know about?"
- "What's the #1 thing that needs to be different by tomorrow morning?"

Fix anything blocking before close of day. Send a recap text the next morning.

---

## Week 1 — High-touch white glove

Daily:
- [ ] Morning: check their dashboard for overnight issues / anomalies
- [ ] Send a "good morning, all looks normal" text by 9am if quiet
- [ ] Reply to any support question within 30 min during business hours
- [ ] Evening: 5-min retrospective text — "anything I should know about today?"

End of week 1:
- [ ] 30-min retrospective call with the owner
- [ ] Walk through the week's metrics together (bookings, checkouts, AI report query)
- [ ] Capture issues / requests in your shared issue log
- [ ] Decide what to fix this week vs queue for product roadmap

**Issue log format (Google Sheet):**

| Date | Salon | Issue (their words) | Severity (1-5) | Type (bug · UX · missing feature · workflow gap) | Status | Action |
|---|---|---|---|---|---|---|
| 2026-05-15 | Salon A | "Client search is slow when typing" | 3 | UX | open | Investigate indexing |
| 2026-05-16 | Salon A | "Wanted to mark appt as no-show, couldn't find button" | 4 | Missing feature | shipped | Added to checkout flow |

---

## Weeks 2-4 — Gradual hand-off

Each week, do less:
- Week 2: respond within 1 hour during business hours, daily check-in
- Week 3: respond within 4 hours, twice-a-week check-in
- Week 4: respond within a business day, weekly check-in

By end of week 4, they should be running independently with normal email-tier support.

**Critical rule:** if they STILL need daily hand-holding after 4 weeks, the product has a hole big enough that you need to fix it before adding more Founders' Members. Don't paper over with manual support — fix the underlying gap.

---

## Month 2-3 — Regular operations + the shadow day

By month 2, they should be a normal customer.

**The exception: schedule one "shadow day" per Founders' Member during month 2 or 3.**

### The shadow day (the most valuable single day of the entire concierge phase)

You spend a full 8-hour business day at their salon, in person if at all possible. You're not there to support — they don't need it anymore. You're there to OBSERVE.

What to do:
- [ ] Arrive 30 min before they open
- [ ] Sit somewhere visible but out of the way (back of the waiting area is good)
- [ ] No laptop. Notebook + pen.
- [ ] Watch everything. Front desk. Tech-client interactions. Owner walking around.
- [ ] Note every workflow, even ones outside your software
- [ ] Note what they DO that your software doesn't help with
- [ ] Note what they DON'T do that your software thinks they should
- [ ] Note the paper they're shuffling, the post-its on monitors, the texts to personal phones
- [ ] Lunch break: chat with the owner / front desk over food. Off-record.
- [ ] Stay through close — closing rituals (cash drop, daily report) often expose hidden workflows
- [ ] Drive home (or grab coffee) and write everything down within 90 min

**What to look for specifically:**

| Pattern | What it means |
|---|---|
| Multiple paper notes around a station | A workflow you should digitize |
| Front desk uses two monitors | A view consolidation opportunity |
| Owner texts staff via personal phone | A team comms feature gap |
| Receipts printed AND emailed | They don't trust the email; possible bug |
| Tech leaves their station to ask front desk a question | An info-display gap on the tech side |
| Stuff written on dry-erase board | Persistent state that's not in the system |

This day is worth more than a year of customer interview Zoom calls. Expense the trip if you have to fly.

---

## Documentation: what to capture across all 3 Founders' Members

Maintain three running docs (Google Doc / Notion / wherever you live):

### 1. Issues + requests log
Every issue, every feature request, every "I wish it did X" — even if you don't act on it. After 3 salons you'll see patterns: 3 of 3 saying the same thing = top of roadmap.

### 2. Verbatim quote bank
Every time a Founders' Member says something striking, copy it down word-for-word with their name + date. These become:
- Your homepage testimonials (when they consent)
- Your sales talk-tracks
- Your investor deck
- Your retention campaigns

### 3. "Things that surprised me" diary
Personal, daily-ish journal of things that didn't match your expectations. Examples:
- "Salon A doesn't use loyalty AT ALL even though it's free for them"
- "Salon B's owner does ALL the marketing herself — front desk doesn't touch it"
- "Salon C wanted multi-location BEFORE going live with a single location"

These surprises are where your product roadmap secretly lives.

---

## When to graduate someone out of concierge

A Founders' Member is "graduated" when:
- ✅ 90 days have passed since migration day
- ✅ They haven't filed a "I need help right now" ticket in the last 14 days
- ✅ Their staff use the product without asking the owner for help
- ✅ Their feedback shifts from "this is broken" to "I wish this also did X"
- ✅ They've referred at least one other salon owner

Once graduated, transition them to your standard Founders' Member cadence (~30 min/month feedback for the first 6 months). Now you have bandwidth for the next concierge salon.

---

## Anti-patterns to avoid

These all destroy concierge value:

| ❌ Don't | Why |
|---|---|
| Onboard 5+ at once | Bandwidth dilutes; observation depth drops |
| Manage support via chatbot only | You miss the qualitative data — show up in person |
| Skip the shadow day "to save time" | The shadow day is THE point of the whole exercise |
| Fix bugs without writing them down | The pattern across salons is what builds your roadmap |
| Push them to use every feature | Watch what they don't use; ask why; that's signal |
| Let them think this is the long-term experience | Set expectations — concierge is for the first 90 days only |
| Charge them | Founders' Members are free — they're paying you in feedback |

---

## What a "successful" concierge phase looks like — checklist for each salon

- [ ] Migrated cleanly, no data lost
- [ ] Salon went live on planned date
- [ ] First-week staff ramp completed without major incidents
- [ ] You have 1 in-person shadow day completed
- [ ] You have ≥30 documented issues / observations from the engagement
- [ ] You have ≥10 verbatim quotes captured
- [ ] You have ≥3 product changes shipped because of what you learned
- [ ] They've referred ≥1 other salon owner
- [ ] They've consented to be a public testimonial / case study
- [ ] You can now confidently describe "a day in the life of a [their type of] salon owner"

If you can check all 10 boxes for 3 different salons, you have product-market fit signal.

---

## What this generates that you can use

After 3 concierge engagements you should have:
- ~90 documented issues (your 12-month product backlog)
- ~30 verbatim customer quotes (marketing gold for years)
- 3 case studies you can publish (with consent)
- 3 highly-loyal customers who refer others
- Insider understanding of how 3 different salon types operate
- A repeatable migration process you can document for self-serve onboarding later
- Realistic data on what migration ACTUALLY takes (the input to your post-Founders' pricing of an "onboarding service" if you offer one)

Worth the 30-50 hours per salon. By a long shot.

---

## Status

Drafted 2026-05-09. v1 — pre-first-Founders'-Member. Refresh after onboarding salon #1.
