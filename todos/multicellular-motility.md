# Multicellular motility (simple-evolution-simulator)

**Status:** done. Colonies of 2+ now move as a rigid group (`moveColony` in
`engine/simulation.ts`), gated by average member motility and steered by
average member foraging — the "simple" option described below, not the
richer per-member "mover cell" model. `moveOrganism` now only handles solo
organisms. See "What was built" below for what's simplified vs. the richer
alternative, and the note on re-tuning `STRUCTURAL_REINFORCEMENT_COST_REDUCTION`
against the new movement model (its current value was tuned against the old
sessile behavior and hasn't been re-validated since).

## What it is

Real multicellularity is not predominantly sessile. Sponges are the classic
sessile example, but they're the exception, not the rule: Volvox colonies
swim via coordinated flagella (every cell contributes propulsion in
alignment), siphonophores (e.g. the Portuguese man o' war) are colonial
organisms that actively propel themselves through genuine division of
labor among physiologically distinct colony members, and cellular slime
mold slugs migrate as a coordinated unit toward light/heat before
fruiting. The overwhelming majority of complex multicellular life
(essentially all animals) is motile. Sessility is a specific trait some
lineages evolve, not a structural consequence of being multicellular.

## Why the current model needs revisiting

`moveOrganism` currently treats "colony size >= 2" as sufficient reason to
never move, regardless of what traits that colony's members have actually
evolved (motility, foraging). That's backwards: motility should stay an
evolvable trait exactly like everything else in this game, and a colony's
ability to move should be a function of its members' traits and
coordination, not a hard structural cutoff. This also actively worked
against the fitness-payoff tuning in the colony-bonding pass — bonded
organisms losing foraging/movement entirely was a major reason small
colonies struggled to survive as long as hoped.

## What was built

`moveColony` (engine/simulation.ts) moves every member of a colony by one
shared (dx, dy) offset per tick, chosen once for the whole group:

- **Whether it moves**: a single roll against the *average* motility across
  all current members gates the whole group — not per-member, not a
  max/min, the simplest of the options this todo listed.
- **Which direction**: every one of the 8 Moore offsets is checked for
  validity first (every member's translated target cell must be empty or
  occupied by a fellow member of the same colony, who's also moving —
  chain-slides are allowed since a uniform translation of distinct points
  can never self-collide; only outsiders can block a direction). Among the
  valid offsets, a single roll against average foraging picks between the
  offset with the most total food under the translated footprint (foraging
  bias, mirroring solo `bestFoodNeighbor`) or a uniform-random valid offset.
  If every direction is blocked, the colony stays put that tick.
- Applied as one atomic two-phase move (clear every member's old cell, then
  place all of them at their targets) so ordering never matters.

**What's deliberately not built** (the richer alternative this todo also
described): no per-member "mover cell" division of labor — every member's
motility/foraging counts equally toward the group average, regardless of
its own regulatory/differentiation state. Structural Reinforcement and
Growth Suppression already give colonies a surface/interior division of
labor for upkeep and reproduction; movement doesn't yet have an equivalent
"who's actually doing the propelling" concept. Worth revisiting only if the
plain average proves unsatisfying in practice (e.g. one highly-motile member
dragging an otherwise-immotile colony around every tick looks wrong).

**Known follow-up**: `STRUCTURAL_REINFORCEMENT_COST_REDUCTION` and
Structural Reinforcement's density-scaling curve (engine/genes.ts) were both
tuned empirically against the *old* always-sessile, foraging-locked colony
model. Now that colonies can forage collectively instead of being capped at
their own single cell's regen, small-colony survival dynamics are worth
re-measuring — the existing tuning may turn out to already work fine, or
may now be over/under-generous.

## Relation to other in-flight work

Landed after `adhesion-compatibility-tuning.md`'s empirical sweep, which
found colony size/persistence capped at 2-3 members regardless of bonding
threshold and pointed at this sessility rule as the likely real cause —
worth re-running that sweep now that colonies can actually grow.
