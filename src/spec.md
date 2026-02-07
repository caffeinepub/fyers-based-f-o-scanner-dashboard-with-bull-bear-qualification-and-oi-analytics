# Specification

## Summary
**Goal:** Add an “Index Performance” snapshot to the Dashboard showing % change for a fixed list of indices, sorted by best performance.

**Planned changes:**
- Add a new Dashboard section titled “Index Performance” displayed above or alongside existing Bull/Bear scan results.
- Render a row per requested index (Nifty50, Bank Nifty, Nifty Mid Select, Sensex, Finnifty, Nifty Pvt Bank, Nifty PSU Bank, Nifty IT, Nifty Pharma, Nifty FMCG, Nifty Auto, Nifty Metal, Nifty Energy, Nifty Realty) with index name and current % change.
- Sort the displayed rows by % change in descending order, with a safe “unavailable” display for missing values.
- Add a backend query method that returns a single payload containing index name + numeric % change for the requested indices, returning entries even when data is missing, and protected with the same authorization pattern as existing user-only queries.

**User-visible outcome:** On the Dashboard, users can see an “Index Performance” list of the specified indices with their current % change, ordered from highest to lowest, without affecting existing Bull/Bear scan results.
