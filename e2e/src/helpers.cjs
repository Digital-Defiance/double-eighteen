const SET_SIZES = [9, 12, 15, 18];

function doubleFixtures(maxPips) {
  return Array.from({ length: maxPips + 1 }, (_, value) => ({
    id: `double-${value}`,
    value1: value,
    value2: value,
  }));
}

const TRAIN_FIXTURE_IDS = [
  'regular-after-double',
  'double-after-regular',
  'double-after-double',
  'offset-zigzag',
  'horizontal-open',
  'vertical-open',
];

const OFFSET_ONLY_TRAIN_FIXTURE_IDS = ['offset-zigzag'];

const CHICKEN_FOOT_FIXTURE_IDS = [
  'single-foot',
  'foot-no-center',
  'nested-foot',
];

module.exports = {
  SET_SIZES,
  doubleFixtures,
  TRAIN_FIXTURE_IDS,
  OFFSET_ONLY_TRAIN_FIXTURE_IDS,
  CHICKEN_FOOT_FIXTURE_IDS,
};
