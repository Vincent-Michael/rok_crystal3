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
