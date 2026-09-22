"""Validation: the part that separates an edge from a lucky curve fit.

  sweep()        test every parameter combination
  plateau()      score each combination by its NEIGHBOURHOOD, not its peak
  walk_forward() choose on past data only, trade the next unseen window,
                 stitch the unseen windows together
  monte_carlo()  reshuffle the trade sequence to see the drawdowns luck
                 could have handed you
"""
import itertools

import numpy as np
import pandas as pd

from . import backtest


def _score(res, min_trades):
    r = res.trades.r
    if len(r) < min_trades or r.std() == 0:
        return -np.inf
    return float(r.mean() / r.std() * np.sqrt(len(r)))   # t-stat of expectancy


def _combos(grid):
    keys = list(grid)
    for vals in itertools.product(*(grid[k] for k in keys)):
        yield dict(zip(keys, vals))


def sweep(df, strat, grid, window=None, min_trades=20, **bt):
    rows = []
    for p in _combos(grid):
        sig = strat(df, **p)
        d, s = (df, sig) if window is None else (df.loc[window[0]:window[1]], sig.loc[window[0]:window[1]])
        res = backtest.run(d, s, params=p, **bt)
        rows.append(p | {"score": _score(res, min_trades), "trades": len(res.trades),
                         "expectancy_R": float(res.trades.r.mean()) if len(res.trades) else np.nan})
    return pd.DataFrame(rows)


def plateau(table, grid):
    """Average each combo's score with its immediate grid neighbours. A real
    edge sits on a broad plateau; a curve fit is a lone spike."""
    keys = list(grid)
    pos = {k: {v: i for i, v in enumerate(grid[k])} for k in keys}
    coords = table[keys].apply(lambda r: tuple(pos[k][r[k]] for k in keys), axis=1).tolist()
    lookup = dict(zip(coords, table["score"].replace(-np.inf, np.nan)))
    smooth = []
    for c in coords:
        vals = [lookup.get(tuple(c[j] + (d if j == m else 0) for j in range(len(c))))
                for m in range(len(c)) for d in (-1, 0, 1)]
        vals = [v for v in vals if v is not None and np.isfinite(v)]
        smooth.append(np.mean(vals) if vals else -np.inf)
    return table.assign(plateau_score=smooth)


def walk_forward(df, strat, grid, folds=6, anchored=True, min_trades=20,
                 start_equity=10_000.0, **bt):
    cuts = np.linspace(0, len(df), folds + 1).astype(int)
    eq = start_equity
    curves, trades, log = [], [], []
    for j in range(1, folds):
        tr = (df.index[0 if anchored else cuts[j - 1]], df.index[cuts[j] - 1])
        te = (df.index[cuts[j]], df.index[cuts[j + 1] - 1])
        table = plateau(sweep(df, strat, grid, window=tr, min_trades=min_trades,
                              start_equity=start_equity, **bt), grid)
        best = table.sort_values("plateau_score", ascending=False).iloc[0]
        params = {k: best[k] for k in grid}
        params = {k: (int(v) if float(v).is_integer() and isinstance(grid[k][0], int) else float(v))
                  for k, v in params.items()}
        sig = strat(df, **params)
        res = backtest.run(df.loc[te[0]:te[1]], sig.loc[te[0]:te[1]],
                           start_equity=eq, params=params, **bt)
        eq = float(res.equity.iloc[-1])
        curves.append(res.equity)
        trades.append(res.trades)
        log.append({"fold": j, "test_from": te[0], "test_to": te[1], **params,
                    "train_plateau": round(float(best["plateau_score"]), 2),
                    "oos_trades": len(res.trades),
                    "oos_return_pct": round(100 * (res.equity.iloc[-1] / res.equity.iloc[0] - 1), 2)})
    return backtest.Result(pd.concat(trades, ignore_index=True), pd.concat(curves)), pd.DataFrame(log)


def monte_carlo(r_multiples, risk_pct=0.01, n_trades=None, sims=5000, seed=3):
    r = np.asarray(r_multiples, float)
    if len(r) == 0:
        return {}
    n = n_trades or len(r)
    rng = np.random.default_rng(seed)
    draws = rng.choice(r, size=(sims, n), replace=True)
    paths = np.cumprod(1 + risk_pct * draws, axis=1)
    peaks = np.maximum.accumulate(paths, axis=1)
    dd = ((paths - peaks) / peaks).min(axis=1)
    final = paths[:, -1] - 1
    return {
        "trades_per_path": n,
        "median_return_pct": 100 * float(np.median(final)),
        "p5_return_pct": 100 * float(np.percentile(final, 5)),
        "p95_return_pct": 100 * float(np.percentile(final, 95)),
        "prob_losing_pct": 100 * float((final < 0).mean()),
        "median_max_dd_pct": 100 * float(np.median(dd)),
        "p95_worst_dd_pct": 100 * float(np.percentile(dd, 5)),
    }
