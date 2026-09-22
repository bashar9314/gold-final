"""Bar-by-bar backtest engine.

Conservative by design:
  * decisions on bar i's close fill at bar i+1's open (no look-ahead)
  * the full spread is paid on every round trip (per-bar spread if the data
    has one, otherwise the fixed `spread` argument), plus optional commission
  * if the stop and the target are both touched inside one bar, the STOP is
    assumed to have filled first
  * a gap through the stop fills at the (worse) open price
  * position size = risk_pct of current equity / stop distance
  * optional signal exits (exit_long / exit_short columns) and a time stop
    (max_bars column) are also decided on a close and filled at the next open
"""
from dataclasses import dataclass, field

import numpy as np
import pandas as pd


@dataclass
class Result:
    trades: pd.DataFrame
    equity: pd.Series
    params: dict = field(default_factory=dict)


def run(df, sig, start_equity=10_000.0, risk_pct=0.01, spread=None,
        commission_per_unit=0.0, max_leverage=20.0, params=None):
    o, h, l, c = (df[k].to_numpy(float) for k in ("open", "high", "low", "close"))
    if "spread" in df.columns:
        spr = df["spread"].to_numpy(float)
    else:
        spr = np.full(len(df), spread or 0.0)
    ent = sig["entry"].to_numpy()
    sd = sig["stop_dist"].to_numpy(float)
    td = sig["target_dist"].to_numpy(float)
    trd = sig["trail_dist"].to_numpy(float)
    n = len(df)
    xl = sig["exit_long"].to_numpy(bool) if "exit_long" in sig else np.zeros(n, bool)
    xs = sig["exit_short"].to_numpy(bool) if "exit_short" in sig else np.zeros(n, bool)
    mb = sig["max_bars"].to_numpy(float) if "max_bars" in sig else np.full(n, np.nan)

    eq = start_equity
    curve = np.empty(len(df))
    trades = []
    pos = 0          # +1 / -1 / 0
    units = entry_px = stop = target = trail = best = 0.0
    risk_cash = 0.0
    t_in = None
    pending = 0      # entry decided on previous close
    exit_why = ""    # signal/time exit decided on previous close
    i_in = 0

    def close_trade(i, px, reason):
        nonlocal eq, pos
        px -= (spr[i] / 2) * pos                          # pay half spread out
        pnl = (px - entry_px) * pos * units - 2 * commission_per_unit * units
        eq += pnl
        trades.append((t_in, df.index[i], pos, entry_px, px, units,
                       pnl, pnl / risk_cash if risk_cash else 0.0, reason))
        pos = 0

    for i in range(len(df)):
        # 1) fill a pending signal/time exit, then a pending entry, at this bar's open
        if exit_why and pos:
            close_trade(i, o[i], exit_why)
        exit_why = ""
        if pending and pos == 0 and np.isfinite(sd[i - 1]) and sd[i - 1] > 0:
            d = sd[i - 1]
            pos = pending
            entry_px = o[i] + (spr[i] / 2) * pos          # pay half spread in
            risk_cash = eq * risk_pct
            units = min(risk_cash / d, eq * max_leverage / entry_px)
            stop = entry_px - pos * d
            target = entry_px + pos * td[i - 1] if np.isfinite(td[i - 1]) else np.nan
            trail = trd[i - 1]
            best = entry_px
            t_in = df.index[i]
            i_in = i
        pending = 0

        # 2) manage an open position inside this bar
        if pos:
            exit_px = None
            reason = ""
            if pos == 1:
                if o[i] <= stop:
                    exit_px, reason = o[i], "gap_stop"
                elif l[i] <= stop:
                    exit_px, reason = stop, "stop"
                elif np.isfinite(target) and h[i] >= target:
                    exit_px, reason = target, "target"
            else:
                if o[i] >= stop:
                    exit_px, reason = o[i], "gap_stop"
                elif h[i] >= stop:
                    exit_px, reason = stop, "stop"
                elif np.isfinite(target) and l[i] <= target:
                    exit_px, reason = target, "target"
            if exit_px is not None:
                close_trade(i, exit_px, reason)
            elif np.isfinite(trail):
                # ratchet the chandelier stop using this CLOSED bar; used from next bar
                best = max(best, h[i]) if pos == 1 else min(best, l[i])
                cand = best - pos * trd[i]
                if np.isfinite(cand):
                    stop = max(stop, cand) if pos == 1 else min(stop, cand)

        # 3) mark to market, then read the signal on this close
        curve[i] = eq + ((c[i] - entry_px) * pos * units if pos else 0.0)
        if pos and i + 1 < n:
            if (pos == 1 and xl[i]) or (pos == -1 and xs[i]):
                exit_why = "signal"
            elif np.isfinite(mb[i]) and i - i_in + 1 >= mb[i]:
                exit_why = "time"
        if pos == 0 and ent[i] != 0 and i + 1 < n:
            pending = int(ent[i])

    tr = pd.DataFrame(trades, columns=["entry_time", "exit_time", "side", "entry",
                                       "exit", "units", "pnl", "r", "reason"])
    return Result(tr, pd.Series(curve, index=df.index, name="equity"), params or {})
