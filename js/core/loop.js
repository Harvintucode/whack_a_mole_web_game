// ==========================================================
// loop.js – Vòng lặp game (Game Loop)
// Dùng requestAnimationFrame để đếm ngược thời gian mượt mà
// ==========================================================

export class GameLoop {
  /**
   * @param {Function} onTick    – callback(deltaMs) mỗi frame
   * @param {Function} onSecond  – callback(timeLeft) mỗi giây
   * @param {Function} onEnd     – callback() khi hết thời gian
   * @param {number}   duration  – Thời gian game (giây)
   */
  constructor(onTick, onSecond, onEnd, duration) {
    this.onTick    = onTick;
    this.onSecond  = onSecond;
    this.onEnd     = onEnd;
    this.duration  = duration;

    this._running      = false;
    this._paused       = false;
    this._timeLeft     = duration;    // giây
    this._lastTime     = null;
    this._accumulator  = 0;           // ms tích lũy để đếm giây
    this._rafId        = null;
  }

  /** Bắt đầu vòng lặp */
  start() {
    this._running     = true;
    this._paused      = false;
    this._timeLeft    = this.duration;
    this._accumulator = 0;
    this._lastTime    = null;
    this._tick();
  }

  /** Tạm dừng (debuff pick hoặc pause) */
  pause() {
    this._paused  = true;
    this._lastTime = null; // Reset để tránh nhảy thời gian khi resume
  }

  /** Tiếp tục sau pause */
  resume() {
    if (!this._running) return;
    this._paused   = false;
    this._lastTime = null;
    this._tick();
  }

  /** Dừng hẳn */
  stop() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  getTimeLeft() { return Math.max(0, this._timeLeft); }

  isRunning()   { return this._running && !this._paused; }

  // --- Private ---

  _tick() {
    if (!this._running || this._paused) return;

    this._rafId = requestAnimationFrame((timestamp) => {
      if (!this._running || this._paused) return;

      // Tính delta time
      if (this._lastTime === null) this._lastTime = timestamp;
      const delta = Math.min(timestamp - this._lastTime, 100); // Cap ở 100ms để tránh lag spike
      this._lastTime = timestamp;

      // Đếm ngược thời gian
      this._accumulator += delta;
      this._timeLeft    -= delta / 1000;

      // Gọi onTick mỗi frame
      this.onTick(delta);

      // Gọi onSecond mỗi giây
      while (this._accumulator >= 1000) {
        this._accumulator -= 1000;
        const displayTime = Math.ceil(this._timeLeft);
        this.onSecond(displayTime);
      }

      // Hết giờ
      if (this._timeLeft <= 0) {
        this._timeLeft = 0;
        this._running  = false;
        this.onEnd();
        return;
      }

      this._tick();
    });
  }
}
