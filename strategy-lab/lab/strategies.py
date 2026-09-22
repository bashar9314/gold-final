"""Strategies emit decisions on CLOSED bars; the engine fills them at the
NEXT bar's open. Each returns a DataFrame aligned to df with columns:

  entry       +1 long, -1 short, 0 nothing
  stop_dist   initial stop distance in price units
  target_dist take-profit distance (NaN = no fixed target)
  trail_dist  chandelier trailing distance (NaN = no trailing stop)
optional:
  exit_long / exit_short  close the position at the next open
  max_bars                time stop, in bars held
"""
import numpy as np
import pandas as pd

from .indicators import atr, donchian, efficiency_ratio, ema, rsi, sma


def trend_breakout(df, entry_n=55, trend_n=200, atr_n=20, stop_atr=2.0, trail_atr=3.0,
                   er_n=20, er_min=0.0):
    """Core strategy: volatility-sized trend following.

    Long when the close breaks the prior `entry_n`-bar high AND is above the
    `trend_n` EMA; short is the mirror image. Initial stop `stop_atr` x ATR,
    then a chandelier trail of `trail_atr` x ATR from the best price. No fixed
    target: winners are allowed to run, which is where the edge lives.
    Expect a win rate around 30-45% and positive skew.
    """
    a = atr(df, atr_n)
    up, dn = donchian(df, entry_n)
    trend = ema(df["close"], trend_n)
    ok = efficiency_ratio(df["close"], er_n) >= er_min if er_min > 0 else True
    long_ = (df["close"] > up) & (df["close"] > trend) & ok
    short = (df["close"] < dn) & (df["close"] < trend) & ok
    return pd.DataFrame({
        "entry": np.where(long_, 1, np.where(short, -1, 0)),
        "stop_dist": stop_atr * a,
        "target_dist": np.nan,
        "trail_dist": trail_atr * a,
    }, index=df.index)


def pullback_reversion(df, rsi_n=2, entry_lvl=10, trend_n=200, exit_n=5,
                       atr_n=14, stop_atr=3.0, max_bars=10, allow_short=False):
    """Engine B: buy short-term panic inside a long-term uptrend.

    Long when price is above its `trend_n` SMA and RSI(`rsi_n`) drops below
    `entry_lvl`. Exit when the close gets back above the `exit_n` SMA, after
    `max_bars` bars, or at a wide `stop_atr` x ATR disaster stop. This is a
    genuinely high win-rate style (often 60-75% on stock indices) BECAUSE its
    losers are allowed to be bigger than its winners -- the disaster stop and
    the time stop are what keep that from turning into the trap below.
    """
    c = df["close"]
    r = rsi(c, rsi_n)
    up = c > sma(c, trend_n)
    fast = sma(c, exit_n)
    long_ = up & (r < entry_lvl)
    short = (~up) & (r > 100 - entry_lvl) & allow_short
    return pd.DataFrame({
        "entry": np.where(long_, 1, np.where(short, -1, 0)),
        "stop_dist": stop_atr * atr(df, atr_n),
        "target_dist": np.nan,
        "trail_dist": np.nan,
        "exit_long": c > fast,
        "exit_short": c < fast,
        "max_bars": max_bars,
    }, index=df.index)


def high_winrate_trap(df, rsi_n=2, lo=10, hi=90, atr_n=14, tp_atr=0.5, sl_atr=4.0):
    """Counter-example. Buys oversold / sells overbought with a tiny target
    and a huge stop. It wins most trades -- and that tells you nothing about
    whether it makes money. Included so the lab can show the difference.
    """
    a = atr(df, atr_n)
    r = rsi(df["close"], rsi_n)
    return pd.DataFrame({
        "entry": np.where(r < lo, 1, np.where(r > hi, -1, 0)),
        "stop_dist": sl_atr * a,
        "target_dist": tp_atr * a,
        "trail_dist": np.nan,
    }, index=df.index)


STRATEGIES = {"trend_breakout": trend_breakout, "pullback_reversion": pullback_reversion,
              "high_winrate_trap": high_winrate_trap}

PARAM_GRIDS = {
    "trend_breakout": {"entry_n": [20, 40, 55, 80, 120],
                       "stop_atr": [1.5, 2.0, 3.0],
                       "trail_atr": [2.0, 3.0, 4.0, 5.0]},
    "pullback_reversion": {"entry_lvl": [5, 10, 15, 20],
                           "exit_n": [3, 5, 10],
                           "stop_atr": [2.0, 3.0, 4.0]},
    "high_winrate_trap": {"tp_atr": [0.3, 0.5, 0.8], "sl_atr": [2.0, 4.0, 6.0]},
}
