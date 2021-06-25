import { finder } from '@medv/finder';
const memo = new WeakMap();

const createElementMemo = (el) => memo.set(finder(el), el);

// TODO