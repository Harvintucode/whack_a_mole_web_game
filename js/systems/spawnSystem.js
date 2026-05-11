// ==========================================================
// spawnSystem.js – Hệ thống spawn chuột
// Điều khiển: khi nào, loại gì, và ở lỗ nào chuột xuất hiện
// ==========================================================

import { weightedRandom, sampleN } from '../utils/math.js';
import { createEnemy } from '../entities/enemy.js';

export class SpawnSystem {
  /**
   * @param {Mole[]}   moles        – Mảng tất cả mole instances
   * @param {Object[]} moleTypeData – Dữ liệu từ enemies.json
   * @param {Object}   levelConfig  – Config của level hiện tại
   * @param {Function} onEscape     – Callback(typeData) khi chuột thoát
   * @param {Function} onHit        – Callback(points, typeData) khi chuột bị đập
   */
  constructor(moles, moleTypeData, levelConfig, onEscape, onHit) {
    this.moles        = moles;
    this.moleTypeData = moleTypeData;
    this.levelConfig  = levelConfig;
    this.onEscape     = onEscape;
    this.onHit        = onHit;

    this._spawnInterval = null;
    this._active        = false;
    this._currentInterval = levelConfig.spawnInterval;
    this._maxActiveMoles  = levelConfig.maxActiveMoles;
    this._speedMultiplier = levelConfig.speedMultiplier;

    // Debuff states
    this._debuffs = {
      FASTER_MOLES:   false,
      SHORTER_APPEAR: false,
      MORE_MOLES:     false,
      MORE_BOMBS:     false,
    };
  }

  /** Bắt đầu spawn */
  start() {
    this._active = true;
    this._scheduleNext();
  }

  /** Dừng spawn */
  stop() {
    this._active = false;
    clearTimeout(this._spawnInterval);
    this._spawnInterval = null;
    // Ép tất cả chuột ẩn xuống
    this.moles.forEach(m => m.forceHide());
  }

  /** Tạm dừng (debuff pick) */
  pause() {
    this._active = false;
    clearTimeout(this._spawnInterval);
  }

  /** Tiếp tục sau pause */
  resume() {
    this._active = true;
    this._scheduleNext();
  }

  /**
   * Áp dụng debuff vào hệ thống spawn
   * @param {string} effect – ID debuff từ constants.js
   */
  applyDebuff(effect) {
    switch (effect) {
      case 'FASTER_MOLES':
        this._currentInterval = Math.max(300, this._currentInterval * 0.7);
        this._speedMultiplier *= 1.3;
        break;
      case 'SHORTER_APPEAR':
        this._speedMultiplier *= 1.25;
        break;
      case 'MORE_MOLES':
        this._maxActiveMoles = Math.min(this._maxActiveMoles + 1, 8);
        break;
      case 'MORE_BOMBS':
        this._debuffs.MORE_BOMBS = true;
        break;
      case 'BLIND_HOLES':
        // Xử lý ở LevelSystem
        break;
      case 'TINY_HOLES':
        // Xử lý ở LevelSystem
        break;
    }
  }

  // --- Private ---

  _scheduleNext() {
    if (!this._active) return;
    clearTimeout(this._spawnInterval);
    this._spawnInterval = setTimeout(() => {
      this._spawnWave();
      this._scheduleNext();
    }, this._currentInterval);
  }

  _spawnWave() {
    if (!this._active) return;

    // Đếm số chuột đang nhô lên
    const active = this.moles.filter(m => m.isActive());
    const toSpawn = this._maxActiveMoles - active.length;
    if (toSpawn <= 0) return;

    // Lấy các lỗ đang rảnh
    const idle = this.moles.filter(m => !m.isActive() && !m.isBlinded);
    if (idle.length === 0) return;

    // Chọn ngẫu nhiên các lỗ để spawn (tối đa toSpawn lỗ, và tối đa idle)
    const slots = sampleN(idle, Math.min(toSpawn, idle.length, 2));
    slots.forEach(mole => this._spawnOne(mole));
  }

  _spawnOne(mole) {
    const typeData = this._pickType();
    // Cập nhật typeData cho mole
    mole.typeData = typeData;
    mole.hitsLeft = typeData.hitsRequired;

    const duration = this._calcDuration(typeData.upDuration);

    mole.popup(
      duration,
      (td) => this.onEscape(td),
      (pts, td) => this.onHit(pts, td),
    );
  }

  /** Chọn loại chuột theo weight, lọc theo allowedTypes của level */
  _pickType() {
    let pool = this.moleTypeData.filter(t =>
      this.levelConfig.allowedTypes.includes(t.id)
    );

    // Tăng weight bom nếu debuff MORE_BOMBS đang bật
    if (this._debuffs.MORE_BOMBS) {
      pool = pool.map(t => t.id === 'bomb' ? { ...t, weight: t.weight * 5 } : t);
    }

    return weightedRandom(pool) || pool[0];
  }

  /** Tính thời gian nhô lên theo speedMultiplier */
  _calcDuration(baseDuration) {
    return Math.max(400, Math.round(baseDuration / this._speedMultiplier));
  }
}
