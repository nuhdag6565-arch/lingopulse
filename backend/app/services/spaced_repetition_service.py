from dataclasses import dataclass


@dataclass
class ReviewResult:
    new_level: int
    new_ease_factor: float
    new_interval_days: int


def calculate_next_review(
    knew_it: bool,
    current_level: int,
    current_ease_factor: float,
    current_interval_days: int,
) -> ReviewResult:
    quality = 5 if knew_it else 2

    new_ef = max(
        1.3,
        current_ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
    )

    if quality < 3:
        new_level = 0
        new_interval = 1
    else:
        new_level = min(5, current_level + 1)
        if new_level == 1:
            new_interval = 1
        elif new_level == 2:
            new_interval = 6
        else:
            new_interval = round(current_interval_days * new_ef)

    return ReviewResult(
        new_level=new_level,
        new_ease_factor=round(new_ef, 4),
        new_interval_days=max(1, new_interval),
    )
