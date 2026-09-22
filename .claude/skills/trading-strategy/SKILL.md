---
name: trading-strategy
description: Design, backtest and validate trading strategies honestly with the strategy-lab toolkit in this repo. Use when the user asks for a trading strategy, a "high win rate" or "profit every day" system, wants to test an EA/bot/indicator idea, evaluate backtest results, choose risk per trade, or turn MT5 CSV exports into a go/no-go verdict.
---

# Trading strategy skill

The toolkit lives in `strategy-lab/`. Read `strategy-lab/STRATEGY.md` for the playbook.

## Principles (non-negotiable)

1. **Never promise daily profit or a guaranteed win rate.** Run `python run.py math` and show the numbers. P(green day) ≈ Φ(Sharpe/√252), so even Sharpe 3 gives only about 57% green days.
2. **Win rate is secondary.** Judge by expectancy E = p·W − (1−p)·L, profit factor, max drawdown, and the out-of-sample t-stat. Flag any "90% win rate" claim as a probable hidden tail risk (martingale, grid, tiny TP with a huge SL).
3. **Only out-of-sample results count.** Use `validate` (walk-forward with plateau-based parameter choice). In-sample `backtest` output is labeled as such and must not be quoted as expected performance.
4. **Costs are always on.** Use the per-bar spread from the MT5 export, or pass `--spread`. Always include the double-spread stress test.
5. **Risk 0.5–1% per trade** and one position per market. Never suggest martingale, averaging down, or widening stops.
6. **Consistency comes from diversification** (`portfolio` across uncorrelated markets), not from a higher win rate.
7. **Never fabricate results.** If no real data is available, say so and use `demo` only to illustrate mechanics.

## Workflow

```bash
cd strategy-lab && pip install -r requirements.txt
python -m unittest discover -s tests -t .          # engine sanity
python run.py validate --csv <FILE> [--spread X] [--point P]
python run.py portfolio --csv <F1> <F2> ...
```

Report the stitched OOS summary, the robustness share, the cost stress result, the Monte Carlo 95th-percentile drawdown, and the six-item verdict. If any check fails, the answer is "don't trade it". Don't re-tune until it passes, because that is curve fitting.

## Adding a strategy

Add a function to `lab/strategies.py` returning `entry / stop_dist / target_dist / trail_dist` computed from closed bars only. Register it in `STRATEGIES` and `PARAM_GRIDS` with a small grid (≤ ~60 combos). Add a no-look-ahead test like `test_no_lookahead`.
