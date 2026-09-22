import unittest

import numpy as np
import pandas as pd

from lab import backtest, data, riskmath, validate
from lab.strategies import PARAM_GRIDS, high_winrate_trap, trend_breakout


def _bars(prices, spread=0.0):
    p = np.asarray(prices, float)
    idx = pd.date_range("2024-01-01", periods=len(p), freq="h")
    return pd.DataFrame({"open": p, "high": p + 0.5, "low": p - 0.5, "close": p,
                         "spread": spread}, index=idx)


def _one_signal(df, side, stop, target=np.nan):
    s = pd.DataFrame({"entry": 0, "stop_dist": stop, "target_dist": target,
                      "trail_dist": np.nan}, index=df.index)
    s.iloc[0, 0] = side
    return s


class Engine(unittest.TestCase):
    def test_no_lookahead(self):
        df = data.random_walk(n=4000, seed=5)
        full = backtest.run(df, trend_breakout(df)).trades
        cut = df.iloc[:3000]
        part = backtest.run(cut, trend_breakout(cut)).trades
        done = full[full.exit_time < cut.index[-1]]
        pd.testing.assert_frame_equal(done.reset_index(drop=True),
                                      part[part.exit_time < cut.index[-1]].reset_index(drop=True))

    def test_long_makes_money_in_uptrend(self):
        df = _bars(np.linspace(100, 600, 501))  # +1 per bar, clears the 0.5 wick
        res = backtest.run(df, trend_breakout(df, entry_n=20, trend_n=50))
        self.assertGreater(res.equity.iloc[-1], 10_000)
        self.assertTrue((res.trades.side == 1).all())

    def test_spread_costs_money(self):
        df = data.random_walk(n=3000, seed=9)
        sig = high_winrate_trap(df)
        cheap = backtest.run(df.assign(spread=0.0), sig).equity.iloc[-1]
        dear = backtest.run(df.assign(spread=1.0), sig).equity.iloc[-1]
        self.assertGreater(cheap, dear)

    def test_stop_assumed_before_target_same_bar(self):
        df = _bars([100, 100, 100])
        df.loc[df.index[1], ["high", "low"]] = [110, 90]     # touches both
        t = backtest.run(df, _one_signal(df, 1, stop=5, target=5)).trades
        self.assertEqual(t.reason.iloc[0], "stop")
        self.assertAlmostEqual(t.r.iloc[0], -1.0)

    def test_gap_through_stop_fills_at_open(self):
        df = _bars([100, 100, 80])
        t = backtest.run(df, _one_signal(df, 1, stop=5)).trades
        self.assertEqual(t.reason.iloc[0], "gap_stop")
        self.assertAlmostEqual(t.exit.iloc[0], 80.0)
        self.assertLess(t.r.iloc[0], -3.9)

    def test_risk_sizing(self):
        df = _bars([100, 100, 100])
        df.loc[df.index[2], "low"] = 90
        t = backtest.run(df, _one_signal(df, 1, stop=2), risk_pct=0.01).trades
        self.assertAlmostEqual(t.pnl.iloc[0], -100.0)          # 1% of 10k


class Validation(unittest.TestCase):
    def test_walk_forward_runs_and_is_out_of_sample(self):
        df = data.random_walk(n=6000, seed=3)
        grid = {"entry_n": [20, 55], "stop_atr": [2.0], "trail_atr": [3.0]}
        oos, log = validate.walk_forward(df, trend_breakout, grid, folds=3, min_trades=1)
        self.assertEqual(len(log), 2)
        self.assertGreaterEqual(oos.trades.entry_time.min(), log.test_from.iloc[0])

    def test_grids_are_valid(self):
        df = data.random_walk(n=500)
        for k, v in PARAM_GRIDS["trend_breakout"].items():
            trend_breakout(df, **{k: v[0]})


class RiskMath(unittest.TestCase):
    def test_breakeven(self):
        self.assertAlmostEqual(riskmath.breakeven_winrate(2.0), 1 / 3)
        self.assertAlmostEqual(riskmath.expectancy(1 / 3, 2.0, 1.0), 0.0)

    def test_green_day_needs_absurd_sharpe(self):
        self.assertLess(riskmath.prob_green_day(3.0), 0.6)
        self.assertGreater(riskmath.sharpe_for_green_days(0.99), 30)

    def test_kelly(self):
        self.assertAlmostEqual(riskmath.kelly_fraction(0.5, 1.0), 0.0)
        self.assertAlmostEqual(riskmath.kelly_fraction(0.6, 1.0), 0.2)


if __name__ == "__main__":
    unittest.main()
