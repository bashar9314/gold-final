"""Strategies emit decisions on CLOSED bars; the engine fills them at the
NEXT bar's open. Each returns a DataFrame aligned to df with columns:

  entry       +1 long, -1 short, 0 nothing
  stop_dist   initial stop distance in price units
  target_dist take-profit distance (NaN = no fixed target)
  trail_dist  chandelier trailing distance (NaN = no trailing stop)
"""
import numpy as np
import pandas as pd

from .indicators import atr, donchian, ema, rsi


def trend_breakout(df, entry_n=55, trend_n=200, atr_n=20, stop_atr=2.0, trail_atr=3.0):
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
    long_ = (df["close"] > up) & (df["close"] > trend)
    short = (df["close"] < dn) & (df["close"] < trend)
    return pd.DataFrame({
        "entry": np.where(long_, 1, np.where(short, -1, 0)),
        "stop_dist": stop_atr * a,
        "target_dist": np.nan,
        "trail_dist": trail_atr * a,
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


STRATEGIES = {"trend_breakout": trend_breakout, "high_winrate_trap": high_winrate_trap}

PARAM_GRIDS = {
    "trend_breakout": {"entry_n": [20, 40, 55, 80, 120],
                       "stop_atr": [1.5, 2.0, 3.0],
                       "trail_atr": [2.0, 3.0, 4.0, 5.0]},
    "high_winrate_trap": {"tp_atr": [0.3, 0.5, 0.8], "sl_atr": [2.0, 4.0, 6.0]},
}
