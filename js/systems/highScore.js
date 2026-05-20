// ==========================================================
// highScore.js – Lưu và đọc điểm cao nhất theo từng map
// Dùng localStorage, key: "hs_{mapId}"
// ==========================================================

const PREFIX = 'hs_';

export class HighScoreSystem {

    /**
     * Lấy điểm cao nhất của 1 map.
     * @param {string} mapId – 'map1' | 'map2' | 'map3'
     * @returns {number} 0 nếu chưa có
     */
    get(mapId) {
        const raw = localStorage.getItem(PREFIX + mapId);
        return raw ? parseInt(raw, 10) : 0;
    }

    /**
     * Lưu điểm nếu cao hơn kỷ lục hiện tại.
     * @param {string} mapId
     * @param {number} score
     * @returns {boolean} true nếu kỷ lục mới được lập
     */
    submit(mapId, score) {
        const current = this.get(mapId);
        if (score > current) {
            localStorage.setItem(PREFIX + mapId, score);
            return true; // kỷ lục mới!
        }
        return false;
    }

    /**
     * Trả về object chứa điểm cả 3 map.
     * @returns {{ map1: number, map2: number, map3: number }}
     */
    getAll() {
        return {
            map1: this.get('map1'),
            map2: this.get('map2'),
            map3: this.get('map3'),
        };
    }

    /**
     * Xoá kỷ lục 1 map (dùng cho debug/reset).
     * @param {string} mapId
     */
    clear(mapId) {
        localStorage.removeItem(PREFIX + mapId);
    }
}
