// ==========================================================
// healthSystem.js – Hệ thống máu/mạng sống
// Xử lý: mất mạng, cộng mạng, game over condition
// ==========================================================

import { flashLifeLost } from '../utils/helper.js';

export class HealthSystem {
  /**
   * @param {Player} player
   * @param {Function} onGameOver – Callback khi hết mạng
   * @param {Function} onLivesChange – Callback(lives) khi mạng thay đổi
   */
  constructor(player, onGameOver, onLivesChange) {
    this.player        = player;
    this._onGameOver   = onGameOver;
    this._onLivesChange = onLivesChange;
  }

  /**
   * Xử lý khi chuột thoát (không bị đập)
   * Bom thoát thì KHÔNG mất mạng (vì không đập bom là đúng)
   * @param {Object} typeData – Loại chuột thoát
   */
  onMoleEscape(typeData) {
    if (typeData.isBad) return; // Bom thoát = may mắn, không mất mạng

    this.player.registerEscape();
    const alive = this.player.loseLife();
    flashLifeLost();
    this._onLivesChange(this.player.lives);

    if (!alive) {
      this._onGameOver('no_lives');
    }
  }

  /**
   * Xử lý khi đập TRÚNG bom
   * @param {Object} typeData
   */
  onBombHit(typeData) {
    if (!typeData.isBad) return;
    const alive = this.player.loseLife();
    flashLifeLost();
    this._onLivesChange(this.player.lives);
    if (!alive) {
      this._onGameOver('bomb_hit');
    }
  }

  /**
   * Cộng mạng (từ debuff bonus)
   */
  addLives(amount) {
    this.player.gainLife(amount);
    this._onLivesChange(this.player.lives);
  }

  getLives() {
    return this.player.lives;
  }
}
