// ==========================================================
// bullet.js – Hiệu ứng hình ảnh khi búa đập xuống
// Tạo animation "tia lửa", "vòng tròn va chạm" tại điểm click
// ==========================================================

import { createElement } from '../utils/helper.js';

/** Hiệu ứng vòng tròn lan ra khi đập trúng */
export class HitEffect {
  /**
   * @param {HTMLElement} container – Element cha để chèn effect vào
   * @param {number}      x, y      – Toạ độ tương đối trong container
   * @param {string}      color     – Màu effect
   */
  constructor(container, x, y, color = '#ffd700') {
    this.el = createElement('div', ['hit-effect']);
    this.el.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: radial-gradient(circle, ${color}, transparent);
      transform: translate(-50%, -50%) scale(0);
      animation: hit-burst 0.4s ease-out forwards;
      pointer-events: none;
      z-index: 10;
    `;
    container.appendChild(this.el);

    // Tự xoá sau animation
    this.el.addEventListener('animationend', () => this.destroy());
  }

  destroy() {
    this.el?.remove();
  }
}

/** Hiệu ứng dấu "X" hoặc "!" khi đập bom */
export class BombEffect {
  constructor(container, x, y) {
    this.el = createElement('div', ['bomb-effect'], '💥');
    this.el.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      font-size: 40px;
      transform: translate(-50%, -50%) scale(0);
      animation: bomb-pop 0.5s ease-out forwards;
      pointer-events: none;
      z-index: 20;
    `;
    container.appendChild(this.el);
    this.el.addEventListener('animationend', () => this.destroy());
  }

  destroy() {
    this.el?.remove();
  }
}

/**
 * Tạo hiệu ứng tại điểm click dựa trên loại chuột
 * @param {HTMLElement} container
 * @param {MouseEvent|TouchEvent} event
 * @param {Object} typeData
 */
export function spawnHitEffect(container, event, typeData) {
  const rect = container.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  if (typeData?.isBad) {
    return new BombEffect(container, x, y);
  }

  const colors = {
    normal: '#ffd700',
    fast:   '#ff8c00',
    tough:  '#e74c3c',
    golden: '#f1c40f',
    bomb:   '#e74c3c',
  };
  const color = colors[typeData?.id] || '#ffd700';
  return new HitEffect(container, x, y, color);
}
