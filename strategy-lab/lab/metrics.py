"""Performance statistics. Win rate is reported, but it is the least
important number here -- read expectancy, profit factor and drawdown first."""
import numpy as np
import pandas as pd


def max_drawdown(equity):
    peak = equity.cummax()
    return float(((equity - peak) / peak).min())


def summary(res, start_equity=10_000.0):
    t, eq = res.trades, res.equity
    out = {"trades": len(t)}
    if len(t) == 0:
        return out | {"note": "no trades"}
    wins, losses = t.pnl[t.pnl > 0], t.pnl[t.pnl <= 0]
    daily = eq.resample("D").last().dropna()
    dret = daily.pct_change().dropna()
    active = dret[dret != 0]
    years = max((eq.index[-1] - eq.index[0]).days / 365.25, 1e-9)
    final = float(eq.iloc[-1])
    out.update({
        "net_return_pct": 100 * (final / start_equity - 1),
        "cagr_pct": 100 * ((final / start_equity) ** (1 / years) - 1) if final > 0 else -100.0,
        "win_rate_pct": 100 * len(wins) / len(t),
        "avg_win_R": float(t.r[t.r > 0].mean()) if len(wins) else 0.0,
        "avg_loss_R": float(t.r[t.r <= 0].mean()) if len(losses) else 0.0,
        "expectancy_R": float(t.r.mean()),
        "profit_factor": float(wins.sum() / -losses.sum()) if losses.sum() < 0 else float("inf"),
        "max_drawdown_pct": 100 * max_drawdown(eq),
        "sharpe_daily_ann": float(dret.mean() / dret.std() * np.sqrt(252)) if dret.std() > 0 else 0.0,
        "green_days_pct_of_active": 100 * float((active > 0).mean()) if len(active) else 0.0,
        "worst_losing_streak": _streak(t.pnl.to_numpy() <= 0),
        "green_months_pct": 100 * float((eq.resample("ME").last().pct_change().dropna() > 0).mean()),
    })
    return out


def _streak(mask):
    best = cur = 0
    for m in mask:
        cur = cur + 1 if m else 0
        best = max(best, cur)
    return int(best)


def fmt(d):
    return "\n".join(f"  {k:<26}{v:>12.2f}" if isinstance(v, float) else f"  {k:<26}{v!s:>12}"
                     for k, v in d.items())
