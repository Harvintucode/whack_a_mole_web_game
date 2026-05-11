// ==========================================================
// main.js – Điểm khởi đầu của game
// Chỉ làm 1 việc: tạo Game instance và gọi init()
// ==========================================================

import { Game } from './core/game.js';

// Chờ DOM load xong rồi mới khởi động game
window.addEventListener('DOMContentLoaded', async () => {
    const game = new Game();

    try {
        await game.init();
        console.log('🎮 Game đập chuột đã sẵn sàng!');
    } catch (err) {
        console.error('❌ Lỗi khởi động game:', err);
    }

    // Expose ra window để debug (có thể xoá khi release)
    window._game = game;
});