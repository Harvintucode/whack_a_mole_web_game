// ==========================================================
// levelSystem.js – Hệ thống màn chơi
// Xây dựng bảng game, nạp config level, áp dụng debuff visual
// ==========================================================

import { Mole } from '../entities/mouse.js';
import { sampleN } from '../utils/math.js';
import { createElement, addClass, removeClass } from '../utils/helper.js';

export class LevelSystem {
  constructor() {
    this.levelsData = null; // Dữ liệu từ levels.json
    this.enemiesData = null; // Dữ liệu từ enemies.json
    this.currentLevel = null;
    this.moles = [];  // Mảng Mole instances
  }

  /** Nạp dữ liệu JSON cho level và enemy */
  async loadData() {
    const [lvRes, enRes] = await Promise.all([
      fetch('js/data/levels.json'),
      fetch('js/data/enemies.json'),
    ]);
    const lvData = await lvRes.json();
    const enData = await enRes.json();
    this.levelsData = lvData.levels;
    this.enemiesData = enData.mole_types;
  }

  /** Trả về config của level theo id */
  getLevelConfig(levelId) {
    return this.levelsData?.find(l => l.id === levelId) || this.levelsData?.[0];
  }

  /** Trả về toàn bộ danh sách mole type data */
  getMoleTypes() {
    return this.enemiesData || [];
  }

  /**
   * Xây dựng bảng game DOM + khởi tạo mảng Mole
   * @param {HTMLElement} boardEl   – Element #game-board
   * @param {Object}      levelConfig
   * @returns {Mole[]}
   */
  buildBoard(boardEl, levelConfig) {
    // Xoá bảng cũ
    boardEl.innerHTML = '';
    boardEl.className = 'game-board';
    this.moles = [];

    const { cols, rows, id } = levelConfig;
    const total = cols * rows;

    // Thêm class map đặc biệt (map3 → 5x5 layout)
    if (id === 'map3') addClass(boardEl, 'map3');

    // Tạo `total` lỗ chuột
    for (let i = 0; i < total; i++) {
      const holeEl = createElement('div', ['hole']);
      const moleEl = createElement('img', ['mole']);
      moleEl.src = 'assets/hamster_normal.png';
      moleEl.alt = 'Chuột';
      holeEl.appendChild(moleEl);
      boardEl.appendChild(holeEl);

      // Dùng loại mặc định "normal" làm placeholder
      const defaultType = this.enemiesData?.find(t => t.id === 'normal') || {
        id: 'normal', hitsRequired: 1, points: 10, upDuration: 1500, img: 'hamster_normal.png',
        hitImg: 'hamster_normal_hit.png',
      };
      this.moles.push(new Mole(holeEl, moleEl, i, defaultType));
    }

    this.currentLevel = levelConfig;
    return this.moles;
  }

  /**
   * Gắn event listener click lên từng lỗ
   * @param {Function} onClick – callback(mole, event)
   */
  attachClickListeners(onClick) {
    this.moles.forEach(mole => {
      mole.holeEl.addEventListener('click', (e) => onClick(mole, e));
      mole.holeEl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        onClick(mole, e);
      }, { passive: false });
    });
  }

  // --- Debuff Visual Effects ---

  /** DEBUFF: Che tối ngẫu nhiên n lỗ */
  applyBlindHoles(n = 3) {
    // Bỏ blind cũ trước
    this.moles.forEach(m => m.setBlinded(false));
    const targets = sampleN(this.moles, n);
    targets.forEach(m => m.setBlinded(true));
  }

  /** DEBUFF: Thu nhỏ tất cả lỗ 20% */
  applyTinyHoles(active = true) {
    this.moles.forEach(m => m.setTiny(active));
  }

  /** Xoá tất cả debuff visual */
  clearDebuffVisuals() {
    this.moles.forEach(m => {
      m.setBlinded(false);
      m.setTiny(false);
    });
  }

  /** Reset bảng (ẩn tất cả chuột) */
  resetBoard() {
    this.moles.forEach(m => m.forceHide());
    this.clearDebuffVisuals();
  }
}
