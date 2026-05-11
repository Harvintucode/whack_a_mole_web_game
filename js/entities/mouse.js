// ==========================================================
// mouse.js – Thực thể con chuột / cái lỗ
// Mỗi instance quản lý 1 lỗ (hole) và con chuột bên trong
// ==========================================================

import { MOLE_STATES, SETTINGS } from '../utils/constants.js';
import { addClass, removeClass, spawnScorePopup } from '../utils/helper.js';

export class Mole {
  /**
   * @param {HTMLElement} holeEl   – DOM element của cái lỗ (.hole)
   * @param {HTMLElement} moleEl   – DOM element của con chuột (.mole)
   * @param {number}      index    – Chỉ số trong bảng
   * @param {Object}      typeData – Dữ liệu loại chuột từ enemies.json
   */
  constructor(holeEl, moleEl, index, typeData) {
    this.holeEl = holeEl;
    this.moleEl = moleEl;
    this.index = index;
    this.typeData = typeData;

    this.state = MOLE_STATES.IDLE;
    this.hitsLeft = typeData.hitsRequired;
    this.isBlinded = false; // Debuff che khuất lỗ
    this.isTiny = false; // Debuff thu nhỏ

    this._upTimer = null;
    this._warningTimer = null;
    this._onEscape = null; // Callback khi chuột thoát
    this._onHit = null; // Callback khi chuột bị đập
  }

  // --- Public API ---

  /**
   * Cho chuột trồi lên
   * @param {number}   duration   – ms – Thời gian chuột ở trên
   * @param {Function} onEscape   – Callback khi chuột thoát (hết thời gian)
   * @param {Function} onHit      – Callback(points) khi chuột bị đập
   */
  popup(duration, onEscape, onHit) {
    if (this.state !== MOLE_STATES.IDLE) return;

    this._onEscape = onEscape;
    this._onHit = onHit;
    this.hitsLeft = this.typeData.hitsRequired;

    this._setState(MOLE_STATES.UP);
    this.moleEl.src = `assets/${this.typeData.img}`;
    addClass(this.moleEl, 'up');

    // Cảnh báo trước khi biến mất
    const warningAt = duration - SETTINGS.WARNING_THRESHOLD;
    if (warningAt > 0) {
      this._warningTimer = setTimeout(() => this._setWarning(), warningAt);
    }

    // Chuột tự rút xuống sau `duration` ms
    this._upTimer = setTimeout(() => this._escape(), duration);
  }

  /**
   * Xử lý khi người chơi click vào chuột
   * @returns {number|null} Điểm nhận được hoặc null nếu không hợp lệ
   */
  handleClick() {
    if (this.state !== MOLE_STATES.UP && this.state !== MOLE_STATES.WARNING) {
      return null; // Click trúng lỗ trống hoặc chuột đang ẩn
    }

    this.hitsLeft--;

    if (this.hitsLeft > 0) {
      // Chuột cứng đầu – cần đập thêm
      this._showHitEffect();
      return null; // Chưa xong, không tính điểm
    }

    // Đập đủ số lần → xử lý hoàn thành
    this._clearTimers();
    this._setState(MOLE_STATES.HIT);
    if (this.typeData.hitImg) {
      this.moleEl.src = `assets/${this.typeData.hitImg}`;
    }
    addClass(this.moleEl, 'hit');
    removeClass(this.moleEl, 'warning');

    const points = this.typeData.points;
    spawnScorePopup(this.holeEl, points);

    // Rút xuống sau hiệu ứng hit
    setTimeout(() => this._hide(), SETTINGS.HIT_FREEZE_MS);

    if (this._onHit) this._onHit(points, this.typeData);
    return points;
  }

  /** Ép chuột rút xuống ngay (reset) */
  forceHide() {
    this._clearTimers();
    this._hide();
  }

  /** Kiểm tra lỗ đang có chuột nhô lên */
  isActive() {
    return this.state === MOLE_STATES.UP || this.state === MOLE_STATES.WARNING;
  }

  /** Áp dụng debuff che tối lỗ */
  setBlinded(blinded) {
    this.isBlinded = blinded;
    if (blinded) addClass(this.holeEl, 'blinded');
    else removeClass(this.holeEl, 'blinded');
  }

  /** Áp dụng debuff thu nhỏ lỗ */
  setTiny(tiny) {
    this.isTiny = tiny;
    if (tiny) addClass(this.holeEl, 'tiny');
    else removeClass(this.holeEl, 'tiny');
  }

  // --- Private ---

  _setState(state) {
    this.state = state;
  }

  _setWarning() {
    if (this.state !== MOLE_STATES.UP) return;
    this._setState(MOLE_STATES.WARNING);
    addClass(this.moleEl, 'warning');
  }

  /** Chuột thoát – mất mạng */
  _escape() {
    if (this.state === MOLE_STATES.IDLE || this.state === MOLE_STATES.HIT) return;
    this._clearTimers();
    this._hide();
    if (this._onEscape) this._onEscape(this.typeData);
  }

  /** Hiệu ứng rung khi đập không đủ */
  _showHitEffect() {
    addClass(this.moleEl, 'hit');
    setTimeout(() => removeClass(this.moleEl, 'hit'), 150);
  }

  /** Ẩn chuột xuống lỗ */
  _hide() {
    removeClass(this.moleEl, 'up');
    removeClass(this.moleEl, 'warning');
    removeClass(this.moleEl, 'hit');
    this._setState(MOLE_STATES.IDLE);
    this.hitsLeft = this.typeData.hitsRequired;
    this.moleEl.src = `assets/${this.typeData.img}`;
  }

  /** Xoá tất cả timeout đang chạy */
  _clearTimers() {
    if (this._upTimer) { clearTimeout(this._upTimer); this._upTimer = null; }
    if (this._warningTimer) { clearTimeout(this._warningTimer); this._warningTimer = null; }
  }
}
