// ==========================================================
// spawnSystem.js – Hệ thống spawn chuột
// Điều khiển: khi nào, loại gì, và ở lỗ nào chuột xuất hiện
// ==========================================================

// BUG FIX: bỏ import { createEnemy } không dùng → gây lỗi nếu file không tồn tại
import { weightedRandom, sampleN } from '../utils/math.js';

// ----------------------------------------------------------
// Các mốc điểm sẽ kích hoạt debuff
// Map 1 (easy) sẽ bỏ qua toàn bộ danh sách này
// ----------------------------------------------------------
const DEBUFF_SCORE_MILESTONES = [50, 100, 200, 300, 400, 600, 800, 1000, 1500, 2000, 2500, 3000];

export class SpawnSystem {
  /**
   * @param {Mole[]}   moles          – Mảng tất cả mole instances
   * @param {Object[]} moleTypeData   – Dữ liệu từ enemies.json
   * @param {Object}   levelConfig    – Config của level hiện tại
   * @param {number}   mapIndex       – Index map (0-based). Map 1 → mapIndex = 0, không có debuff
   * @param {Function} onEscape       – Callback(typeData) khi chuột thoát
   * @param {Function} onHit          – Callback(points, typeData) khi chuột bị đập
   * @param {Function} onDebuffReady  – Callback() khi đã đến mốc điểm VÀ wave vừa kết thúc
   */
  constructor(moles, moleTypeData, levelConfig, mapIndex, onEscape, onHit, onDebuffReady) {
    this.moles = moles;
    this.moleTypeData = moleTypeData;
    this.levelConfig = levelConfig;
    this.mapIndex = mapIndex;
    this.onEscape = onEscape;
    this.onHit = onHit;
    this.onDebuffReady = onDebuffReady ?? (() => { });

    this._spawnInterval = null;
    this._active = false;
    this._currentInterval = levelConfig.spawnInterval;
    this._maxActiveMoles = levelConfig.maxActiveMoles;
    this._speedMultiplier = levelConfig.speedMultiplier;

    // --- Milestone tracking ---
    this._reachedMilestones = new Set();
    this._pendingDebuff = false;

    // --- One-time flags ---
    this._tinyHolesUsed = false; // TINY_HOLES chỉ xuất hiện 1 lần

    // --- Buff states ---
    this._buffs = {
      SCORE_MULTIPLIER: { active: false, multiplier: 1, timer: null },
      SLOW_MOLES: { active: false, timer: null },
      FREEZE: { active: false, timer: null },
    };

    // --- Debuff states ---
    this._debuffs = {
      FASTER_MOLES: false,
      SHORTER_APPEAR: false,
      MORE_MOLES: false,
      MORE_BOMBS: false,
      BLIND_HOLES: false,
      TINY_HOLES: false,
      DARK_SCREEN: false,
      FAKE_MOLES: false,
      SHRINK_HAMMER: false,
    };
  }

  // ============================================================
  // Public API
  // ============================================================

  start() {
    this._active = true;
    this._scheduleNext();
  }

  stop() {
    this._active = false;
    clearTimeout(this._spawnInterval);
    this._spawnInterval = null;
    this._clearAllBuffTimers();
    this.moles.forEach(m => m.forceHide());
  }

  pause() {
    this._active = false;
    clearTimeout(this._spawnInterval);
  }

  resume() {
    this._active = true;
    this._pendingDebuff = false;
    this._scheduleNext();
  }

  /**
   * Gọi mỗi khi điểm số thay đổi.
   * Nếu vượt mốc mới → đặt cờ _pendingDebuff,
   * sẽ trigger ngay sau khi wave hiện tại trống.
   */
  notifyScore(score) {
    if (this.mapIndex === 0) return; // Map 1 không có debuff

    for (const milestone of DEBUFF_SCORE_MILESTONES) {
      if (score >= milestone && !this._reachedMilestones.has(milestone)) {
        this._reachedMilestones.add(milestone);

        this._pendingDebuff = true;
        break;
      }
    }
  }

  /**
   * Áp dụng debuff.
   * @returns {boolean} false nếu debuff bị từ chối (TINY_HOLES đã dùng)
   */
  applyDebuff(effect) {
    if (effect === 'TINY_HOLES') {
      if (this._tinyHolesUsed) return false;
      this._tinyHolesUsed = true;
      this._debuffs.TINY_HOLES = true;
      return true;
    }

    switch (effect) {
      case 'FASTER_MOLES':
        this._currentInterval = Math.max(300, this._currentInterval * 0.7);
        this._speedMultiplier *= 1.3;
        this._debuffs.FASTER_MOLES = true;
        break;
      case 'SHORTER_APPEAR':
        this._speedMultiplier *= 1.25;
        this._debuffs.SHORTER_APPEAR = true;
        break;
      case 'MORE_MOLES':
        this._maxActiveMoles = Math.min(this._maxActiveMoles + 1, 8);
        this._debuffs.MORE_MOLES = true;
        break;
      case 'MORE_BOMBS':
        this._debuffs.MORE_BOMBS = true;
        break;
      case 'BLIND_HOLES':
        this._debuffs.BLIND_HOLES = true;
        break;
      case 'DARK_SCREEN':
        this._debuffs.DARK_SCREEN = true;
        break;
      case 'FAKE_MOLES':
        this._debuffs.FAKE_MOLES = true;
        break;
      case 'SHRINK_HAMMER':
        this._debuffs.SHRINK_HAMMER = true;
        break;
      default:
        console.warn(`[SpawnSystem] Unknown debuff: ${effect}`);
        return false;
    }
    return true;
  }

  /**
   * Áp dụng buff tạm thời.
   * @param {string} effect
   * @param {number} duration ms, mặc định 8000
   */
  applyBuff(effect, duration = 8000) {
    switch (effect) {
      case 'SCORE_MULTIPLIER':
        this._buffs.SCORE_MULTIPLIER.active = true;
        this._buffs.SCORE_MULTIPLIER.multiplier = 2;
        clearTimeout(this._buffs.SCORE_MULTIPLIER.timer);
        this._buffs.SCORE_MULTIPLIER.timer = setTimeout(() => {
          this._buffs.SCORE_MULTIPLIER.active = false;
          this._buffs.SCORE_MULTIPLIER.multiplier = 1;
        }, duration);
        break;

      case 'SLOW_MOLES':
        if (!this._buffs.SLOW_MOLES.active) {
          this._speedMultiplier = Math.max(0.5, this._speedMultiplier * 0.6);
        }
        this._buffs.SLOW_MOLES.active = true;
        clearTimeout(this._buffs.SLOW_MOLES.timer);
        this._buffs.SLOW_MOLES.timer = setTimeout(() => {
          this._speedMultiplier /= 0.6;
          this._buffs.SLOW_MOLES.active = false;
        }, duration);
        break;

      case 'FREEZE':
        this._buffs.FREEZE.active = true;
        this.moles.forEach(m => m.forceHide());
        clearTimeout(this._spawnInterval);
        clearTimeout(this._buffs.FREEZE.timer);
        this._buffs.FREEZE.timer = setTimeout(() => {
          this._buffs.FREEZE.active = false;
          if (this._active) this._scheduleNext();
        }, duration);
        break;

      case 'REVEAL_BOMBS':
        // Xử lý ở LevelSystem
        break;

      default:
        console.warn(`[SpawnSystem] Unknown buff: ${effect}`);
    }
  }

  /** Trả về hệ số nhân điểm hiện tại */
  getScoreMultiplier() {
    return this._buffs.SCORE_MULTIPLIER.active
      ? this._buffs.SCORE_MULTIPLIER.multiplier
      : 1;
  }

  // ============================================================
  // Private
  // ============================================================

  _scheduleNext() {
    if (!this._active) return;
    clearTimeout(this._spawnInterval);
    this._spawnInterval = setTimeout(() => {
      this._spawnWave();
      this._scheduleNext();
    }, this._currentInterval);
  }

  _spawnWave() {
    if (!this._active || this._buffs.FREEZE.active) return;

    const active = this.moles.filter(m => m.isActive());
    const toSpawn = this._maxActiveMoles - active.length;

    // Kiểm tra pending debuff SAU KHI wave trống
    if (this._pendingDebuff && active.length === 0) {
      this._pendingDebuff = false;
      this.pause(); // tự pause trước khi gọi callback
      this.onDebuffReady();
      return;
    }

    if (toSpawn <= 0) return;

    const idle = this.moles.filter(m => !m.isActive() && !m.isBlinded);
    if (idle.length === 0) return;

    const slots = sampleN(idle, Math.min(toSpawn, idle.length, 2));
    slots.forEach(mole => this._spawnOne(mole));
  }

  _spawnOne(mole) {
    const typeData = this._pickType();
    mole.typeData = typeData;
    mole.hitsLeft = typeData.hitsRequired;
    const duration = this._calcDuration(typeData.upDuration);

    mole.popup(
      duration,
      (td) => this.onEscape(td),
      (pts, td) => this.onHit(pts, td),
    );
  }

  _pickType() {
    let pool = this.moleTypeData.filter(t =>
      this.levelConfig.allowedTypes.includes(t.id)
    );

    if (this._debuffs.MORE_BOMBS) {
      pool = pool.map(t => t.id === 'bomb' ? { ...t, weight: t.weight * 5 } : t);
    }

    if (this._debuffs.FAKE_MOLES) {
      pool = pool.map(t => t.id === 'fake' ? { ...t, weight: t.weight * 3 } : t);
    }

    return weightedRandom(pool) ?? pool[0];
  }

  _calcDuration(baseDuration) {
    return Math.max(400, Math.round(baseDuration / this._speedMultiplier));
  }

  _clearAllBuffTimers() {
    Object.values(this._buffs).forEach(b => {
      if (b?.timer) clearTimeout(b.timer);
    });
  }
}