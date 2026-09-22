#!/usr/bin/env python3
"""Strategy Lab command line.

  python run.py math                                   the numbers behind "win every day"
  python run.py demo                                   both strategies on edge-free random data
  python run.py backtest --csv XAUUSD_H1.csv           one backtest with default parameters
  python run.py validate --csv XAUUSD_H1.csv           walk-forward + Monte Carlo + stress -> verdict
  python run.py portfolio --csv a.csv b.csv c.csv      validate several markets, combine them

Export data from MetaTrader 5: View > Symbols > Bars > pick symbol & timeframe
> Request > Export Bars. Use as many years as the broker gives you.
"""
import argparse
import os
import sys

import numpy as np
import pandas as pd

from lab import backtest, data, metrics, riskmath, validate
from lab.strategies import PARAM_GRIDS, STRATEGIES


def _parse_params(items):
    out = {}
    for it in items or []:
        k, v = it.split("=")
        out[k] = int(v) if v.isdigit() else float(v)
    return out


def cmd_math(_):
    print("\n== Can a strategy profit every single day? ==")
    print("  P(green day) for an annualised Sharpe ratio (daily P&L ~ normal):")
    for s in (0.5, 1, 2, 3, 5):
        print(f"    Sharpe {s:>3}: {100 * riskmath.prob_green_day(s):5.1f}% of days profitable")
    need = riskmath.sharpe_for_green_days(0.99)
    print(f"  Sharpe needed for 99% green days: {need:.0f}  "
          "(top hedge funds run 1-3; anything claiming 30+ is lying or hiding tail risk)")

    print("\n== Win rate is meaningless without the payoff ==")
    print(f"  {'avg win : avg loss':<20}{'break-even win rate':>22}")
    for b in (0.2, 0.33, 0.5, 1, 2, 3):
        print(f"  {f'{b:g} : 1':<20}{100 * riskmath.breakeven_winrate(b):>21.1f}%")
    print("  A 90% win rate that wins 0.1R and loses 1R has expectancy "
          f"{riskmath.expectancy(0.9, 0.1, 1.0):+.2f}R per trade -> slow bleed.")
    print("  A 35% win rate that wins 3R and loses 1R has expectancy "
          f"{riskmath.expectancy(0.35, 3.0, 1.0):+.2f}R per trade -> real edge.")

    print("\n== Losing streaks are guaranteed ==")
    for p in (0.35, 0.5, 0.6):
        print(f"  win rate {p:.0%}: chance of >=8 losses in a row within 300 trades = "
              f"{100 * riskmath.losing_streak_prob(p, 8, 300):.0f}%")

    print("\n== The 'never lose a day' trick: martingale ==")
    ruin, med = riskmath.martingale_sim(p_win=0.5, bankroll=1000, max_rounds=2000)
    print(f"  Double-after-loss, 50/50 bets, $1 base on $1,000: {100 * ruin:.0f}% of accounts "
          f"wiped out within 2,000 bets (median life {med:.0f} bets).")
    print("  Grid/martingale EAs show beautiful smooth curves right up to that day.")

    print("\n== How much to risk (Kelly) ==")
    k = riskmath.kelly_fraction(0.40, 2.0)
    print(f"  40% win rate, 2:1 payoff -> full Kelly {100 * k:.0f}% per trade; "
          f"use 1/4-1/2 Kelly => {25 * k:.1f}%-{50 * k:.1f}%. Retail rule of thumb: 0.5-1%.\n")


def cmd_demo(_):
    df = data.random_walk(n=30_000, seed=7)
    print("\nSynthetic RANDOM WALK -- no edge exists in this data by construction.")
    print("Anything that 'makes money' here is luck; anything that loses is paying costs.\n")
    for name in ("trend_breakout", "high_winrate_trap"):
        res = backtest.run(df, STRATEGIES[name](df), risk_pct=0.01)
        print(f"-- {name}")
        print(metrics.fmt(metrics.summary(res)))
        print()
    print("Read the trap's win rate, then its net return. That gap is the whole lesson.\n")


def _load(path, point):
    df = data.load_csv(path, point=point)
    print(f"\nLoaded {path}: {len(df):,} bars  {df.index[0]} -> {df.index[-1]}"
          + ("  (per-bar spread from file)" if "spread" in df else ""))
    return df


def cmd_backtest(a):
    df = _load(a.csv, a.point)
    p = _parse_params(a.param)
    res = backtest.run(df, STRATEGIES[a.strategy](df, **p), risk_pct=a.risk, spread=a.spread)
    print(f"\n-- {a.strategy} {p or '(defaults)'}  IN-SAMPLE, not validated")
    print(metrics.fmt(metrics.summary(res)))
    if a.trades_out:
        res.trades.to_csv(a.trades_out, index=False)
        print(f"\ntrades written to {a.trades_out}")


def _validate(df, a, label=""):
    strat, grid = STRATEGIES[a.strategy], PARAM_GRIDS[a.strategy]
    bt = dict(risk_pct=a.risk, spread=a.spread)
    print(f"\n== {label}{a.strategy}: walk-forward, {a.folds} folds, parameters picked by plateau ==")
    oos, log = validate.walk_forward(df, strat, grid, folds=a.folds, **bt)
    print(log.to_string(index=False))
    s = metrics.summary(oos)
    print("\n-- stitched OUT-OF-SAMPLE result (the only number that counts)")
    print(metrics.fmt(s))

    full = validate.sweep(df, strat, grid, min_trades=1, **bt)
    share_pos = float((full.expectancy_R > 0).mean())
    print(f"\n-- robustness: {100 * share_pos:.0f}% of {len(full)} parameter sets have positive expectancy")

    last = log.iloc[-1]
    p = {k: last[k] for k in grid}
    p = {k: (int(v) if isinstance(grid[k][0], int) else float(v)) for k, v in p.items()}
    sig = strat(df, **p)
    d2 = df.copy()
    if "spread" in d2:
        d2["spread"] *= 2
    stressed = metrics.summary(backtest.run(d2, sig, risk_pct=a.risk,
                                            spread=(a.spread or 0) * 2))
    print(f"-- cost stress (spread x2, last fold's params): profit factor "
          f"{stressed.get('profit_factor', 0):.2f}, net {stressed.get('net_return_pct', 0):+.1f}%")

    mc = validate.monte_carlo(oos.trades.r, risk_pct=a.risk)
    print("-- Monte Carlo (5,000 reshuffles of the OOS trades)")
    print(metrics.fmt(mc))

    n = s.get("trades", 0)
    r = oos.trades.r
    tstat = float(r.mean() / r.std() * np.sqrt(len(r))) if n > 1 and r.std() > 0 else 0.0
    checks = [
        ("at least 100 out-of-sample trades", n >= 100),
        ("OOS expectancy t-stat > 2", tstat > 2),
        ("OOS profit factor > 1.2", s.get("profit_factor", 0) > 1.2),
        ("60%+ of parameter sets profitable", share_pos >= 0.6),
        ("still profitable at double spread", stressed.get("profit_factor", 0) > 1.0),
        ("95th pct Monte Carlo drawdown better than -30%", mc.get("p95_worst_dd_pct", -100) > -30),
    ]
    print("\n== VERDICT ==")
    for txt, ok in checks:
        print(f"  [{'PASS' if ok else 'FAIL'}] {txt}")
    passed = all(ok for _, ok in checks)
    print("  => " + ("Candidate for a DEMO account forward test (not real money yet)."
                     if passed else "Do NOT trade this. It has not proven an edge on this data."))
    return oos, passed


def cmd_validate(a):
    _validate(_load(a.csv, a.point), a)


def cmd_portfolio(a):
    rets, verdicts = {}, {}
    for path in a.csv:
        name = os.path.splitext(os.path.basename(path))[0]
        oos, ok = _validate(_load(path, a.point), a, label=f"{name} | ")
        rets[name] = oos.equity.resample("D").last().dropna().pct_change()
        verdicts[name] = ok
    daily = pd.DataFrame(rets).fillna(0.0)
    combo = daily.mean(axis=1)                       # equal weight across markets
    eq = (1 + combo).cumprod()
    act = combo[combo != 0]
    sharpe = float(combo.mean() / combo.std() * np.sqrt(252)) if combo.std() > 0 else 0.0
    print("\n== PORTFOLIO (equal weight, out-of-sample only) ==")
    print(f"  markets              {len(a.csv)}  (passed individually: {sum(verdicts.values())})")
    print(f"  return               {100 * (eq.iloc[-1] - 1):+.1f}%")
    print(f"  max drawdown         {100 * float((eq / eq.cummax() - 1).min()):.1f}%")
    print(f"  daily Sharpe (ann.)  {sharpe:.2f}")
    print(f"  green active days    {100 * float((act > 0).mean()) if len(act) else 0:.1f}%")
    print("  Correlation of daily returns:")
    print(daily.corr().round(2).to_string())


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("math")
    sub.add_parser("demo")
    for name, many in (("backtest", False), ("validate", False), ("portfolio", True)):
        p = sub.add_parser(name)
        p.add_argument("--csv", required=True, nargs="+" if many else None)
        p.add_argument("--strategy", default="trend_breakout", choices=STRATEGIES)
        p.add_argument("--risk", type=float, default=0.01, help="fraction of equity risked per trade")
        p.add_argument("--spread", type=float, default=None,
                       help="fixed spread in price units if the CSV has none (e.g. 0.30 for gold)")
        p.add_argument("--point", type=float, default=0.01, help="MT5 point size for the spread column")
        p.add_argument("--folds", type=int, default=6)
        if name == "backtest":
            p.add_argument("--param", nargs="*", help="e.g. entry_n=55 stop_atr=2")
            p.add_argument("--trades-out")
    a = ap.parse_args(argv)
    {"math": cmd_math, "demo": cmd_demo, "backtest": cmd_backtest,
     "validate": cmd_validate, "portfolio": cmd_portfolio}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
