// ==========================================================
// input.js – Xử lý input (click, touch, keyboard)
// Tập trung tất cả event listener vào đây
// ==========================================================

export class InputHandler {
  constructor() {
    this._handlers = {}; // { eventName: [callbacks] }
    this._bound    = []; // { target, type, fn } – để dễ cleanup
  }

  /**
   * Đăng ký callback cho một sự kiện tùy chỉnh
   * @param {string}   event – Tên sự kiện: 'mole_click', 'map_select', v.v.
   * @param {Function} cb
   */
  on(event, cb) {
    if (!this._handlers[event]) this._handlers[event] = [];
    this._handlers[event].push(cb);
  }

  /** Gọi tất cả callback của event */
  emit(event, data) {
    (this._handlers[event] || []).forEach(cb => cb(data));
  }

  /** Lắng nghe DOM event và auto-cleanup khi destroy() */
  listen(target, type, fn, options) {
    target.addEventListener(type, fn, options);
    this._bound.push({ target, type, fn, options });
  }

  /**
   * Thiết lập listener cho các nút menu
   * Gọi 1 lần khi khởi động
   */
  setupMenuListeners() {
    const buttons = [
      { id: 'btn-map1', event: 'map_select', data: 'map1' },
      { id: 'btn-map2', event: 'map_select', data: 'map2' },
      { id: 'btn-map3', event: 'map_select', data: 'map3' },
      { id: 'btn-restart', event: 'restart',  data: null },
      { id: 'btn-menu',    event: 'go_menu',  data: null },
    ];

    buttons.forEach(({ id, event, data }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const fn = () => this.emit(event, data);
      this.listen(el, 'click', fn);
    });
  }

  /**
   * Thiết lập listener cho các thẻ debuff
   * Gọi mỗi khi bảng debuff xuất hiện
   * @param {NodeList|Array} cardEls
   * @param {Function}       onPick – callback(debuffObj)
   */
  setupDebuffListeners(cardEls, onPick) {
    cardEls.forEach(el => {
      const fn = () => {
        const debuffId = el.dataset.debuffId;
        onPick(debuffId);
      };
      this.listen(el, 'click', fn);
    });
  }

  /** Xoá TẤT CẢ event listener đã đăng ký */
  destroy() {
    this._bound.forEach(({ target, type, fn, options }) => {
      target.removeEventListener(type, fn, options);
    });
    this._bound    = [];
    this._handlers = {};
  }
}
