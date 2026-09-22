"""Indicators. Every value at bar i uses only bars <= i (no look-ahead)."""
import numpy as np
import pandas as pd


def atr(df, n=14):
    prev = df["close"].shift(1)
    tr = pd.concat([df["high"] - df["low"],
                    (df["high"] - prev).abs(),
                    (df["low"] - prev).abs()], axis=1).max(axis=1)
    return tr.ewm(alpha=1.0 / n, adjust=False, min_periods=n).mean()


def ema(s, n):
    return s.ewm(span=n, adjust=False, min_periods=n).mean()


def donchian(df, n):
    """Channel of the PREVIOUS n bars (excludes the current bar), so a close
    above the upper band is a genuine breakout."""
    return (df["high"].rolling(n).max().shift(1),
            df["low"].rolling(n).min().shift(1))


def rsi(s, n=2):
    d = s.diff()
    up = d.clip(lower=0).ewm(alpha=1.0 / n, adjust=False, min_periods=n).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=1.0 / n, adjust=False, min_periods=n).mean()
    return 100 - 100 / (1 + up / dn.replace(0, np.nan))
