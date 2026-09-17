/**
 * XP -> level math, shared by the navbar's level bar and anywhere else that
 * needs to show progress. Pure functions, no I/O — profiles.xp is the only
 * stored value; level and progress-to-next-level are always derived from it
 * rather than cached, so there's nothing to keep in sync.
 *
 * Each level needs more XP than the last (triangular growth): level n -> n+1
 * costs 100 + (n-1)*50 XP. Level 1->2 costs 100, 2->3 costs 150, 3->4 costs
 * 200, and so on — cheap to reach early levels, steeper later, without the
 * numbers exploding the way a multiplicative curve would.
 */

const BASE_XP_PER_LEVEL = 100;
const XP_STEP_PER_LEVEL = 50;

/** Total cumulative XP required to REACH a given level (level 1 = 0 XP). */
function xpRequiredForLevel(level: number): number {
  const stepsCompleted = level - 1;
  // Sum of an arithmetic sequence: stepsCompleted terms starting at
  // BASE_XP_PER_LEVEL, increasing by XP_STEP_PER_LEVEL each time.
  return (
    (stepsCompleted * (2 * BASE_XP_PER_LEVEL + (stepsCompleted - 1) * XP_STEP_PER_LEVEL)) / 2
  );
}

export interface LevelProgress {
  level: number;
  /** XP earned since reaching the current level. */
  xpIntoLevel: number;
  /** XP needed to go from the current level to the next one. */
  xpForNextLevel: number;
  /** xpIntoLevel / xpForNextLevel, 0-1, for a progress bar. */
  progressRatio: number;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const xp = Math.max(0, totalXp);

  let level = 1;
  while (xpRequiredForLevel(level + 1) <= xp) {
    level += 1;
  }

  const xpAtCurrentLevel = xpRequiredForLevel(level);
  const xpForNextLevel = xpRequiredForLevel(level + 1) - xpAtCurrentLevel;
  const xpIntoLevel = xp - xpAtCurrentLevel;

  return {
    level,
    xpIntoLevel,
    xpForNextLevel,
    progressRatio: xpForNextLevel > 0 ? xpIntoLevel / xpForNextLevel : 0,
  };
}
