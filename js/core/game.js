// ==========================================================
// game.js – Bộ điều khiển game chính (State Machine)
// Phối hợp tất cả systems, entities và UI lại với nhau
// ==========================================================

import { GAME_STATES, DEBUFFS, SETTINGS } from '../utils/constants.js';
import { $, show, hide, setText, shuffle }  from '../utils/helper.js';
import { shuffle as shuffleArr }             from '../utils/math.js';

import { Player }        from '../entities/player.js';
import { ScoreSystem }   from '../systems/scoreSystem.js';
import { HealthSystem }  from '../systems/healthSystem.js';
import { SpawnSystem }   from '../systems/spawnSystem.js';
import { LevelSystem }   from '../systems/levelSystem.js';
import { GameLoop }      from './loop.js';
import { InputHandler }  from './input.js';
import { spawnHitEffect } from '../entities/bullet.js';

import { HUD }          from '../ui/hud.js';
import { MenuUI }       from '../ui/menu.js';
import { GameOverUI }   from '../ui/gameOver.js';

export class Game {
  constructor() {
    // Core state
    this.state       = GAME_STATES.MENU;
    this.currentMap  = null;

    // Entities
    this.player      = new Player(SETTINGS.INITIAL_LIVES);

    // Systems (khởi tạo sau khi load data)
    this.levelSystem  = new LevelSystem();
    this.scoreSystem  = null;
    this.healthSystem = null;
    this.spawnSystem  = null;
    this.gameLoop     = null;

    // Core
    this.input        = new InputHandler();

    // UI
    this.hud          = new HUD();
    this.menuUI       = new MenuUI();
    this.gameOverUI   = new GameOverUI();

    // Debuff state
    this._activeDebuffs = [];
    this._pendingDebuff = false;
  }

  // ==========================================================
  // KHỞI ĐỘNG
  // ==========================================================

  async init() {
    // Nạp dữ liệu JSON
    await this.levelSystem.loadData();

    // Gắn listener cho menu buttons
    this.input.setupMenuListeners();
    this.input.on('map_select', (mapId) => this.startGame(mapId));
    this.input.on('restart',   ()       => this.restartGame());
    this.input.on('go_menu',   ()       => this.goToMenu());

    // Hiển thị menu
    this.goToMenu();
  }

  // ==========================================================
  // ĐIỀU HƯỚNG MÀN HÌNH
  // ==========================================================

  goToMenu() {
    this._setState(GAME_STATES.MENU);
    this._stopAll();

    this.gameOverUI.hide();
    this.hud.hide();
    hide($('game-screen'));
    hide($('debuff-modal'));
    this.menuUI.show();
  }

  // ==========================================================
  // BẮT ĐẦU GAME
  // ==========================================================

  async startGame(mapId) {
    this.currentMap = mapId;
    const levelConfig = this.levelSystem.getLevelConfig(mapId);
    if (!levelConfig) { console.error('Level không tồn tại:', mapId); return; }

    // Đặt lại trạng thái
    this.player.reset();
    this._activeDebuffs = [];
    this._pendingDebuff = false;

    // Ẩn menu, hiện game
    this.menuUI.hide();
    this.gameOverUI.hide();
    show($('game-screen'));

    // Xây bảng game
    const boardEl = $('game-board');
    const moles   = this.levelSystem.buildBoard(boardEl, levelConfig);
    const moleTypes = this.levelSystem.getMoleTypes();

    // Khởi tạo hệ thống điểm
    this.scoreSystem = new ScoreSystem(this.player);
    this.scoreSystem.configure(levelConfig);
    this.scoreSystem.onChange((score) => this.hud.updateScore(score));

    // Khởi tạo hệ thống máu
    this.healthSystem = new HealthSystem(
      this.player,
      (reason) => this._onGameOver(reason),
      (lives)  => this.hud.updateLives(lives),
    );

    // Khởi tạo hệ thống spawn
    this.spawnSystem = new SpawnSystem(
      moles,
      moleTypes,
      levelConfig,
      (typeData)       => this._onMoleEscape(typeData),
      (points, typeData) => this._onMoleHit(points, typeData),
    );

    // Gắn click listener vào từng lỗ
    this.levelSystem.attachClickListeners((mole, event) => {
      this._handleMoleClick(mole, event);
    });

    // Khởi tạo HUD
    this.hud.setMaxLives(SETTINGS.INITIAL_LIVES);
    this.hud.reset(levelConfig.duration, this.player.lives);
    this.hud.show();

    // Đặt background game
    document.body.className = levelConfig.bgClass;

    // Khởi tạo game loop đếm ngược
    this.gameLoop = new GameLoop(
      (delta)   => { /* Tick hàng frame nếu cần animation logic */ },
      (timeLeft) => this.hud.updateTime(timeLeft),
      ()         => this._onTimeUp(),
      levelConfig.duration,
    );

    // Chuyển state và bắt đầu!
    this._setState(GAME_STATES.PLAYING);
    this.spawnSystem.start();
    this.gameLoop.start();
  }

  // ==========================================================
  // GAMEPLAY HANDLERS
  // ==========================================================

  _handleMoleClick(mole, event) {
    if (this.state !== GAME_STATES.PLAYING) return;

    // Chuột đang nhô lên → xử lý đập
    if (mole.isActive()) {
      const points = mole.handleClick();

      if (points !== null) {
        // Đập trúng thành công
        spawnHitEffect(mole.holeEl, event, mole.typeData);

        if (mole.typeData.isBad) {
          // Đập phải bom → mất mạng
          this.healthSystem.onBombHit(mole.typeData);
        } else {
          // Đập trúng chuột thường
          const { shouldTriggerDebuff } = this.scoreSystem.onMoleHit(mole.typeData);
          if (shouldTriggerDebuff && !this._pendingDebuff) {
            this._pendingDebuff = true;
            setTimeout(() => this._showDebuffPicker(), 300);
          }
        }
      }
    } else {
      // Click lỗ trống → miss
      this.scoreSystem.onMiss();
    }
  }

  _onMoleEscape(typeData) {
    if (this.state !== GAME_STATES.PLAYING) return;
    this.healthSystem.onMoleEscape(typeData);
  }

  _onMoleHit(points, typeData) {
    // Được gọi từ SpawnSystem khi mole báo hit (không dùng ở đây vì đã xử lý trong handleClick)
  }

  // ==========================================================
  // DEBUFF SYSTEM
  // ==========================================================

  _showDebuffPicker() {
    if (this.state !== GAME_STATES.PLAYING) return;

    this._setState(GAME_STATES.DEBUFF_PICK);
    this.spawnSystem.pause();
    this.gameLoop.pause();

    // Chọn 3 debuff ngẫu nhiên
    const picks = shuffleArr(DEBUFFS).slice(0, 3);
    this._renderDebuffCards(picks);
    show($('debuff-modal'));
  }

  _renderDebuffCards(debuffs) {
    const container = $('debuff-cards');
    if (!container) return;
    container.innerHTML = '';

    debuffs.forEach(debuff => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.debuffId = debuff.id;
      card.innerHTML = `
        <h3>${debuff.name}</h3>
        <p>${debuff.desc}</p>
        <span class="bonus">${debuff.bonus}</span>
      `;
      card.addEventListener('click', () => this._applyDebuff(debuff));
      container.appendChild(card);
    });
  }

  _applyDebuff(debuff) {
    hide($('debuff-modal'));
    this._activeDebuffs.push(debuff.id);
    this._pendingDebuff = false;

    // Cộng bonus điểm / mạng
    if (debuff.bonusScore > 0) {
      this.player.addScore(debuff.bonusScore);
      this.hud.updateScore(this.player.getScore());
    }
    if (debuff.bonusLife > 0) {
      this.healthSystem.addLives(debuff.bonusLife);
    }

    // Áp dụng effect lên spawn system
    this.spawnSystem.applyDebuff(debuff.effect);

    // Áp dụng visual effect lên level
    if (debuff.effect === 'BLIND_HOLES') {
      this.levelSystem.applyBlindHoles(3);
    } else if (debuff.effect === 'TINY_HOLES') {
      this.levelSystem.applyTinyHoles(true);
    }

    // Resume game
    this._setState(GAME_STATES.PLAYING);
    this.spawnSystem.resume();
    this.gameLoop.resume();
  }

  // ==========================================================
  // GAME OVER
  // ==========================================================

  _onTimeUp() {
    if (this.state === GAME_STATES.GAME_OVER) return;
    this._onGameOver('time_up');
  }

  _onGameOver(reason) {
    if (this.state === GAME_STATES.GAME_OVER) return;
    this._setState(GAME_STATES.GAME_OVER);
    this._stopAll();

    hide($('game-screen'));
    this.hud.hide();
    hide($('debuff-modal'));

    const summary = this.player.getSummary();
    this.gameOverUI.show(summary, reason);
  }

  restartGame() {
    this.gameOverUI.hide();
    if (this.currentMap) this.startGame(this.currentMap);
  }

  // ==========================================================
  // HELPERS
  // ==========================================================

  _setState(newState) {
    this.state = newState;
  }

  /** Dừng tất cả systems */
  _stopAll() {
    this.spawnSystem?.stop();
    this.gameLoop?.stop();
    this.levelSystem?.resetBoard();
  }
}
