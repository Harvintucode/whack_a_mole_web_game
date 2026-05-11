// ==========================================================
// menu.js – Điều khiển màn hình Menu
// ==========================================================

import { show, hide, $ } from '../utils/helper.js';

export class MenuUI {
  constructor() {
    this.screenEl = $('start-screen');
  }

  /** Hiển thị màn hình menu */
  show() {
    document.body.className = 'menu-bg';
    show(this.screenEl);
  }

  /** Ẩn màn hình menu */
  hide() {
    hide(this.screenEl);
  }
}
