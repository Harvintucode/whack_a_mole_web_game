// ==========================================================
// constants.js – Tất cả hằng số dùng chung trong game
// ==========================================================

// Trạng thái của game (state machine)
export const GAME_STATES = {
  MENU:        'MENU',
  PLAYING:     'PLAYING',
  DEBUFF_PICK: 'DEBUFF_PICK',
  GAME_OVER:   'GAME_OVER',
  PAUSED:      'PAUSED',
};

// Trạng thái từng con chuột
export const MOLE_STATES = {
  IDLE:    'idle',    // Đang ẩn dưới lỗ
  RISING:  'rising',  // Đang trồi lên
  UP:      'up',      // Đang nhô lên (có thể đập)
  WARNING: 'warning', // Sắp biến mất (0.5s cuối)
  HIT:     'hit',     // Vừa bị đập
  HIDING:  'hiding',  // Đang rút xuống
};

// Danh sách các Debuff (thử thách) trong game
export const DEBUFFS = [
  {
    id:        'faster_moles',
    name:      '⚡ Tốc Độ Ánh Sáng',
    desc:      'Chuột trồi lên và trốn nhanh hơn 30%',
    bonus:     '+15 điểm',
    effect:    'FASTER_MOLES',
    bonusScore: 15,
    bonusLife:  0,
  },
  {
    id:        'shorter_appear',
    name:      '⏰ Đua Với Thời Gian',
    desc:      'Thời gian chuột ở trên mặt đất giảm 25%',
    bonus:     '+20 điểm',
    effect:    'SHORTER_APPEAR',
    bonusScore: 20,
    bonusLife:  0,
  },
  {
    id:        'more_moles',
    name:      '🐀 Bầy Chuột Hung Hãn',
    desc:      'Thêm 1 con chuột xuất hiện cùng lúc',
    bonus:     '+10 điểm & +1 ❤️',
    effect:    'MORE_MOLES',
    bonusScore: 10,
    bonusLife:  1,
  },
  {
    id:        'more_bombs',
    name:      '💣 Bãi Mìn',
    desc:      'Bom xuất hiện nhiều hơn đáng kể',
    bonus:     '+25 điểm',
    effect:    'MORE_BOMBS',
    bonusScore: 25,
    bonusLife:  0,
  },
  {
    id:        'blind_holes',
    name:      '🌑 Màn Đêm Bí Ẩn',
    desc:      'Ngẫu nhiên 3 lỗ bị che khuất tối',
    bonus:     '+2 ❤️',
    effect:    'BLIND_HOLES',
    bonusScore: 0,
    bonusLife:  2,
  },
  {
    id:        'tiny_holes',
    name:      '🔬 Teo Tóp',
    desc:      'Các lỗ thu nhỏ lại 20% (khó đập hơn)',
    bonus:     '+30 điểm',
    effect:    'TINY_HOLES',
    bonusScore: 30,
    bonusLife:  0,
  },
];

// Cài đặt chung
export const SETTINGS = {
  INITIAL_LIVES:     3,          // Số mạng bắt đầu
  WARNING_THRESHOLD: 500,        // ms – Thời gian còn lại để bật warning
  HIT_FREEZE_MS:     300,        // ms – Thời gian đứng im khi bị đập
  SCORE_POPUP_MS:    800,        // ms – Thời gian hiển thị popup điểm
  MAX_LIVES:         5,          // Mạng tối đa có thể có
  AUDIO_ENABLED:     true,
};
