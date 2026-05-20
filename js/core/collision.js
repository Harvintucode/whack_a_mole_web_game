// ==========================================================
// collision.js – Phát hiện va chạm (click/tap trúng chuột)
// ==========================================================

/**
 * Kiểm tra một click có trúng vào Mole đang nhô lên không
 * @param {Mole}       mole  – Instance Mole cần kiểm tra
 * @param {MouseEvent} event – Sự kiện click
 * @returns {boolean}
 */
export function isHitMole(mole, event) {
  if (!mole.isActive()) return false;

  const moleEl = mole.moleEl;
  const rect   = moleEl.getBoundingClientRect();

  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top  &&
    clientY <= rect.bottom
  );
}

/**
 * Tìm Mole đầu tiên trong danh sách bị click trúng
 * @param {Mole[]}     moles
 * @param {MouseEvent} event
 * @returns {Mole|null}
 */
export function findHitMole(moles, event) {
  return moles.find(m => isHitMole(m, event)) || null;
}

/**
 * Kiểm tra một click có rơi vào lỗ trống không (miss)
 * Click vào holeEl nhưng không trúng moleEl
 * @param {Mole}  mole
 * @param {Event} event
 * @returns {boolean}
 */
export function isHitEmptyHole(mole, event) {
  const holeEl = mole.holeEl;
  const rect   = holeEl.getBoundingClientRect();

  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  const inHole = (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top  &&
    clientY <= rect.bottom
  );

  return inHole && !mole.isActive();
}
