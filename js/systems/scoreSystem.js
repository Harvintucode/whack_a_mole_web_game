// ==========================================================
// scoreSystem.js – Hệ thống tính điểm
// Xử lý: điểm cơ bản, score multiplier buff
// ==========================================================

export class ScoreSystem {
  constructor(player) {
    this.player = player;
    this._listeners = []; // Callback khi điểm thay đổi
    // BUG FIX: bỏ _debuffTriggerScore, _lastDebuffAt, _checkDebuffTrigger
    // Debuff milestone giờ do SpawnSystem quản lý hoàn toàn
  }

  /**
   * Xử lý đập TRÚNG chuột – cộng điểm có áp dụng multiplier buff
   * @param {Object} typeData    – Loại chuột bị đập
   * @param {number} multiplier  – Hệ số nhân điểm (từ SpawnSystem buff, mặc định 1)
   * @returns {number} earned    – Số điểm thực tế được cộng
   */
  onMoleHit(typeData, multiplier = 1) {
    this.player.registerHit();
    // BUG FIX #3: nhân điểm với multiplier (buff x2 score)
    const earned = this.player.addScore(Math.round(typeData.points * multiplier));
    this._notifyListeners(earned);
    return earned;
  }

  /**
   * Xử lý đập TRƯỢT (click lỗ trống)
   */
  onMiss() {
    this.player.registerMiss();
    this._notifyListeners(0);
  }

  /** Reset hệ thống điểm cho ván mới */
  reset() {
    // Không còn state nội bộ cần reset
  }

  /** Đăng ký callback khi điểm thay đổi */
  onChange(cb) {
    this._listeners.push(cb);
  }

  _notifyListeners(earned) {
    this._listeners.forEach(cb => cb(this.player.getScore(), earned));
  }
}