// game.js - 游戏逻辑

class Game {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.currentTarget = null;
        this.selectedShape = null;
        this.shapes = [];
        this.isAnimating = false;
        
        // 关卡配置
        this.levelConfigs = [
            { target: 'cube', options: ['cube', 'sphere', 'cylinder'], count: 3 },
            { target: 'sphere', options: ['sphere', 'cube', 'cone'], count: 3 },
            { target: 'cylinder', options: ['cylinder', 'cube', 'sphere', 'cone'], count: 4 },
            { target: 'cone', options: ['cone', 'cylinder', 'pyramid', 'cube'], count: 4 },
            { target: 'torus', options: ['torus', 'sphere', 'cube', 'cylinder', 'cone'], count: 5 },
            { target: 'pyramid', options: ['pyramid', 'cone', 'cube', 'cylinder', 'sphere'], count: 5 },
            { target: 'random', options: 'all', count: 6 } // 随机挑战关
        ];
    }

    // 初始化关卡
    initLevel(levelNum) {
        this.level = levelNum;
        const config = this.getLevelConfig(levelNum);
        
        // 设置目标几何体
        if (config.target === 'random') {
            const allShapes = Shapes.getAllShapes();
            const randomShape = allShapes[Math.floor(Math.random() * allShapes.length)];
            this.currentTarget = randomShape.type;
        } else {
            this.currentTarget = config.target;
        }

        // 设置选项
        let options;
        if (config.options === 'all') {
            options = Shapes.getAllShapes().map(s => s.type);
        } else {
            options = config.options;
        }

        // 打乱选项顺序
        options = this.shuffleArray([...options]);

        return {
            target: this.currentTarget,
            options: options,
            count: config.count
        };
    }

    // 获取关卡配置
    getLevelConfig(levelNum) {
        if (levelNum <= this.levelConfigs.length) {
            return this.levelConfigs[levelNum - 1];
        }
        // 超过预设关卡后，随机生成
        return {
            target: 'random',
            options: 'all',
            count: 6
        };
    }

    // 选择几何体
    selectShape(shapeType) {
        this.selectedShape = shapeType;
        return shapeType;
    }

    // 检查答案
    checkAnswer(selectedType) {
        if (selectedType === this.currentTarget) {
            // 答对了
            this.score += 10 * this.level; // 关卡越后分数越高
            this.updateUI();
            return { correct: true, score: this.score };
        } else {
            // 答错了
            return { correct: false, score: this.score };
        }
    }

    // 下一关
    nextLevel() {
        this.level++;
        return this.initLevel(this.level);
    }

    // 更新 UI
    updateUI() {
        const levelEl = document.getElementById('level');
        const scoreEl = document.getElementById('score');
        
        if (levelEl) levelEl.textContent = this.level;
        if (scoreEl) scoreEl.textContent = this.score;
    }

    // 更新进度条
    updateProgress(current, total) {
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const percentage = (current / total) * 100;
            progressFill.style.width = percentage + '%';
        }
    }

    // 显示消息
    showMessage(title, content, btnText, callback) {
        const messageEl = document.getElementById('message');
        const titleEl = document.getElementById('message-title');
        const contentEl = document.getElementById('message-content');
        const btnEl = document.getElementById('message-btn');

        if (titleEl) titleEl.textContent = title;
        if (contentEl) contentEl.textContent = content;
        if (btnEl) btnEl.textContent = btnText;

        messageEl.style.display = 'block';

        // 移除旧的监听器
        const newBtn = btnEl.cloneNode(true);
        btnEl.parentNode.replaceChild(newBtn, btnEl);

        // 添加新的监听器
        newBtn.addEventListener('click', () => {
            messageEl.style.display = 'none';
            if (callback) callback();
        });
    }

    // 显示成功动画
    showSuccess(element) {
        element.classList.add('success');
        setTimeout(() => {
            element.classList.remove('success');
        }, 600);
    }

    // 数组乱序（Fisher-Yates 洗牌算法）
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 获取当前分数
    getScore() {
        return this.score;
    }

    // 获取当前关卡
    getLevel() {
        return this.level;
    }

    // 重置游戏
    reset() {
        this.level = 1;
        this.score = 0;
        this.currentTarget = null;
        this.selectedShape = null;
        this.updateUI();
    }
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
