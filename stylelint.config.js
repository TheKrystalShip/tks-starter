// The Krystal config at error: a literal colour, a radius off the scale, a hand-written surface
// border or a selector naming a `.k-` class fails `npm run lint:css`. A sheet styles its own classes.
export default {
  extends: ["@thekrystalship/krystal/stylelint"],
  defaultSeverity: "error",
};
