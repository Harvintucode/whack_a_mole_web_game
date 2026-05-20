// ==========================================================
// player.js – Thực thể người chơi
// Lưu trữ: score, lives, combo, stats trong 1 ván chơi
// ==========================================================

import { SETTINGS } from '../utils/constants.js';
import { clamp } from '../utils/math.js';

export class Player {
  constructor(maxLives = SETTINGS.INITIAL_LIVES) {
    this.maxLives = maxLives;
    this.reset();
  }

  /** Đặt lại toàn bộ trạng thái người chơi */
  reset() {
    this.score        = 0;
    this.lives        = this.maxLives;
    this.combo        = 0;       // Chuỗi đập liên tiếp
    this.maxCombo     = 0;       // Chuỗi cao nhất trong ván
    this.totalHits    = 0;       // Tổng số lần đập trúng
    this.totalMisses  = 0;       // Tổng số lần miss
    this.molésEscaped = 0;       // Chuột thoát được (không bị đập)
    this.scoreMultiplier = 1.0;  // Hệ số điểm (debuff có thể thay đổi)
  }

  // --- Score ---

  /** Cộng điểm (có nhân multiplier) */
  addScore(points) {
    const earned = Math.round(points * this.scoreMultiplier);
    this.score = Math.max(0, this.score + earned);
    return earned; // Trả về điểm thực tế đã cộng
  }

  /** Lấy điểm hiện tại */
  getScore() { return this.score; }

  // --- Lives ---

  /** Trừ 1 mạng, trả về true nếu còn mạng */
  loseLife() {
    this.lives = clamp(this.lives - 1, 0, this.maxLives);
    this.combo = 0; // Reset combo khi mất mạng
    return this.lives > 0;
  }

  /** Cộng mạng (tối đa maxLives theo SETTINGS.MAX_LIVES) */
  gainLife(amount = 1) {
    this.lives = clamp(this.lives + amount, 0, SETTINGS.MAX_LIVES);
  }

  /** Cập nhật maxLives (do debuff/buff) */
  setMaxLives(max) {
    this.maxLives = max;
  }

  isAlive() { return this.lives > 0; }

  // --- Combo & Stats ---

  /** Gọi khi đập TRÚNG chuột */
  registerHit() {
    this.totalHits++;
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
  }

  /** Gọi khi đập TRƯỢT (click vào lỗ trống) */
  registerMiss() {
    this.totalMisses++;
    this.combo = 0;
  }

  /** Gọi khi chuột thoát (không bị đập) */
  registerEscape() {
    this.molésEscaped++;
    this.combo = 0;
  }

  /** Độ chính xác (%) */
  getAccuracy() {
    const total = this.totalHits + this.totalMisses;
    if (total === 0) return 100;
    return Math.round((this.totalHits / total) * 100);
  }

  /** Snapshot kết quả cuối game */
  getSummary() {
    return {
      score:       this.score,
      lives:       this.lives,
      maxCombo:    this.maxCombo,
      totalHits:   this.totalHits,
      totalMisses: this.totalMisses,
      molésEscaped: this.molésEscaped,
      accuracy:    this.getAccuracy(),
    };
  }
}
