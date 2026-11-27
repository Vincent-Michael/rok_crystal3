# RoK Crystal Technology 3.0

Interactive research tree and crystal cost planner for Patch 1.1.14, Schema 300.

## GitHub Pages

Open Settings → Pages → Build and deployment → Source → GitHub Actions, then run the Deploy Crystal Technology workflow.

Open the deployed site and click **Save HTML** to obtain a self-contained offline copy with embedded artwork. The repository source HTML can also use the three PNG files under assets/icons/.

v0.6: all 45 research cards now have game image references, including the three uploaded original PNGs. Actual build coverage is recorded in asset-status.json.

Unofficial datamine. Raw base costs exclude buildings, discounts and recurring utility costs. Research layout is reconstructed; provisional labels and icon substitutes are identified.

## v0.7 Section crystal requirements

Five non-overlapping sections split at the four Awakening positions. Displays full base cost, full cumulative base, selected remaining base, discounted remaining and discounted cumulative cost; per-column amounts are displayed beneath the tree. Section costs are full-section totals, not minimum unlock paths. No research data changes.

## v0.8 Research simulator

Starts with an empty research plan. Add one level, Max Path, Remove one, Remove All, Inspect, Clear Plan and Undo. The automatic path uses all configured prerequisite pairs, conservatively including relation 1. Max paths respect the target Research Center cap. Removing a prerequisite trims dependent planned targets but never completed levels. No Prereqs allows independent hypothetical targets. Cutting Corners priorities order selected paths; optional detours can be added explicitly. Research order, raw speedups, Season Coins and crystal totals update immediately. Building costs are manual; optional sequential discounts are an unverified additive model. UI interaction inspired by https://infocat-rok.com/tech-simulator.

## v0.9 Manual research controls

Every non-awakening research card, table row and detail panel includes minus/plus controls. Plus validates prerequisites and target Research Center without automatically adding other research; minus refuses to break another selected upgrade. Errors identify the missing technology, required level and current planned level. Max Path remains an explicit automatic path option. No Prereqs is an optional technology requirement bypass. Awakenings remain automatic. All source data and icons are unchanged.

## v1.0 Technology descriptions

All 45 technologies have English descriptions from the extracted Research localization/catalog, effect names, current/target/max configured buff values, and original description keys. Type 1034 (Emergency Support) is a provisional localization mapping. Dual-effect labels with unresolved mappings are identified; raw utility unlock values are not interpreted as Gem prices. Hover a technology or click Inspect to see the description.

## v1.1 Compact interface

Blue/gold cards with horizontal − / level / + controls and a green information button. Descriptions and per-level costs appear in a closable dialog. Settings, detailed totals, research sequence and Awakening summary are collapsed by default. Existing Schema 300 data, prerequisites, exports and original artwork are preserved. The layout is inspired by the supplied InfoCat screenshot, not a pixel-identical reproduction.

## v1.4 Building costs and construction time

Uses all 50 rows for Types 43 and 44 from building_Building.csv, schema 122. The selected Research Center target level and existing center level determine remaining costs. Crystal Mine includes all levels through 25. Both toggles add verified raw building crystal costs and construction duration to the live totals. The data source is separate from tech schema 300; the schema association is not confirmed. No editable building-cost inputs or building discounts. The research speed bonus does not reduce construction time.

## v1.4.7 Research Center discount

Automatic target-center discount applied to research only, independently of building cost inclusion. Community-reported endpoints: 0.1% at level 1 and 5% at level 25 (https://rokhub.app/tools/kvk/crystal-tech and https://rokbuilder.com/tools/kvk/crystal-tech/). Intermediate levels are explicitly interpolated estimates pending game-data confirmation. Target center is assumed completed before research starts. Cutting Corners bonuses are applied sequentially and additively. Additional discount is separate. Buildings are not discounted.

## v1.4.8 Verified Research Center discounts

Replaces the v1.4.7 interpolated estimates with all 25 rates transcribed from the supplied in-game Crystal Research Cost Reduction screenshots. The rates are also displayed in the building breakdown. The target-center-first and additive-stacking assumptions remain unchanged.

## v1.4.9 Building speedups

The supplied November 2026 KingsCodex Crystal Buildings graphic matches the existing schema 122 level 2–25 costs and times at displayed minute precision. CSV exact seconds retained. Building speed bonus defaults to +98% and is independently adjustable in Settings. Main building KPI shows adjusted time with base time also visible. Research speed and crystal costs are unaffected.
