// ==========================================================
// helper.js – Các hàm hỗ trợ DOM và tiện ích chung
// ==========================================================

/** Lấy element bằng ID */
export function $(id) {
  return document.getElementById(id);
}

/** Lấy element bằng CSS selector */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

// --- Class helpers ---
export const addClass = (el, cls) => el?.classList.add(cls);
export const removeClass = (el, cls) => el?.classList.remove(cls);
export const toggleClass = (el, cls) => el?.classList.toggle(cls);
export const hasClass = (el, cls) => el?.classList.contains(cls) ?? false;

// --- Visibility helpers ---
export function show(el) { removeClass(el, 'hidden'); }
export function hide(el) { addClass(el, 'hidden'); }
export function isHidden(el) { return hasClass(el, 'hidden'); }

/**
 * Tạo element HTML với class và nội dung tùy chọn
 */
export function createElement(tag, classes = [], html = '') {
  const el = document.createElement(tag);
  if (classes.length) el.className = classes.join(' ');
  if (html) el.innerHTML = html;
  return el;
}
export function shuffle(array) {

  return array.sort(
    () => Math.random() - 0.5
  );
}

/** Gán nội dung text cho element theo ID */
export function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

/** Gán innerHTML cho element theo ID */
export function setHTML(id, html) {
  const el = $(id);
  if (el) el.innerHTML = html;
}

/**
 * Định dạng thời gian thành mm:ss
 * @param {number} seconds – Số giây
 */
export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const r = (s % 60).toString().padStart(2, '0');
  return `${m}:${r}`;
}

/**
 * Hiển thị mạng sống dưới dạng icon trái tim
 * @param {number} lives – Số mạng hiện tại
 * @param {number} max   – Số mạng tối đa
 */
export function livesToHearts(lives, max = 3) {
  const full = '❤️'.repeat(Math.max(0, lives));
  const empty = '🖤'.repeat(Math.max(0, max - lives));
  return full + empty;
}

/**
 * Trì hoãn thực thi (Promise-based)
 * @param {number} ms
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Thêm popup điểm nổi lên khi đập trúng chuột
 * @param {HTMLElement} holeEl – Element của cái lỗ
 * @param {number}      points – Điểm cộng/trừ
 */
export function spawnScorePopup(holeEl, points) {
  const popup = createElement('div', ['score-popup'], points > 0 ? `+${points}` : `${points}`);
  popup.style.color = points > 0 ? '#2ecc40' : '#ff4136';
  holeEl.appendChild(popup);
  if (points >= 50) popup.classList.add('fx-excellent');
  else if (points >= 20) popup.classList.add('fx-awesome');
  else popup.classList.add('fx-great');
  setTimeout(() => popup.remove(), 800);
}

/**
 * Làm nổi cảnh báo "chuột thoát" (mất mạng) lên body
 */
export function flashLifeLost() {
  document.body.classList.add('life-lost-flash');
  setTimeout(() => document.body.classList.remove('life-lost-flash'), 400);
}
