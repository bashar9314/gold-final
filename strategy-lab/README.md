# Strategy Lab

A small, dependency-light toolkit (numpy + pandas) that tests trading strategies **honestly**. It fills every signal at the next bar's open, charges the real spread, assumes the stop fills first when a bar touches both stop and target, picks parameters by walk-forward on data the test period never saw, runs Monte Carlo on the trade sequence, and ends with a pass/fail verdict.

Read **[STRATEGY.md](STRATEGY.md)** first. The full two-engine system, TradingView scripts and the market list are in **[../tradingview/](../tradingview/README.md)**. It covers what the strategy is, what it can and can't do, and the steps to follow before risking money.

## Install

```bash
cd strategy-lab
pip install -r requirements.txt
```

## Use

```bash
python run.py math        # why "profit every day" and "90% win rate" are traps (numbers, not opinions)
python run.py demo        # all strategies on random data: the 89% win-rate trap still loses
python run.py validate --csv XAUUSD_H1.csv                 # full walk-forward + verdict
python run.py portfolio --csv XAUUSD_H1.csv US500_H1.csv EURUSD_H1.csv USDJPY_H1.csv
python run.py backtest --csv XAUUSD_H1.csv --param entry_n=55 stop_atr=2 --trades-out trades.csv
```

Options: `--risk 0.005` (fraction of equity per trade), `--spread 0.30` (fixed spread if the CSV has none), `--point 0.01` (MT5 point size for the `<SPREAD>` column; use 0.00001 for 5-digit FX), `--folds 6`.

**Getting data:** in MetaTrader 5, open View → Symbols → Bars, choose the symbol and timeframe, click Request, then Export Bars. Plain `date,open,high,low,close[,spread]` CSVs also work.

## Layout

| File | What it does |
|---|---|
| `lab/data.py` | CSV loader (MT5 or generic) and a no-edge random-walk generator |
| `lab/indicators.py` | ATR, EMA, Donchian, RSI, with no look-ahead |
| `lab/strategies.py` | `trend_breakout` (Engine A), `pullback_reversion` (Engine B), `high_winrate_trap` (the counter-example) |
| `lab/backtest.py` | conservative bar-by-bar engine with risk-% sizing |
| `lab/metrics.py` | expectancy, profit factor, drawdown, Sharpe, % green days/months |
| `lab/validate.py` | parameter sweep, plateau scoring, walk-forward, Monte Carlo |
| `lab/riskmath.py` | expectancy, break-even win rate, Kelly, P(green day), losing streaks, martingale ruin |
| `tests/` | `python -m unittest discover -s tests -t .` |

## Adding a strategy

Write a function `f(df, **params) -> DataFrame[entry, stop_dist, target_dist, trail_dist]` that uses only closed-bar data. Register it in `STRATEGIES` and give it a small grid in `PARAM_GRIDS`. Then run `validate`. The unit test `test_no_lookahead` is the pattern to copy for checking it doesn't peek at future bars.

## What this is not

It is not a promise of profit, not a signal service, and not connected to a broker. No results in this repo come from real market data, because this environment had no data access. **Run it on your own exports**, and trust only the verdict it prints.
