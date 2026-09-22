# The Two-Engine System

A trading system for someone working from home on TradingView, built as a master's research project.

> Research and education only. Not financial advice. Leveraged trading can lose more than you deposit.

---

## 1. The idea in one paragraph

Retail traders don't lose because they pick the wrong indicator. They lose because they trade **one** market with **one** idea, risk too much, and quit during the first losing streak. This system attacks all three problems. It runs **two engines that make money in opposite market conditions**: Engine A profits when markets **trend**, and Engine B profits when stock indices **overreact and snap back**. It spreads them across markets that don't move together, and it sizes every trade by **volatility** so each position carries the same risk. When one engine is struggling, the other is usually working. That combination is where consistency comes from. A higher win rate does not give you that.

## 2. Where the money actually comes from

A strategy only makes money if someone on the other side is making a predictable mistake, or is paying you to take a risk they don't want. Both engines are built on behaviour that has been documented for decades:

| Engine | Who is on the other side | Why it keeps working | Evidence to cite |
|---|---|---|---|
| **A: Trend** | Traders and institutions who react slowly to new information, then pile in late (herding) | Big moves unfold over weeks. Most people can't sit through the 60% of trades that lose small, so the edge doesn't get arbitraged away | Moskowitz, Ooi & Pedersen (2012) *Time Series Momentum*; Hurst, Ooi & Pedersen (2017) *A Century of Evidence on Trend-Following* |
| **B: Pullback** | Panic sellers during short, sharp drops in a rising market; forced liquidations | Stock indices drift upward over the long run, and short-term overreactions tend to partly reverse | Short-term reversal literature, e.g. Lehmann (1990), Jegadeesh (1990); Connors & Alvarez (2008) on RSI(2) |
| **Sizing** | n/a (this is a risk tool, not an edge) | Sizing by volatility keeps one wild market from dominating the account and has been shown to improve risk-adjusted returns | Harvey et al. (2018) *The Impact of Volatility Targeting* |

The two engines behave very differently: A wins rarely but big, and B wins often but small. They also make their money at different times. Combining them is the creative part, and it is exactly what professional multi-strategy funds do.

## 3. What we trade

| Group | Symbol on TradingView (varies by broker feed) | Engine | Timeframe | Why it's here |
|---|---|---|---|---|
| Metals | **XAUUSD** (gold) | A | 4H | Strong, long trends; very liquid |
| FX | **USDJPY** | A | 4H | Driven by interest-rate differentials, which trend for long periods |
| FX | **EURUSD** | A | 4H | Tightest spread in the world |
| FX | **AUDUSD** | A | 4H | Commodity and risk-appetite driven; moves differently from EURUSD |
| Energy | **USOIL** (WTI) | A | 4H | Supply shocks create long trends; low correlation with FX |
| Crypto | **BTCUSD** | A | 4H or 1D | The strongest trends of any liquid market; trades 24/7 |
| Index | **SPX500 / US500** | B | 1D | Long-term upward drift; frequent overreactions |
| Index | **NAS100** | B | 1D | Same behaviour, more volatile |
| Index | **GER40** (DAX) | B | 1D | Different time zone and economy, which adds diversification |

**Starting set (fewer screens, still diversified):** XAUUSD, USDJPY, and BTCUSD on Engine A, plus US500 and NAS100 on Engine B.

**Pairs we avoid on purpose:** EURUSD together with GBPUSD (almost the same trade twice); exotic pairs such as USDTRY or USDZAR (the spreads eat the edge); minor crosses with wide spreads.

### Why not 1–15 minute charts?

Every trade pays the spread. What matters is **the spread as a fraction of a normal candle's move (ATR)**:

```
cost share = spread / ATR(timeframe)
```

On gold, a spread of a few tenths of a dollar can be 10–25% of a 5-minute candle's range, but only 1–3% of a 4-hour candle's range. So on low timeframes the broker takes a large share of every edge before you see any profit. That is why most scalpers lose. To check this on your own chart, add the ATR indicator on 5m and on 4H and divide your broker's spread by each. Higher timeframes are also the only option that fits a home schedule: you don't need to watch the screen.

## 4. Engine A: Trend Breakout (`engine_a_trend.pine`)

All decisions are made on a **closed** 4H candle.

1. **Direction filter.** Price above the 200 EMA means longs only. Below it means shorts only.
2. **Entry.** The candle closes above the highest high of the previous 55 candles for a long, or below the lowest low for a short. The trade enters at the next candle's open.
3. **Initial stop.** 2 × ATR(20) away from the entry.
4. **Position size.** Size the trade so that hitting the stop loses exactly 1% of the account:
   `size = (equity × 1%) ÷ (stop distance × point value)`
5. **Trailing exit.** The stop follows the best price reached, 3 × ATR behind it, and only ever moves in your favour. There is **no take-profit.** The edge comes from the few trades that run 5–15× their risk.
6. **Optional chop filter.** The efficiency ratio (net move ÷ total path length over 20 bars) is near 1 in clean trends and near 0 in noise. Setting the minimum to 0.25–0.3 skips choppy markets. Treat that as an experiment for the thesis: does it help out of sample?

**What to expect:** a 30–45% win rate, frequent small losses, streaks of 8 or more losses, and a few large winners that pay for everything.

## 5. Engine B: Pullback Reversion (`engine_b_pullback.pine`)

All decisions are made on a **closed daily** candle.

1. **Uptrend filter.** The close is above its 200-day SMA. The engine only buys dips in markets that are rising.
2. **Entry.** RSI(2) closes below 10, which means two days of sharp, panicky selling. The trade enters at the next open.
3. **Exit on snap-back.** Close the trade as soon as a daily close gets back above the 5-day SMA.
4. **Time stop.** Exit after 10 days no matter what. A dip that doesn't recover is not the trade we signed up for.
5. **Disaster stop.** 3 × ATR(14), sized so that hitting it costs 1% of the account.

**What to expect:** often a 60–75% win rate on indices historically, with small, quick winners and holds of 2–5 days. Its weakness is a crash that keeps going. The disaster stop and the time stop are what separate it from the "90% win-rate robot" that blows up.

## 6. Portfolio rules (the part that keeps you in the game)

| Rule | Setting |
|---|---|
| Risk per trade | 1% of equity (0.5% while you're learning) |
| Max open risk, all positions combined | 6% |
| Correlated trades | Max 2 open trades on the same USD side at once (e.g. long USDJPY and short EURUSD are both "long USD") |
| Drawdown at 15% from peak | Halve the risk per trade |
| Drawdown at 25% from peak | Stop and re-validate (the scripts halt automatically at this level) |
| Changing rules | Never mid-trade, and never after a single losing streak. Only after a new walk-forward test |

## 7. Daily routine from home (about 15 minutes)

1. **Set alerts once.** Add each script to its chart, then open Create Alert → Condition: the strategy → "Order fills". You'll get a phone notification whenever a trade fires.
2. **4H candle closes** (every 4 hours; you don't need every one): when an alert fires, place the order in your broker with the size and stop the script shows.
3. **Daily close (Engine B):** check the index charts once a day, after the US close.
4. **Once a week:** update each open trade's stop to the plotted orange trailing line, and log every trade in a spreadsheet (date, market, engine, R result).
5. **Once a month:** compare your live results with the backtest. Are they inside the Monte Carlo range from the lab?

If you later want no manual work at all, TradingView alerts can be sent by webhook to a broker bridge. That's the same design as the Gold Desk, and it could be a chapter of the thesis.

## 8. How to test it on TradingView

1. Pine Editor → paste a script → **Add to chart**, then open the **Strategy Tester** tab.
2. **Properties tab:** set initial capital. Set commission to your broker's cost. Set slippage to roughly **half the typical spread in ticks**; TradingView doesn't charge spread by itself, so this is essential.
3. Use as much history as your plan allows (Deep Backtesting helps).
4. Record the net profit, profit factor, max drawdown, win rate, number of trades, and average trade.
5. **The honest test:** pick settings using only the first half of the history. Freeze them, then check the second half. Or export the chart data (chart menu → Export chart data) and run the Python lab's walk-forward, which does this automatically:
   ```bash
   cd strategy-lab
   python run.py validate  --csv XAUUSD_240.csv --strategy trend_breakout
   python run.py validate  --csv US500_1D.csv  --strategy pullback_reversion
   python run.py portfolio --csv XAUUSD_240.csv USDJPY_240.csv BTCUSD_240.csv
   ```
   TradingView exports contain no spread, so add `--spread` with your broker's typical spread in price units (for example `--spread 0.30` for gold, `--spread 0.00008` for EURUSD).
   Only markets that pass all six checks stay in the portfolio.

## 9. Realistic expectations

You wanted a system that makes a lot of money. Here is what "good" looks like once it survives testing:

- **Returns:** long-running trend-following funds have historically made roughly 5–15% a year with Sharpe ratios of about 0.5–1. A well-built two-engine portfolio at 1% risk could plausibly target around **10–30% a year**, with drawdowns of **15–25%**. It can also lose. Nothing here guarantees a positive year.
- **Green days:** expect roughly 50–55% of days to be profitable, and about 55–65% of months. Consistency shows up at the level of years.
- **How money grows here:** a small, real, repeatable edge, compounded with discipline, plus adding capital over time. It doesn't come from a secret setup.

## 10. Turning this into a thesis

**Title idea:** *Combining Time-Series Momentum and Short-Term Reversal: A Walk-Forward Evaluation of a Volatility-Scaled Two-Engine Trading System for Retail Traders.*

- **Research question:** can a retail trader, after realistic costs, get better risk-adjusted returns from two uncorrelated rule-based engines than from either engine alone?
- **Hypotheses:**
  - H1: each engine has positive out-of-sample expectancy after costs.
  - H2: the engines' daily returns have low or negative correlation.
  - H3: the combined portfolio has a higher Sharpe ratio and a smaller max drawdown than either engine alone.
  - H4: the efficiency-ratio filter improves Engine A out of sample.
- **Method:** MT5 or TradingView data, 5+ years for each market. Conservative execution (next-open fills, spread, stop-first). Anchored walk-forward with plateau-based parameter selection. Monte Carlo resampling. Double-spread stress test. Test significance with the t-stat of expectancy, and use the deflated Sharpe ratio (Bailey & López de Prado, 2014) for multiple-testing bias.
- **Chapters:**
  1. Introduction
  2. Literature review (momentum, reversal, volatility targeting, backtest overfitting)
  3. Data and costs
  4. Methodology (the `strategy-lab` engine, with tests as evidence of no look-ahead)
  5. Results by engine, market, and portfolio
  6. Robustness (parameter plateaus, cost stress, Monte Carlo)
  7. Paper or demo forward test
  8. Limitations (survivorship, regime change, broker execution)
  9. Conclusion
- **Why examiners will like it:** it has falsifiable hypotheses and out-of-sample testing, and it reports honestly even if the answer is "no edge after costs". That result is still a valid finding.
