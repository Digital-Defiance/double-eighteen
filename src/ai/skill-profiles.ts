import { HEURISTIC_IDS } from './heuristics';
import { SkillProfile } from './types';

const H = HEURISTIC_IDS;

/**
 * Stock skill tiers. Each is just a configuration of the same engine:
 *
 * - **beginner** — only cares about playing and lightly about dumping pips, with
 *   high temperature and a real blunder rate: erratic, often suboptimal plays.
 * - **intermediate** — adds doubles-early and own-train sense, low noise.
 * - **advanced** — full heuristic suite (obligations, flexibility, defense),
 *   near-deterministic, no blunders.
 *
 * Clone and tweak (`{ ...SKILL_PRESETS.advanced, temperature: 0.3 }`) for any
 * point on the spectrum.
 */
export const SKILL_PRESETS: Record<'beginner' | 'intermediate' | 'advanced', SkillProfile> = {
  beginner: {
    id: 'beginner',
    temperature: 2.5,
    blunderRate: 0.25,
    lookaheadDepth: 0,
    enabled: new Set([H.preferPlay, H.dumpPips]),
    weights: {
      [H.preferPlay]: 1,
      [H.dumpPips]: 0.2,
    },
  },
  intermediate: {
    id: 'intermediate',
    temperature: 0.6,
    blunderRate: 0.05,
    lookaheadDepth: 0,
    enabled: new Set([H.preferPlay, H.dumpPips, H.doublesEarly, H.ownTrain]),
    weights: {
      [H.preferPlay]: 1,
      [H.dumpPips]: 1,
      [H.doublesEarly]: 1,
      [H.ownTrain]: 1,
    },
  },
  advanced: {
    id: 'advanced',
    temperature: 0.15,
    blunderRate: 0,
    lookaheadDepth: 0,
    enabled: new Set([
      H.preferPlay,
      H.dumpPips,
      H.doublesEarly,
      H.ownTrain,
      H.obligationRelief,
      H.handFlexibility,
      H.defensivePublic,
    ]),
    weights: {
      [H.preferPlay]: 1,
      [H.dumpPips]: 1.2,
      [H.doublesEarly]: 1.5,
      [H.ownTrain]: 1,
      [H.obligationRelief]: 1.5,
      [H.handFlexibility]: 1,
      [H.defensivePublic]: 1.5,
    },
  },
};

export type SkillLevel = keyof typeof SKILL_PRESETS;

export function getSkillProfile(level: SkillLevel): SkillProfile {
  return SKILL_PRESETS[level];
}
