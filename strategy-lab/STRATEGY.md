# The Strategy Playbook

This is the plan, written plainly. It is built to survive, not to look good in a screenshot.

## 1. The truth you have to accept first

| What was asked for | What the math says |
|---|---|
| Profit **every single day** | A strategy with a Sharpe ratio of 3 (world-class; most hedge funds run 1–2) has only about **57% green days**. To get 99% green days you need a Sharpe around **37**. No public strategy has that. Run `python run.py math`. |
| **Very high win rate** | Win rate means nothing on its own. A 90% win rate that makes 0.1R and loses 1R **loses money**. Most "90% win rate" robots are martingale or grid systems, or they use a tiny target with a huge stop. They look perfect until one bad day wipes out the account. |
| **Consistency** | This one is achievable, but you get it over **months**, not days. It comes from positive expectancy, small risk per trade, and trading several unrelated markets at once. |

Anyone who sells you daily guaranteed profit is selling you the drawdown they haven't hit yet. Your friend's Gold Desk page says the same thing honestly: about a **32% win rate** and a **24.8% drawdown** in testing.

## 2. The edge we trade: trend following with volatility-based sizing

Why this one? Trend following has the longest public evidence record in trading. Examples include Hurst, Ooi & Pedersen, *A Century of Evidence on Trend-Following* (2017), and Moskowitz, Ooi & Pedersen, *Time Series Momentum* (2012). It has been tested across more than 100 years and dozens of markets. It works because people react late to news, and big moves keep going for a while. It is not a secret, and it has not been arbitraged away, because most people can't stand the losing streaks it brings.

**Rules** (`trend_breakout` in `lab/strategies.py`), all decided on a **closed** candle:

1. **Trend filter:** only go long above the 200-bar EMA, and only go short below it.
2. **Entry:** the close breaks the highest high (for longs) or the lowest low (for shorts) of the previous *N* bars (default 55). The order fills at the **next bar's open**.
3. **Initial stop:** 2 × ATR(20) from the entry.
4. **Exit:** a trailing stop set 3 × ATR below the best price reached (above it for shorts). **There is no fixed profit target.** The edge comes from the few trades that run 5R to 15R.
5. **Size:** risk **0.5–1% of equity** per trade. Units = (equity × risk%) ÷ stop distance.
6. **One position per market.** No averaging down, no martingale, and no widening the stop.

**What to expect:** a 30–45% win rate, long losing streaks (8 or more in a row is close to certain over 300 trades), flat or losing months, and a return that comes from a small number of big winners.

## 3. How to get consistency

1. **Diversify across markets.** Trade the same rules on 5 to 10 markets that don't move together, for example gold, a stock index, EURUSD, USDJPY, crude oil, and bitcoin. Each market's losing stretches happen at different times, so the combined equity curve is smoother than any single one. Use `python run.py portfolio --csv ...`.
2. **Keep risk small.** Risk 1% per trade on each of 6 markets, and cap total open risk at about 6%. Full Kelly is about 10% for a 40%/2:1 edge. Nobody should use that, because the win rate and payoff are only estimates.
3. **Set drawdown circuit breakers.** If the account is down 15% from its peak, cut risk in half. If it is down 25%, stop and re-validate.

## 4. Rules for proving it before real money goes in

A strategy only moves to the next step after it passes the current one:

1. **Get the data:** export 5 or more years of H1 or H4 bars per symbol from MT5 (View → Symbols → Bars → Export). Include the broker's spread column.
2. **Validate:** run `python run.py validate --csv FILE.csv`. All six checks must pass:
   - at least 100 out-of-sample trades
   - out-of-sample expectancy t-stat > 2 (unlikely to be luck)
   - out-of-sample profit factor > 1.2
   - 60% or more of parameter combinations profitable (a plateau, not a lucky spike)
   - still profitable when the spread is doubled
   - 95th-percentile Monte Carlo drawdown better than −30%
3. **Demo forward test:** trade it on a demo account for at least 3 months or 50 trades. Live results should fall inside the Monte Carlo range.
4. **Small live account:** start at 0.25–0.5% risk for another 3 months. Your broker's real fills are the final test.
5. **Scale up slowly.** Only increase risk after live results match the backtest.

If a market fails step 2, **don't trade it**, and don't keep adjusting parameters until it passes. That is curve fitting. The lab prints the verdict so you don't have to trust your own hopes.

## 5. Never

- Martingale, grids, or "recovery" lot multipliers
- Moving a stop further away
- Risking more than 2% on a single trade
- Trading money you can't afford to lose
- Buying a robot that shows no drawdown, claims 90%+ win rates, or only shows backtests with no out-of-sample test

*This is educational software and a research method, not financial advice. Trading leveraged products can lose more than you deposit. Past and simulated performance does not predict future results.*
