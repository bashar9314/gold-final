"""Load OHLC data from CSV (MetaTrader 5 exports or generic), or generate
synthetic random-walk data for demos and tests.

Synthetic data has NO edge by construction. It is used to show what a
strategy looks like when there is nothing to find -- never to claim profits.
"""
import numpy as np
import pandas as pd

_ALIASES = {
    "<date>": "date", "<time>": "time", "<open>": "open", "<high>": "high",
    "<low>": "low", "<close>": "close", "<tickvol>": "volume", "<vol>": "real_volume",
    "<spread>": "spread_points", "datetime": "datetime", "timestamp": "datetime",
    "tick_volume": "volume", "spread": "spread_points",
}


def load_csv(path, point=0.01):
    """Load an OHLC CSV. Handles MT5 'Export bars' files (tab separated,
    <DATE> <TIME> <OPEN> ... <SPREAD>), TradingView 'Export chart data' files
    (time as unix seconds or ISO) and plain date,open,high,low,close files.

    `point` converts MT5's integer spread column into price units
    (XAUUSD on most brokers: 0.01; EURUSD: 0.00001).
    """
    df = pd.read_csv(path, sep=None, engine="python")
    df.columns = [_ALIASES.get(c.strip().lower(), c.strip().lower()) for c in df.columns]
    if "date" in df.columns and "time" in df.columns:
        idx = pd.to_datetime(df["date"].astype(str) + " " + df["time"].astype(str))
    elif "datetime" in df.columns:
        idx = pd.to_datetime(df["datetime"])
    elif "date" in df.columns:
        idx = pd.to_datetime(df["date"])
    elif "time" in df.columns:                     # TradingView "Export chart data"
        t = df["time"]
        idx = (pd.to_datetime(t, unit="s", utc=True).dt.tz_localize(None)
               if pd.api.types.is_numeric_dtype(t)
               else pd.to_datetime(t, utc=True).dt.tz_localize(None))
    else:
        raise ValueError("CSV needs a date/datetime column")
    out = df[["open", "high", "low", "close"]].astype(float)
    out.index = idx
    if "spread_points" in df.columns:
        out["spread"] = df["spread_points"].astype(float).values * point
    out = out[~out.index.duplicated()].sort_index()
    return out


def random_walk(n=20000, start=2000.0, vol=0.0015, freq="h", seed=0, spread=0.25):
    """Driftless random walk OHLC bars. There is no pattern to exploit here."""
    rng = np.random.default_rng(seed)
    rets = rng.normal(0.0, vol, n)
    close = start * np.exp(np.cumsum(rets))
    open_ = np.concatenate([[start], close[:-1]])
    wiggle = np.abs(rng.normal(0.0, vol * 0.6, (2, n))) * close
    high = np.maximum(open_, close) + wiggle[0]
    low = np.minimum(open_, close) - wiggle[1]
    idx = pd.date_range("2020-01-01", periods=n, freq=freq)
    return pd.DataFrame({"open": open_, "high": high, "low": low,
                         "close": close, "spread": spread}, index=idx)
