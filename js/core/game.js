// ==========================================================
// game.js – Bộ điều khiển game chính (State Machine)
// Phối hợp tất cả systems, entities và UI lại với nhau
// ==========================================================

import { GAME_STATES, DEBUFFS, SETTINGS } from '../utils/constants.js';
import { $, show, hide, setText } from '../utils/helper.js';
import { shuffle as shuffleArr } from '../utils/math.js';  // BUG FIX #5: bỏ import shuffle thừa từ helper

import { Player } from '../entities/player.js';
import { ScoreSystem } from '../systems/scoreSystem.js';
import { HealthSystem } from '../systems/healthSystem.js';
import { SpawnSystem } from '../systems/spawnSystem.js';
import { LevelSystem } from '../systems/levelSystem.js';
import { GameLoop } from './loop.js';
import { InputHandler } from './input.js';
import { spawnHitEffect } from '../entities/bullet.js';

import { HUD } from '../ui/hud.js';
import { MenuUI } from '../ui/menu.js';
import { GameOverUI } from '../ui/gameOver.js';

import { HighScoreSystem } from '../systems/highScore.js';   // ← THÊM
import { AudioSystem } from '../systems/audioSystem.js'; // ← THÊM
export class Game {
  constructor() {
    // Core state
    this.state = GAME_STATES.MENU;
    this.currentMap = null;

    // Entities
    this.player = new Player(SETTINGS.INITIAL_LIVES);

    // Systems (khởi tạo sau khi load data)
    this.levelSystem = new LevelSystem();
    this.scoreSystem = null;
    this.healthSystem = null;
    this.spawnSystem = null;
    this.gameLoop = null;

    // Core
    this.input = new InputHandler();

    // UI
    this.hud = new HUD();
    this.menuUI = new MenuUI();
    this.gameOverUI = new GameOverUI();

    // Debuff state
    this._activeDebuffs = [];
    this.highScore = new HighScoreSystem();  // ← THÊM
    this.audio = new AudioSystem();      // ← THÊM
  }

  // ==========================================================
  // KHỞI ĐỘNG
  // ==========================================================

  async init() {
    await this.levelSystem.loadData();

    this.input.setupMenuListeners();
    this.input.on('map_select', (mapId) => this.startGame(mapId));
    this.input.on('restart', () => this.restartGame());
    this.input.on('go_menu', () => this.goToMenu());

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
    this._renderHighScores();  // ← THÊM
    this.audio.play(0.35);
  }

  // ==========================================================
  // BẮT ĐẦU GAME
  // ==========================================================

  async startGame(mapId) {
    this.currentMap = mapId;
    const levelConfig = this.levelSystem.getLevelConfig(mapId);
    if (!levelConfig) { console.error('Level không tồn tại:', mapId); return; }

    // BUG FIX #6: tính mapIndex từ id string
    const mapIndex = this.levelSystem.levelsData.findIndex(l => l.id === mapId);

    // Đặt lại trạng thái
    this.player.reset();
    this._activeDebuffs = [];

    // Ẩn menu, hiện game
    this.menuUI.hide();
    this.gameOverUI.hide();
    show($('game-screen'));

    // Xây bảng game
    const boardEl = $('game-board');
    const moles = this.levelSystem.buildBoard(boardEl, levelConfig);
    const moleTypes = this.levelSystem.getMoleTypes();

    // Khởi tạo hệ thống điểm
    this.scoreSystem = new ScoreSystem(this.player);
    this.scoreSystem.onChange((score) => this.hud.updateScore(score));

    // Khởi tạo hệ thống máu
    this.healthSystem = new HealthSystem(
      this.player,
      (reason) => this._onGameOver(reason),
      (lives) => this.hud.updateLives(lives),
    );

    // BUG FIX #1: truyền đúng thứ tự tham số, thêm mapIndex và onDebuffReady
    this.spawnSystem = new SpawnSystem(
      moles,
      moleTypes,
      levelConfig,
      mapIndex,                                                    // ← mapIndex
      (typeData) => this._onMoleEscape(typeData),          // ← onEscape
      (points, typeData) => this._onMoleHit(points, typeData),     // ← onHit (không dùng cho score)
      () => this._showDebuffPicker(),              // ← onDebuffReady (BUG FIX #7)
    );

    // Gắn click listener
    this.levelSystem.attachClickListeners((mole, event) => {
      this._handleMoleClick(mole, event);
    });

    // Khởi tạo HUD
    this.hud.setMaxLives(SETTINGS.INITIAL_LIVES);
    this.hud.reset(levelConfig.duration, this.player.lives);
    this.hud.show();

    // Đặt background
    document.body.className = levelConfig.bgClass;

    // Khởi tạo game loop
    this.gameLoop = new GameLoop(
      (delta) => { /* Tick hàng frame */ },
      (timeLeft) => this.hud.updateTime(timeLeft),
      () => this._onTimeUp(),
      levelConfig.duration,
    );

    // Bắt đầu!
    this._setState(GAME_STATES.PLAYING);
    this.audio.play(0.3);
    this.spawnSystem.start();
    this.gameLoop.start();
  }

  // ==========================================================
  // GAMEPLAY HANDLERS
  // ==========================================================

  _handleMoleClick(mole, event) {
    if (this.state !== GAME_STATES.PLAYING) return;

    if (mole.isActive()) {
      const points = mole.handleClick();

      if (points !== null) {
        spawnHitEffect(mole.holeEl, event, mole.typeData);

        if (mole.typeData.isBad) {
          // Đập phải bom → mất mạng
          this.healthSystem.onBombHit(mole.typeData);
        } else {
          // BUG FIX #4: bỏ shouldTriggerDebuff cũ, dùng notifyScore để kích hoạt milestone
          // BUG FIX #3: áp dụng score multiplier từ SpawnSystem (buff x2)
          const multiplier = this.spawnSystem.getScoreMultiplier();
          this.scoreSystem.onMoleHit(mole.typeData, multiplier);

          // BUG FIX #2: gọi notifyScore để SpawnSystem kiểm tra milestone debuff
          this.spawnSystem.notifyScore(this.player.getScore());
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

  // Callback từ SpawnSystem khi mole bị đập (không xử lý score ở đây,
  // score được tính trong _handleMoleClick để đảm bảo single source of truth)
  _onMoleHit(points, typeData) { }

  // ==========================================================
  // DEBUFF SYSTEM
  // ==========================================================

  // BUG FIX #7: _showDebuffPicker bây giờ được gọi từ SpawnSystem.onDebuffReady
  // (sau khi đạt milestone VÀ wave đã trống), không dùng setTimeout nữa
  _showDebuffPicker() {
    if (this.state !== GAME_STATES.PLAYING) return;

    this._setState(GAME_STATES.DEBUFF_PICK);
    // spawnSystem.pause() đã được SpawnSystem tự gọi trước khi trigger callback
    this.gameLoop.pause();

    // Lọc TINY_HOLES nếu đã dùng rồi
    const available = DEBUFFS.filter(d => {
      if (d.effect === 'TINY_HOLES' && this.spawnSystem._tinyHolesUsed) return false;
      return true;
    });

    const picks = shuffleArr(available).slice(0, 3);
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

    // Cộng bonus điểm / mạng
    if (debuff.bonusScore > 0) {
      this.player.addScore(debuff.bonusScore);
      this.hud.updateScore(this.player.getScore());
    }
    if (debuff.bonusLife > 0) {
      this.healthSystem.addLives(debuff.bonusLife);
    }

    // Áp dụng effect spawn
    this.spawnSystem.applyDebuff(debuff.effect);

    // Áp dụng visual effect
    if (debuff.effect === 'BLIND_HOLES') {
      this.levelSystem.applyBlindHoles(3);
    } else if (debuff.effect === 'TINY_HOLES') {
      this.levelSystem.applyTinyHoles(true);
    }

    // Resume game — spawnSystem.resume() tự reset _pendingDebuff bên trong
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

    const finalScore = this.player.getScore();
    const isNew = this.highScore.submit(this.currentMap, finalScore);

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

  _stopAll() {
    this.spawnSystem?.stop();
    this.gameLoop?.stop();
    this.levelSystem?.resetBoard();
  }
  _renderHighScores() {
    // Cập nhật điểm
    const all = this.highScore.getAll();
    ['map1', 'map2', 'map3'].forEach(id => {
      const el = document.getElementById(`hs-${id}`);
      if (!el) return;
      el.textContent = all[id] > 0 ? all[id].toLocaleString() : '—';
    });

    // Khai báo trước, check sau — đúng thứ tự
    const btn = document.getElementById('btn-highscore');
    const overlay = document.getElementById('hs-overlay');
    const closeBtn = document.getElementById('btn-hs-close');

    if (!btn || !overlay || !closeBtn) return; // guard nếu DOM chưa có
    if (btn.dataset.bound) return;             // tránh gắn listener nhiều lần
    btn.dataset.bound = 'true';

    btn.addEventListener('click', e => {
      e.stopPropagation();
      overlay.classList.add('open');
    });

    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      overlay.classList.remove('open');
    });

    overlay.addEventListener('click', () => overlay.classList.remove('open'));

    document.getElementById('highscore-panel')
      .addEventListener('click', e => e.stopPropagation());
  }

}