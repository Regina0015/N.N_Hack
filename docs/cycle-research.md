# Menstrual cycle and exercise: evidence behind the coach

This is what Nido asks about the cycle and how Semi uses it. The code is in `backend/app/cycle.py`
(date math and `CYCLE_GUIDANCE`) and `frontend/src/components/onboarding/OnboardingForm.tsx` (questions).

> Not medical advice. The coach never diagnoses; it suggests seeing a professional when red flags appear.

## What is "normal"

| Measure | Typical range | Source |
|---|---|---|
| Cycle length (first day of one period → first day of the next) | 21–35 days in adults (FIGO uses 24–38) | ACOG; FIGO 2007 |
| Cycle length in teens | 21–45 days in the first years after the first period | ACOG Committee Opinion 651 |
| Bleeding | 2–7 days (average ~5) | ACOG; NI Direct |

Two different numbers get confused all the time: **how many days you bleed** and **how many days between periods**.
That's why the onboarding asks them as two separate, explicit questions.

## Exercise performance across the cycle

- **McNulty et al. 2020 (Sports Medicine, 78 studies):** performance may be *trivially* lower in the early follicular
  phase (the period days). The effect is small, varies a lot between studies, and many studies were poor quality, so
  the authors say no general guidelines can be made and advise a **personalised** approach.
- **Colenso-Semple et al. 2023 (umbrella review):** there is no evidence that cycle phase affects acute strength or
  strength/muscle gains. Programming resistance training by phase is **not evidence-based**.
- **Elliott-Sale et al. 2020:** the pill may cause slightly lower performance than natural cycles, but performance is
  consistent across the pill cycle. With hormonal contraception there are no natural phases to estimate.

**What Nido does:** it estimates the phase only as conversational context, never as a training rule. Semi asks
how the user feels and lets symptoms lead.

## Symptoms matter more than phases

- **Bruinvels et al. 2021 (BJSM, 6,812 exercising women):** the most common symptoms were mood changes/anxiety (90.6%),
  fatigue (86.2%), cramps (84.2%) and breast tenderness (83.1%). More symptoms went with more missed or changed training.
- **Exercise for period pain (Cochrane 2019, 12 trials):** exercise likely reduces menstrual pain. ACOG also recommends
  it. So Semi *offers* light movement during the period and treats rest as equally valid.
- **Sleep:** many women report worse sleep in the premenstrual week, and actigraphy shows small drops in sleep
  efficiency. Lab results are mixed. This links to the sleep check-in (plan step 2).
- **Appetite and energy:** intake tends to be a bit higher in the luteal phase (a meta-analysis reports ~170 kcal/day
  on average), with a small rise in resting energy use. Semi frames this as normal and guilt-free.
- **Injury (ACL):** a 2023 systematic review found the evidence inconclusive. Nido makes no injury claims by phase.

## Red flags → suggest a professional

- No period for about 3 months (when not pregnant and not on contraception that stops periods).
- Changing a pad or tampon every 1–2 hours, bleeding longer than 7 days, clots larger than ~2.5 cm (NHS).
- Pain that stops daily life, or bleeding between periods or after sex (NHS).
- Cycles regularly shorter than 21 or longer than 35 days (45 in teens).
- **Heavy bleeding + tiredness:** possible iron deficiency. Heavy menstrual bleeding was reported by over a third of
  athletes surveyed by Bruinvels et al. 2016. Semi suggests iron-rich foods and asking a doctor to check iron, and it
  doesn't prescribe supplements.
- **Missing periods while training hard or eating little:** a warning sign of low energy availability
  (REDs, IOC consensus 2023). Semi never pushes a bigger calorie deficit.

## Privacy

Cycle data is sensitive health data. Nido keeps everything optional, stores it only in the user's profile row
(RLS on, no public API access), sends it only to the coach model, and never uses it for fertility or contraception
predictions.

## Sources

- ACOG Committee Opinion 651, *Menstruation in Girls and Adolescents: Using the Menstrual Cycle as a Vital Sign*: https://www.contemporarypediatrics.com/view/menstruation-sixth-vital-sign
- Cycle length (FIGO vs ACOG): https://cemcor.ubc.ca/?p=1663
- McNulty et al. 2020: https://nrl.northumbria.ac.uk/id/eprint/43759
- Colenso-Semple et al. 2023: https://pmc.ncbi.nlm.nih.gov/articles/PMC10076834
- Elliott-Sale et al. 2020: https://nrl.northumbria.ac.uk/id/eprint/43772
- Bruinvels et al. 2021, symptoms in 6,812 women: https://bjsm.bmj.com/content/55/8/438
- Cochrane 2019, exercise for dysmenorrhoea: https://www.cochrane.org/CD004142
- Bruinvels et al. 2016, heavy menstrual bleeding in athletes: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4763330/
- IOC REDs consensus 2023: https://nih.brage.unit.no/nih-xmlui/handle/11250/3135521
- Energy intake across the cycle: https://pmc.ncbi.nlm.nih.gov/articles/PMC10251302/
- Sleep across the cycle: https://pmc.ncbi.nlm.nih.gov/articles/PMC4327930/
- ACL risk by phase, systematic review 2023: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9879429/
- NHS heavy periods: https://www.nhs.uk/conditions/heavy-periods/
- Period tracker privacy (Mozilla): https://blog.mozilla.org/en/internet-culture/privacy-practices-period-trackers/
