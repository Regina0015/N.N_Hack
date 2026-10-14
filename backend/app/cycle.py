"""Cycle context for the coach: the date math happens here, not in the model.

Evidence behind the guidance (see docs/cycle-research.md):
- Performance changes across phases are trivial and inconsistent (McNulty 2020; Colenso-Semple 2023),
  so phases are a hint for conversation, never a rule for programming.
- Symptoms (fatigue, cramps, mood, sleep) are common and do affect training (Bruinvels 2021),
  so the coach asks how the user feels instead of assuming.
"""
from datetime import date

from app.schemas import CycleInfo

DEFAULT_CYCLE_DAYS = 28
DEFAULT_PERIOD_DAYS = 5
LUTEAL_DAYS = 14  # Ovulation is estimated this many days before the next period.
PREMENSTRUAL_DAYS = 5
LATE_GRACE_DAYS = 7

CYCLE_GUIDANCE = """Menstrual cycle guidance (the user opted in):
- Phases are an estimate. Research finds only trivial, inconsistent performance changes across the cycle,
  so never prescribe training by phase. Ask how they feel today and let symptoms lead.
- Mention the cycle only when it's relevant (energy, pain, sleep, hunger, mood) or the user brings it up.
- During the period: movement often eases cramps (walking, light cardio, yoga, mobility). Offer it, never push;
  resting is fine too.
- Premenstrual days: sleep, mood and energy can dip and hunger can rise a little. That's normal, so no guilt
  about extra food or a lighter session.
- Heavy bleeding plus tiredness can mean low iron: suggest iron-rich foods and checking iron with a doctor.
  Don't prescribe supplements.
- Suggest seeing a doctor (calmly, without diagnosing) for: no period for 3 months while not pregnant and not
  on contraception that stops periods; changing a pad/tampon every 1-2 hours; bleeding over 7 days; pain that
  stops daily life; bleeding between periods; cycles regularly shorter than 21 or longer than 35 days (45 for teens).
- Missing periods while training hard or eating little is a warning sign of low energy availability (REDs):
  never encourage a bigger calorie deficit, and suggest a professional.
- Never use the cycle for fertility or contraception advice."""


def _phase(day: int, cycle_days: int, period_days: int) -> str:
    ovulation = cycle_days - LUTEAL_DAYS
    if day <= period_days:
        return "period (menstruation)"
    if day >= cycle_days - PREMENSTRUAL_DAYS + 1:
        return "premenstrual (late luteal)"
    if abs(day - ovulation) <= 1:
        return "around ovulation"
    if day < ovulation:
        return "follicular (after the period)"
    return "luteal"


def describe_cycle(cycle: CycleInfo | None, age: int, today: date) -> str:
    """One line for the system prompt with the facts the user shared and an estimated phase."""
    cycle = cycle or CycleInfo()
    facts = ["Wants cycle-aware coaching"]
    if cycle.average_cycle_days:
        facts.append(f"usual cycle {cycle.average_cycle_days} days")
        upper = 45 if age < 18 else 35
        if not 21 <= cycle.average_cycle_days <= upper:
            facts.append(f"outside the typical 21-{upper} day range")
    if cycle.period_days:
        facts.append(f"bleeds about {cycle.period_days} days")
    if cycle.regularity == "irregular":
        facts.append("cycle is irregular")
    elif cycle.regularity == "unsure":
        facts.append("not sure if regular")

    if cycle.hormonal_contraception == "yes":
        facts.append("uses hormonal contraception, so there are no natural phases: go by symptoms")
        return "; ".join(facts)
    if not cycle.last_period_start:
        facts.append("no last period date, so the phase is unknown")
        return "; ".join(facts)

    cycle_days = cycle.average_cycle_days or DEFAULT_CYCLE_DAYS
    period_days = cycle.period_days or DEFAULT_PERIOD_DAYS
    days_since = (today - cycle.last_period_start).days
    if days_since < cycle_days:
        day, note = days_since + 1, ""
    elif cycle.regularity == "regular" and days_since < 3 * cycle_days:
        day, note = days_since % cycle_days + 1, " (projected past the saved date, less reliable)"
    else:
        late = days_since >= cycle_days + LATE_GRACE_DAYS
        facts.append(
            f"last period started {days_since} days ago"
            + (", longer than the usual cycle: the period may be late or the date outdated" if late else "")
            + ". Don't assume a phase. If it comes up, gently ask and suggest updating the date in Perfil"
        )
        return "; ".join(facts)

    if not cycle.average_cycle_days:
        note += " (assumes a 28-day cycle)"
    if cycle.regularity in ("irregular", "unsure"):
        note += " (may be off: irregular or unsure cycle)"
    facts.append(f"today is about cycle day {day}, estimated phase: {_phase(day, cycle_days, period_days)}{note}")
    return "; ".join(facts)
