# Adhesion compatibility strictness (simple-evolution-simulator)

**Status:** empirically tuned, threshold kept at 0.75 — see "What was found"
below. The remaining open question (per-lineage evolvable threshold) stays
deferred, now for a different reason: not worth the complexity until colony
growth itself is unblocked (see todos/multicellular-motility.md).

## What it is

How similar two organisms' realized surface-protein sequences must be to
bond (the Hamming-similarity threshold for colony membership). This is a
single number, but it controls a real evolutionary dynamic: how strict or
loose kin/self recognition is within colonies.

## Why it matters

Aggregative multicellularity has a real evolutionary stability problem
that clonal multicellularity doesn't: clonal bodies are genetically
identical throughout (relatedness = 1), so cooperation is automatically
aligned with individual fitness. Aggregative colonies pull together
organisms that may not be identical, which opens the door to "cheater"
dynamics — an organism that joins a colony, benefits from whatever payoff
clustering provides, but doesn't pay the same cost as more "committed"
members. Tight compatibility thresholds behave like strict kin
recognition (stable, but colonies form rarely/only among close relatives).
Loose thresholds allow bigger, more diverse colonies to form more often,
but are more exploitable and may explain boom/bust dynamics in colony
prevalence over generations (a real phenomenon, not necessarily a bug —
see the adhesion boom around one playtest's generation ~38, gone by ~43).

## What was found

Swept every distinct discrete tier `COLONY_COMPATIBILITY_THRESHOLD` can land
on for a 6-symbol motif — exact-match-only (1.0), ≤1 mismatch (0.75, the
existing default), ≤2 mismatches (0.6), and ≤4 mismatches (0.3) — across 3
seeds, 12000 ticks each, default environment/mutation config, real
population sizes (~250). Surface-protein expression itself evolves readily
(5-13 concurrent expressers wasn't unusual), and bonding happens at every
tier tested (10-30% of ticks had at least one active colony, 70-134 distinct
formation events per run). But at *every* threshold tested, colony size
never exceeded 3 members and colonies never persisted for long — no
monotonic or otherwise meaningful trend with threshold strictness at all.

That's the real finding: threshold strictness, across its whole meaningful
range, isn't the lever controlling colony size or stability here. Something
else caps it — the leading suspect is `moveOrganism` in `engine/simulation.ts`
making any bonded pair immediately sessile and foraging-locked (see
todos/multicellular-motility.md), which would make a nascent 2-3 member
colony fragile/short-lived regardless of how easy or hard it was to bond in
the first place. Loosening the threshold bought nothing empirically, so it's
kept at 0.75 (the existing, biologically-motivated "kin-recognition" middle
tier) rather than changed on spec.

The originally-suspected "cheater dynamics" / boom-bust-from-looseness
story wasn't observed either way in this sweep — plausibly because colonies
never grow large enough for cheating to matter yet. Worth another look once
colony growth is actually unblocked.

## What it requires (still open)

- Once colony growth is unblocked (motility fix lands and colonies can
  plausibly grow past 2-3 members), it may be worth re-running this same
  sweep — a threshold that shows no effect on small, short-lived colonies
  could still matter once colonies get big enough for cheater dynamics or
  boom/bust to actually manifest.
- Consider whether the threshold itself should be evolvable (encoded in
  the genome, like everything else) rather than a fixed global constant —
  would let different lineages evolve different degrees of
  "clannishness," which is a nice fit for this project's usual approach,
  but adds complexity; only worth it if a fixed global threshold proves
  unsatisfying *and* colony growth is no longer the binding constraint.

## Relation to other in-flight work

The real blocker this surfaced is todos/multicellular-motility.md, not
anything about this threshold itself.
