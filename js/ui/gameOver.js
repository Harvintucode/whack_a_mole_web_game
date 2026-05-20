// ==========================================================
// gameOver.js – Màn hình Game Over
// ==========================================================

import { $, show, hide, setText } from '../utils/helper.js';

export class GameOverUI {
  constructor() {
    this.screenEl    = $('game-over-screen');
    this.finalScoreEl = $('final-score');
    this.summaryEl   = $('game-summary');
  }

  /**
   * Hiển thị màn hình kết thúc với thống kê
   * @param {Object} summary – Từ player.getSummary()
   * @param {string} reason  – 'no_lives' | 'time_up' | 'bomb_hit'
   */
  show(summary, reason = 'time_up') {
    document.body.className = 'gameover-bg';

    if (this.finalScoreEl) {
      this.finalScoreEl.textContent = summary.score;
    }

    // Ghi chi tiết vào phần summary (nếu có element)
    if (this.summaryEl) {
      const reasonText = {
        no_lives: '💀 Hết mạng!',
        time_up:  '⏰ Hết giờ!',
        bomb_hit: '💣 Dẫm phải bom!',
      }[reason] || '⏰ Hết giờ!';

      this.summaryEl.innerHTML = `
        <p class="reason-text">${reasonText}</p>
        <div class="stats-grid">
          <div class="stat-item"><span>🎯 Đập trúng</span><strong>${summary.totalHits}</strong></div>
          <div class="stat-item"><span>💨 Chuột thoát</span><strong>${summary.molésEscaped}</strong></div>
          <div class="stat-item"><span>🔥 Combo cao nhất</span><strong>${summary.maxCombo}</strong></div>
          <div class="stat-item"><span>📊 Độ chính xác</span><strong>${summary.accuracy}%</strong></div>
        </div>
      `;
    }

    show(this.screenEl);
  }

  /** Ẩn màn hình game over */
  hide() {
    hide(this.screenEl);
  }
}
