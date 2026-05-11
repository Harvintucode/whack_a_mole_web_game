// ==========================================================
// scoreSystem.js – Hệ thống tính điểm
// Xử lý: điểm cơ bản, combo multiplier, debuff effects
// ==========================================================

export class ScoreSystem {
  constructor(player) {
    this.player      = player;
    this._listeners  = []; // Callback khi điểm thay đổi
    this._debuffTriggerScore = 50; // Mặc định, sẽ được overwrite bởi level
    this._lastDebuffAt = 0;  // Điểm lần cuối trigger debuff
  }

  /** Cài debuff trigger từ config level */
  configure(levelConfig) {
    this._debuffTriggerScore = levelConfig.debuffTriggerScore || 50;
  }

  /**
   * Xử lý đập TRÚNG chuột – cộng điểm + kiểm tra debuff trigger
   * @param {Object}   typeData – Loại chuột bị đập
   * @returns {{ earned: number, shouldTriggerDebuff: boolean }}
   */
  onMoleHit(typeData) {
    this.player.registerHit();
    const earned = this.player.addScore(typeData.points);

    const shouldTriggerDebuff = this._checkDebuffTrigger();
    this._notifyListeners(earned);

    return { earned, shouldTriggerDebuff };
  }

  /**
   * Xử lý đập TRƯỢT (click lỗ trống)
   */
  onMiss() {
    this.player.registerMiss();
    this._notifyListeners(0);
  }

  /**
   * Kiểm tra xem có nên bật màn debuff không
   * Trigger mỗi `_debuffTriggerScore` điểm
   */
  _checkDebuffTrigger() {
    const score = this.player.getScore();
    const threshold = this._lastDebuffAt + this._debuffTriggerScore;
    if (score >= threshold) {
      this._lastDebuffAt = Math.floor(score / this._debuffTriggerScore) * this._debuffTriggerScore;
      return true;
    }
    return false;
  }

  /** Reset hệ thống điểm cho ván mới */
  reset() {
    this._lastDebuffAt = 0;
  }

  /** Đăng ký callback khi điểm thay đổi */
  onChange(cb) {
    this._listeners.push(cb);
  }

  _notifyListeners(earned) {
    this._listeners.forEach(cb => cb(this.player.getScore(), earned));
  }
}
