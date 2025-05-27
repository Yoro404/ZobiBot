const BASE_XP = 100;
const FACTOR = 1.5;

module.exports = (level) => {
  if (level < 1) throw new Error("Level must be >= 1");
  return Math.floor(BASE_XP * Math.pow(level, FACTOR));
};