// ==========================================================
// enemy.js – Các loại chuột đặc biệt (kế thừa Mole)
// Boss, SpeedyMole, BombMole với hành vi riêng
// ==========================================================

import { Mole } from './mouse.js';
import { addClass, removeClass } from '../utils/helper.js';

// ---- BossMole: xuất hiện ở 2 lỗ liền kề, cần đập nhiều hơn ----
export class BossMole extends Mole {
  constructor(holeEl, moleEl, index, typeData) {
    super(holeEl, moleEl, index, {
      ...typeData,
      hitsRequired: 3,
      points: 100,
      upDuration: 2500,
    });
    addClass(moleEl, 'boss');
  }

  popup(duration, onEscape, onHit) {
    // Boss hiển thị to hơn
    this.moleEl.style.transform = 'translateY(10px) scale(1.4)';
    super.popup(duration, onEscape, onHit);
  }

  _hide() {
    this.moleEl.style.transform = '';
    super._hide();
    removeClass(this.moleEl, 'boss');
  }
}

// ---- SpeedyMole: rất nhanh, di chuyển tới lui ----
export class SpeedyMole extends Mole {
  constructor(holeEl, moleEl, index, typeData) {
    super(holeEl, moleEl, index, {
      ...typeData,
      upDuration: 600,
      points: 25,
    });
    this._shakeInterval = null;
  }

  popup(duration, onEscape, onHit) {
    super.popup(duration, onEscape, onHit);
    // Hiệu ứng rung liên tục khi đang nhô lên
    this._shakeInterval = setInterval(() => {
      if (!this.isActive()) {
        clearInterval(this._shakeInterval);
        return;
      }
      addClass(this.moleEl, 'warning');
      setTimeout(() => removeClass(this.moleEl, 'warning'), 100);
    }, 200);
  }

  _hide() {
    clearInterval(this._shakeInterval);
    super._hide();
  }
}

// ---- BombMole: ĐỪNG đập! Mất mạng nếu đập phải ----
export class BombMole extends Mole {
  constructor(holeEl, moleEl, index, typeData) {
    super(holeEl, moleEl, index, {
      ...typeData,
      hitsRequired: 1,
      points: -20,
      isBad: true,
    });
  }

  popup(duration, onEscape, onHit) {
    super.popup(duration, onEscape, onHit);
    // Bom nhấp nháy để cảnh báo
    addClass(this.moleEl, 'bomb-pulse');
  }

  _hide() {
    removeClass(this.moleEl, 'bomb-pulse');
    super._hide();
  }
}

/**
 * Factory: Tạo đúng loại enemy dựa trên typeData
 * @param {HTMLElement} holeEl
 * @param {HTMLElement} moleEl
 * @param {number}      index
 * @param {Object}      typeData
 * @returns {Mole}
 */
export function createEnemy(holeEl, moleEl, index, typeData) {
  switch (typeData.id) {
    case 'bomb':   return new BombMole(holeEl, moleEl, index, typeData);
    default:       return new Mole(holeEl, moleEl, index, typeData);
  }
}
