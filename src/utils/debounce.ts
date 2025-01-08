export const debounce = (fn: Function, delay = 1000) => {
  let timer: any | null = null;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  }
}