// ==========================================================
// audioSystem.js – Quản lý nhạc nền
// Nhạc tự restart mỗi khi gọi play() → đúng yêu cầu "đổi trang phát lại"
// ==========================================================

export class AudioSystem {
    /**
     * @param {string} elementId – id của <audio> trong HTML, mặc định 'bg-music'
     */
    constructor(elementId = 'bg-music') {
        this._el = document.getElementById(elementId);
        this._muted = false;

        if (!this._el) {
            console.warn('[AudioSystem] Không tìm thấy element:', elementId);
        }
    }

    /**
     * Phát nhạc từ đầu.
     * Gọi khi chuyển sang bất kỳ màn hình nào.
     * @param {number} volume – 0.0 → 1.0, mặc định 0.4
     */
    play(volume = 0.4) {
        if (!this._el || this._muted) return;
        this._el.volume = volume;
        this._el.currentTime = 0;   // ← restart từ đầu mỗi lần
        this._el.play().catch(() => {
            // Trình duyệt chặn autoplay nếu chưa có tương tác → bỏ qua lỗi này,
            // sẽ tự phát sau khi user click lần đầu (xem _setupAutoplayFallback)
        });
        this._setupAutoplayFallback();
    }

    /** Dừng nhạc. */
    stop() {
        if (!this._el) return;
        this._el.pause();
        this._el.currentTime = 0;
    }

    /** Tạm dừng (ví dụ: khi hiện modal debuff). */
    pause() {
        if (!this._el) return;
        this._el.pause();
    }

    /** Tiếp tục sau khi pause. */
    resume() {
        if (!this._el || this._muted) return;
        this._el.play().catch(() => { });
    }

    /** Bật/tắt tiếng. */
    toggleMute() {
        if (!this._el) return;
        this._muted = !this._muted;
        this._el.muted = this._muted;
        return this._muted;
    }

    isMuted() { return this._muted; }

    // --- Private ---

    // Trình duyệt yêu cầu user phải tương tác trước khi cho phép autoplay.
    // Nếu play() bị block, gắn listener 1 lần vào document để thử lại khi có click.
    _setupAutoplayFallback() {
        if (this._fallbackReady) return;
        this._fallbackReady = true;

        const tryPlay = () => {
            if (this._el && !this._muted && this._el.paused) {
                this._el.play().catch(() => { });
            }
            document.removeEventListener('click', tryPlay);
            document.removeEventListener('keydown', tryPlay);
        };

        document.addEventListener('click', tryPlay, { once: true });
        document.addEventListener('keydown', tryPlay, { once: true });
    }
}
