// ==========================================================
// math.js – Các hàm toán học tiện ích
// ==========================================================

/**
 * Trả về số nguyên ngẫu nhiên trong [min, max] (bao gồm 2 đầu)
 */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Lấy 1 phần tử ngẫu nhiên từ mảng
 */
export function randElement(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Lấy phần tử ngẫu nhiên theo trọng số (weighted random)
 * Mỗi item phải có thuộc tính `weight`
 * @param {Array<{weight: number}>} items
 */
export function weightedRandom(items) {
  if (!items || items.length === 0) return null;
  const total = items.reduce((sum, item) => sum + (item.weight || 0), 0);
  if (total === 0) return randElement(items);
  let rand = Math.random() * total;
  for (const item of items) {
    rand -= item.weight || 0;
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
}

/**
 * Giới hạn giá trị trong khoảng [min, max]
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Trộn ngẫu nhiên mảng (Fisher-Yates shuffle) – không thay đổi mảng gốc
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Lấy n phần tử ngẫu nhiên không trùng nhau từ mảng
 */
export function sampleN(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

/**
 * Nội suy tuyến tính
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Ánh xạ giá trị từ khoảng [inMin,inMax] sang [outMin,outMax]
 */
export function mapRange(val, inMin, inMax, outMin, outMax) {
  return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
}
