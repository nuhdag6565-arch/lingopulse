import pytest
from app.services.spaced_repetition_service import calculate_next_review


def test_knew_it_increases_level():
    result = calculate_next_review(
        knew_it=True,
        current_level=0,
        current_ease_factor=2.5,
        current_interval_days=1,
    )
    assert result.new_level == 1
    assert result.new_interval_days == 1


def test_did_not_know_resets_level():
    result = calculate_next_review(
        knew_it=False,
        current_level=3,
        current_ease_factor=2.5,
        current_interval_days=10,
    )
    assert result.new_level == 0
    assert result.new_interval_days == 1


def test_ease_factor_increases_on_success():
    result = calculate_next_review(
        knew_it=True,
        current_level=2,
        current_ease_factor=2.5,
        current_interval_days=6,
    )
    assert result.new_ease_factor > 2.5


def test_ease_factor_never_goes_below_minimum():
    result = calculate_next_review(
        knew_it=False,
        current_level=0,
        current_ease_factor=1.3,
        current_interval_days=1,
    )
    assert result.new_ease_factor >= 1.3


def test_interval_grows_exponentially():
    ef = 2.5
    interval = 6
    level = 2
    for _ in range(4):
        result = calculate_next_review(
            knew_it=True,
            current_level=level,
            current_ease_factor=ef,
            current_interval_days=interval,
        )
        assert result.new_interval_days > interval
        interval = result.new_interval_days
        level = result.new_level
        ef = result.new_ease_factor
