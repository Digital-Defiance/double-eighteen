import { DominoValue } from '@/game/DominoValue';
import { TrainBranch } from '@/game/TrainData';
import { TrainLayoutStyle } from '@/app/trainLayout';

export interface TrainFixture {
  id: string;
  name: string;
  description: string;
  angle: number;
  dominoes: DominoValue[];
  layoutStyles: TrainLayoutStyle[];
}

export interface ChickenFootFixture {
  id: string;
  name: string;
  description: string;
  angle: number;
  branch: TrainBranch;
  layoutStyles: TrainLayoutStyle[];
}

export const TRAIN_FIXTURES: TrainFixture[] = [
  {
    id: 'regular-after-double',
    name: 'Regular after double',
    description: 'Double followed by a two-tile offset run',
    angle: 0,
    dominoes: [
      { value1: 12, value2: 6 },
      { value1: 6, value2: 6 },
      { value1: 6, value2: 3 },
      { value1: 3, value2: 1 },
    ],
    layoutStyles: ['linear', 'offset'],
  },
  {
    id: 'double-after-regular',
    name: 'Double after regular',
    description: 'Offset run, a double, then another offset run',
    angle: 0,
    dominoes: [
      { value1: 12, value2: 9 },
      { value1: 9, value2: 4 },
      { value1: 4, value2: 4 },
      { value1: 4, value2: 2 },
      { value1: 2, value2: 7 },
    ],
    layoutStyles: ['linear', 'offset'],
  },
  {
    id: 'double-after-double',
    name: 'Double after double',
    description: 'Offset runs at the head, middle, and tail around two doubles',
    angle: 90,
    dominoes: [
      { value1: 12, value2: 7 },
      { value1: 7, value2: 8 },
      { value1: 8, value2: 8 },
      { value1: 8, value2: 3 },
      { value1: 3, value2: 5 },
      { value1: 5, value2: 5 },
      { value1: 5, value2: 2 },
      { value1: 2, value2: 1 },
    ],
    layoutStyles: ['linear', 'offset'],
  },
  {
    id: 'offset-zigzag',
    name: 'Offset zigzag',
    description: 'Alternating perpendicular tiles without doubles',
    angle: 0,
    dominoes: [
      { value1: 12, value2: 5 },
      { value1: 5, value2: 9 },
      { value1: 9, value2: 2 },
      { value1: 2, value2: 7 },
      { value1: 7, value2: 1 },
    ],
    layoutStyles: ['offset'],
  },
  {
    id: 'horizontal-open',
    name: 'Horizontal train',
    description: 'Rightward train: offset head, double, offset tail',
    angle: 0,
    dominoes: [
      { value1: 5, value2: 12 },
      { value1: 12, value2: 11 },
      { value1: 11, value2: 11 },
      { value1: 11, value2: 6 },
      { value1: 6, value2: 2 },
    ],
    layoutStyles: ['linear', 'offset'],
  },
  {
    id: 'vertical-open',
    name: 'Vertical train',
    description: 'Downward train: offset head, double, offset tail',
    angle: 90,
    dominoes: [
      { value1: 3, value2: 12 },
      { value1: 12, value2: 10 },
      { value1: 10, value2: 10 },
      { value1: 10, value2: 4 },
      { value1: 4, value2: 1 },
    ],
    layoutStyles: ['linear', 'offset'],
  },
];

export function getTrainFixture(id: string): TrainFixture | undefined {
  return TRAIN_FIXTURES.find((fixture) => fixture.id === id);
}

export const CHICKEN_FOOT_FIXTURES: ChickenFootFixture[] = [
  {
    id: 'single-foot',
    name: 'Single foot',
    description:
      'A double fans two angled toes (±45°) while the main line continues straight as the center toe',
    angle: 0,
    branch: {
      dominoes: [
        { value1: 12, value2: 6 },
        { value1: 6, value2: 6 },
        { value1: 6, value2: 3 },
        { value1: 3, value2: 1 },
      ],
      feet: {
        1: [
          {
            dominoes: [
              { value1: 6, value2: 2 },
              { value1: 2, value2: 5 },
            ],
          },
          {
            dominoes: [
              { value1: 6, value2: 4 },
              { value1: 4, value2: 0 },
            ],
          },
        ],
      },
    },
    layoutStyles: ['linear', 'offset'],
  },
  {
    id: 'foot-no-center',
    name: 'Foot at the tail',
    description:
      'Double ends the main line, so both side toes are present with no straight continuation',
    angle: 0,
    branch: {
      dominoes: [
        { value1: 9, value2: 7 },
        { value1: 7, value2: 7 },
      ],
      feet: {
        1: [
          {
            dominoes: [
              { value1: 7, value2: 3 },
              { value1: 3, value2: 8 },
            ],
          },
          {
            dominoes: [
              { value1: 7, value2: 5 },
              { value1: 5, value2: 0 },
            ],
          },
        ],
      },
    },
    layoutStyles: ['linear', 'offset'],
  },
  {
    id: 'nested-foot',
    name: 'Nested foot',
    description:
      'A side toe contains its own double, which sprouts a second-level foot',
    angle: 90,
    branch: {
      dominoes: [
        { value1: 12, value2: 8 },
        { value1: 8, value2: 8 },
        { value1: 8, value2: 3 },
      ],
      feet: {
        1: [
          {
            dominoes: [
              { value1: 8, value2: 5 },
              { value1: 5, value2: 5 },
              { value1: 5, value2: 2 },
            ],
            feet: {
              1: [
                {
                  dominoes: [
                    { value1: 5, value2: 9 },
                    { value1: 9, value2: 1 },
                  ],
                },
                {
                  dominoes: [
                    { value1: 5, value2: 4 },
                    { value1: 4, value2: 6 },
                  ],
                },
              ],
            },
          },
          {
            dominoes: [
              { value1: 8, value2: 1 },
              { value1: 1, value2: 7 },
            ],
          },
        ],
      },
    },
    layoutStyles: ['linear', 'offset'],
  },
];

export function getChickenFootFixture(
  id: string
): ChickenFootFixture | undefined {
  return CHICKEN_FOOT_FIXTURES.find((fixture) => fixture.id === id);
}
