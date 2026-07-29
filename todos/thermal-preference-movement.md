# Thermal-preference movement / thermotaxis (simple-evolution-simulator)

**Status:** done. A new evolvable `thermotaxis` gene (`engine/genes.ts`)
competes with `foraging` for solo movement's single per-tick direction roll
(`moveOrganism` in `engine/simulation.ts`) via one shared roll that
partitions `[0, 1)` by trait value — no independent-rolls "last one wins"
race, and whatever's left over after both traits' shares is still plain
random movement, unchanged from before. Thermal-seeking is pure look-ahead:
`bestThermalNeighbor` scores free neighbor cells by `|localTemperature -
thermalTolerance|` and only returns one that's a *strict improvement* over
the current cell — no new per-organism position-history state, and if no
neighbor beats staying, the organism simply doesn't move that tick (mirrors
"move back to where it was" without ever needing to detect or undo a bad
move after the fact). `moveColony` got the equivalent aggregate treatment:
average `thermotaxis` across members competes with average `foraging` the
same way, scored by each valid translated offset's total mismatch across
every member's own `thermalTolerance` (never relocating the whole footprint
into a worse combined fit either). See `simulation.spec.ts`'s "thermotaxis
(thermal-seeking movement)" describe block for solo, stay-put, and
colony-level coverage.

## What it is

Bias movement toward cells whose local temperature is closer to an
organism's `thermalTolerance`, the same way the `foraging` trait already
biases movement toward food-rich cells (`bestFoodNeighbor` in
`engine/simulation.ts`). The specific framing this was raised with: if an
organism moves somewhere hotter/colder and worse-suited than where it was,
it may want to move back.

## Why it's worth doing

`thermalMismatch` (`engine/simulation.ts`'s `feedAndAge`, ~L357-358) already
imposes a real per-tick energy cost proportional to `|local temperature -
thermalTolerance|`, and the per-cell spatial temperature field it reads from
(`engine/biome.ts`, `cellTemperature`) already exists and already varies
meaningfully by region. But nothing about movement ever looks at that field
— `bestFoodNeighbor`/`freeNeighbor` (the only two direction strategies
`moveOrganism` has) only ever consider food and open cells. So
`thermalTolerance` today is purely a passive "how much do I get penalized
for sitting here" trait; an organism has no way to act on a bad fit besides
evolving a different tolerance value over generations. That undersells
exactly the payoff biomes were built for — `todos/planetary-biomes.md`'s
own "why it's worth doing" section motivated spatial temperature variation
by "local adaptation, migration, and divergence into distinct regional
variants," and migration specifically requires organisms that can actually
move toward a better-suited region, not just tolerate or die in a
uniformly-random one. (Aside: `planetary-biomes.md` still describes this
biome field as deferred/not-yet-built, but it's already implemented in
`engine/biome.ts` — that file's status looks stale and probably wants a
separate look.)

## What it requires

- **How thermal bias competes with foraging for the movement decision**:
  `moveOrganism` currently makes one probabilistic choice per tick (forage
  vs. random) via `useForaging`. Thermal-seeking needs to fit into that same
  slot somehow — as a third competing strategy (its own roll, its own
  evolvable weight), or folded into a combined score (e.g. best neighbor by
  food *and* thermal fit together) reusing the existing `bestFoodNeighbor`
  shape. Doing both independently and letting whichever fires last win would
  make the loser meaningless, so this needs an actual decision rule, not
  just an added function.
- **Pure look-ahead, not literal backtracking**: the framing this was
  raised with ("move back to where it was") implies remembering a previous
  position and reactively undoing a bad move, but organisms don't retain
  any position history today (only current `x`/`y`), and adding that state
  isn't needed to get the described outcome. Instead, score candidate
  neighbor cells by thermal fit *before* moving and simply never move into
  a worse one — mirrors how `bestFoodNeighbor` already looks ahead one step
  for food, needs no new per-organism state, and prevents "shouldn't have
  moved there" situations from happening in the first place rather than
  needing to detect and undo them after the fact. A reactive
  remember-and-return-if-worse version was considered and rejected as
  unnecessary complexity for the same result.
- **Should this be gated by an evolvable trait/gene, or unconditional?**
  If every organism gets thermal-seeking for free just because
  `thermalTolerance` exists, that's "free" adaptive behavior no genome had
  to evolve — cuts against this project's stated "nothing hardcoded,
  everything emergent" ethos (`engine/biome.ts`'s own design note leans on
  this same principle). Probably wants its own gated trait (a
  "thermotaxis"-style gene, static or regulatory) rather than being baked
  into all movement unconditionally.
- **Colonies**: `moveColony` (see `todos/multicellular-motility.md`)
  already aggregates `motility`/`foraging` across members into one
  group-level decision and picks among *valid* translated offsets
  (`colonyMoveIsValid`). A thermal-fit version would need an equivalent
  averaged signal scored across the whole translated footprint, not a
  single cell — and colonies already have fewer valid directions available
  than a solo organism (more collision constraints), so it may be
  meaningfully harder for a bonded colony to escape a bad-fit region than
  for an individual, which is worth surfacing rather than assuming parity.

## Relation to other in-flight work

Builds directly on the spatial temperature field in `engine/biome.ts`
(nominally still "deferred" per `todos/planetary-biomes.md`, but already
built). Also extends `todos/multicellular-motility.md`'s `moveColony` if
colony-level thermal-seeking is wanted, and reuses the same
one-step-lookahead shape `bestFoodNeighbor` already established for solo
movement.
