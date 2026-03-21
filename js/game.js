// game.js - 游戏核心逻辑（多模式支持）

class Game {
    constructor() {
        this.score = 0;
        this.progress = this.loadProgress();
    }

    // 添加分数
    addScore(points) {
        this.score += points;
        this.updateUI();
        
        // 保存进度
        this.progress.totalStars = (this.progress.totalStars || 0) + Math.floor(points / 10);
        this.progress.gamesPlayed = (this.progress.gamesPlayed || 0) + 1;
        this.saveProgress();
    }

    // 更新 UI
    updateUI() {
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }
    }

    // 显示消息
    showMessage(title, content, btnText, callback) {
        const messageEl = document.getElementById('message');
        const titleEl = document.getElementById('message-title');
        const contentEl = document.getElementById('message-content');
        const primaryBtn = document.getElementById('message-btn-primary');
        const secondaryBtn = document.getElementById('message-btn-secondary');

        if (titleEl) titleEl.textContent = title;
        if (contentEl) contentEl.textContent = content;
        if (primaryBtn) primaryBtn.textContent = btnText;
        
        // 隐藏次要按钮
        if (secondaryBtn) secondaryBtn.style.display = 'none';

        messageEl.style.display = 'block';

        // 移除旧的事件监听器
        const newBtn = primaryBtn.cloneNode(true);
        primaryBtn.parentNode.replaceChild(newBtn, primaryBtn);

        // 添加新的事件监听器
        newBtn.addEventListener('click', () => {
            messageEl.style.display = 'none';
            if (callback) callback();
        });
    }

    // 返回菜单
    returnToMenu() {
        if (window.returnToMenu) {
            window.returnToMenu();
        }
    }

    // 加载进度
    loadProgress() {
        try {
            const saved = localStorage.getItem('solidGameProgress');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load progress:', e);
        }
        return {
            totalStars: 0,
            totalGems: 0,
            level: 1,
            gamesPlayed: 0,
            modeProgress: {}
        };
    }

    // 保存进度
    saveProgress() {
        try {
            // 计算等级
            this.progress.level = Math.floor(this.progress.totalStars / 10) + 1;
            this.progress.totalGems = Math.floor(this.progress.totalStars / 3);
            
            localStorage.setItem('solidGameProgress', JSON.stringify(this.progress));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }

    // 获取进度
    getProgress() {
        return this.progress;
    }

    // 设置最后玩的模式
    setLastPlayedMode(modeName) {
        this.progress.lastMode = modeName;
        this.saveProgress();
    }

    // 获取最后玩的模式
    getLastPlayedMode() {
        return this.progress.lastMode;
    }

    // 重置进度
    resetProgress() {
        this.progress = {
            totalStars: 0,
            totalGems: 0,
            level: 1,
            gamesPlayed: 0,
            modeProgress: {}
        };
        this.score = 0;
        this.saveProgress();
        this.updateUI();
    }

    // 获取场景（供模式使用）
    get scene() {
        return window.gameDebug ? window.gameDebug.scene() : null;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
