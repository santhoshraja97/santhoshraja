---
title: "Error Budgets in Plain Words"
date: 2026-10-30
tags: [SLOs, Error Budgets, SRE]
summary: "An error budget isn't a penalty. It's permission to move fast, with a limit."
---

An **SLO** says how reliable a service needs to be. The **error budget** is everything left over: the amount of unreliability you're *allowed* to spend.

## The quick math

If your availability SLO is **99.9%** over 30 days:

| SLO | Allowed downtime / 30 days |
| --- | --- |
| 99%   | ~7 h 12 m |
| 99.9% | ~43 m |
| 99.95% | ~21 m |
| 99.99% | ~4 m |

That 43 minutes is your budget. Deployments, experiments and the occasional bad day all come out of it.

## Why it changes the conversation

Without a budget, every outage is a negotiation between "ship faster" and "be careful". With one, the rule is simple:

1. **Budget left?** Ship features and take sensible risks.
2. **Budget burning fast?** Slow down, fix reliability first.
3. **Budget gone?** Freeze risky changes until it recovers.

## Alert on burn rate, not on every blip

Instead of paging on every error spike, alert when you're burning budget too fast:

```text
page   if 2% of the monthly budget burns in 1 hour
ticket if 10% of the monthly budget burns in 3 days
```

That one change usually cuts alert noise sharply, and the pages that remain actually matter.

---

*Want help setting SLOs for your services? [Bring me your scenario](consult.html).*
