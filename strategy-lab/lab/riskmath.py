"""The math that decides whether a strategy can make money, and how often.

Expectancy per trade, in units of R (R = the amount risked):
    E = p * W - (1 - p) * L
where p = win rate, W = average win in R, L = average loss in R.
Break-even win rate for a payoff ratio b = W / L:   p* = 1 / (1 + b)
"""
import math

import numpy as np


def expectancy(p, avg_win_r, avg_loss_r=1.0):
    return p * avg_win_r - (1 - p) * avg_loss_r


def breakeven_winrate(payoff_ratio):
    return 1.0 / (1.0 + payoff_ratio)


def kelly_fraction(p, payoff_ratio):
    """Growth-optimal fraction of capital to risk per trade. Real traders use
    a quarter to a half of this, because p and b are only estimates."""
    return max(0.0, p - (1 - p) / payoff_ratio)


def prob_green_day(annual_sharpe, days=252):
    """If daily P&L is roughly normal, P(day > 0) = Phi(Sharpe / sqrt(days)).
    Sharpe 1 (good fund) -> ~52.5% green days. Sharpe 3 (world-class) -> ~57%.
    'Profit every single day' needs a Sharpe no retail strategy has."""
    z = annual_sharpe / math.sqrt(days)
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))


def sharpe_for_green_days(target=0.99, days=252):
    """Sharpe needed so that `target` of days are profitable."""
    lo, hi = 0.0, 200.0
    for _ in range(100):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if prob_green_day(mid, days) < target else (lo, mid)
    return hi


def losing_streak_prob(p_win, streak, n_trades, sims=20_000, seed=1):
    """Chance of at least one run of `streak` consecutive losses in n trades."""
    rng = np.random.default_rng(seed)
    losses = rng.random((sims, n_trades)) > p_win
    hit = np.zeros(sims, bool)
    run = np.zeros(sims, int)
    for j in range(n_trades):
        run = np.where(losses[:, j], run + 1, 0)
        hit |= run >= streak
    return float(hit.mean())


def martingale_sim(p_win=0.5, base=1.0, bankroll=1000.0, max_rounds=2000, sims=10_000, seed=2):
    """Double after every loss. Wins ~every day -- until the streak that ends
    the account. Returns (fraction of accounts ruined, median rounds survived)."""
    rng = np.random.default_rng(seed)
    ruined, survived = 0, []
    for _ in range(sims):
        bank, bet = bankroll, base
        for k in range(max_rounds):
            if bet > bank:
                ruined += 1
                survived.append(k)
                break
            if rng.random() < p_win:
                bank += bet
                bet = base
            else:
                bank -= bet
                bet *= 2
        else:
            survived.append(max_rounds)
    return ruined / sims, float(np.median(survived))
