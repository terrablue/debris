const array = (left, right) =>
  left.reduce((to, _, i) => to && equals(left[i], right[i]), true);

const compare_deep = (left, right) =>
  Object.keys(left).reduce((to, key) =>
    to && equals(left[key], right[key]), true);

const object = (left, right) =>
  compare_deep(left, right) && compare_deep(right, left);

const if_arrays = (left, right) => Array.isArray(left) && Array.isArray(right);

const deep = (left, right) => if_arrays(left, right)
  ? array(left, right)
  : object(left, right);

const is_null = (left, right) =>
  left === null ? right === null : deep(left, right);

const compare = (left, right) =>
  typeof left === "object" ? is_null(left, right) : left === right;

const equals = (left, right) =>
  typeof left === typeof right ? compare(left, right) : false;

export default equals;
