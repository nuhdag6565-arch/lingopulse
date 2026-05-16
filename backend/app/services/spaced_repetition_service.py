"""SM-2 spaced repetition algorithm implementation.

SM-2 paper: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-of-learning
Quality scores:
  5 = knew_it (perfect recall)
  2 = did_not_know (total blank)
"""

from datetime import datetime, timedelta, timezone
from dataclasses import dataclass


@dataclass
class ReviewResult:
    new_level: int
    new_ease_factor: float
    new_interval_days: int
    next_review_date: datetime


def calculate_next_review(
    knew_it: bool,
    current_level: int,
    current_ease_factor: float,
    current_interval_days: int,
) -> ReviewResult:
    quality = 5 if knew_it else 2

    # Clamp ease factor to SM-2 minimum
    new_ef = max(
        1.3,
        current_ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
    )

    if quality < 3:
        new_level = 0
        new_interval = 1
    else:
        new_level = min(current_level + 1, 5)
        if current_level == 0:
            new_interval = 1
        elif current_level == 1:
            new_interval = 6
        else:
            new_interval = round(current_interval_days * new_ef)

    next_date = datetime.now(timezone.utc) + timedelta(days=new_interval)
    return ReviewResult(
        new_level=new_level,
        new_ease_factor=new_ef,
        new_interval_days=new_interval,
        next_review_date=next_date,
    )
