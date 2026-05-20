// ==========================================================
// hud.js – Giao diện HUD (điểm, thời gian, mạng)
// ==========================================================

import { $, show, hide, setText, formatTime, livesToHearts } from '../utils/helper.js';
import { SETTINGS } from '../utils/constants.js';

export class HUD {
  constructor() {
    this.hudEl      = $('hud');
    this.scoreEl    = $('score-value');
    this.timeEl     = $('time-value');
    this.livesEl    = $('lives-value');
    this._maxLives  = SETTINGS.INITIAL_LIVES;
  }

  /** Hiển thị HUD */
  show() { show(this.hudEl); }

  /** Ẩn HUD */
  hide() { hide(this.hudEl); }

  /** Cập nhật điểm */
  updateScore(score) {
    if (this.scoreEl) this.scoreEl.textContent = score;
  }

  /** Cập nhật thời gian còn lại */
  updateTime(seconds) {
    if (!this.timeEl) return;
    this.timeEl.textContent = formatTime(seconds);
    // Màu đỏ khi còn ít thời gian
    if (seconds <= 10) {
      this.timeEl.style.color = '#e74c3c';
      this.timeEl.style.animation = 'pulse-red 0.5s infinite';
    } else {
      this.timeEl.style.color = '';
      this.timeEl.style.animation = '';
    }
  }

  /** Cập nhật mạng sống */
  updateLives(lives) {
    if (this.livesEl) {
      this.livesEl.innerHTML = livesToHearts(lives, this._maxLives);
    }
  }

  /** Gán số mạng tối đa (để hiển thị đủ icon trái tim trống) */
  setMaxLives(max) {
    this._maxLives = max;
  }

  /** Reset HUD về trạng thái ban đầu */
  reset(duration, lives, maxLives = SETTINGS.INITIAL_LIVES) {
    this._maxLives = maxLives;
    this.updateScore(0);
    this.updateTime(duration);
    this.updateLives(lives);
    if (this.timeEl) {
      this.timeEl.style.color = '';
      this.timeEl.style.animation = '';
    }
  }
}
