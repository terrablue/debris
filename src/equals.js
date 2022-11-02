const array = (left, right) =>
  left.reduce((to, _, i) => to && equals(left[i], right[i]), true);

const deepCompare = (left, right) =>
  Object.keys(left).reduce((to, key) =>
    to && equals(left[key], right[key]), true);

const object = (left, right) =>
  deepCompare(left, right) && deepCompare(right, left);

const arrays = (left, right) => Array.isArray(left) && Array.isArray(right);

const deep = (left, right) => arrays(left, right)
  ? array(left, right)
  : object(left, right);

const isNull = (left, right) =>
  left === null ? right === null : deep(left, right);

const compare = (left, right) =>
  typeof left === "object" ? isNull(left, right) : left === right;

const equals = (left, right) =>
  typeof left === typeof right ? compare(left, right) : false;

export default equals;
