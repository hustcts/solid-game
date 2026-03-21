// modes/view-match.js - 模式 1: 视图配对（三视图训练）

class ViewMatchMode {
    constructor(game) {
        this.game = game;
        this.name = 'view-match';
        this.displayName = '视图配对';
        this.currentLevel = 1;
        this.currentQuestion = null;
        this.streak = 0;
    }

    // 初始化模式
    init() {
        console.log('ViewMatchMode initialized');
        this.loadLevel(this.currentLevel);
    }

    // 加载关卡
    loadLevel(level) {
        this.currentLevel = level;
        const question = this.generateQuestion(level);
        this.currentQuestion = question;
        
        // 更新 UI
        document.getElementById('current-mode-title').textContent = this.displayName;
        document.getElementById('level').textContent = level;
        document.getElementById('hint-text').textContent = '💡 观察 3D 几何体，选择正确的三视图';
        
        // 创建 3D 几何体
        this.create3DShape(question.shape);
        
        // 创建选项
        this.createOptions(question.options);
    }

    // 生成题目
    generateQuestion(level) {
        const shapes = ['cube', 'cylinder', 'cone', 'rectangular'];
        const shape = shapes[Math.min(level - 1, shapes.length - 1)];
        
        // 生成正确答案（三视图）
        const correctView = this.generateViews(shape);
        
        // 生成错误选项
        const options = [correctView];
        while (options.length < 4) {
            const wrongShape = shapes[Math.floor(Math.random() * shapes.length)];
            const wrongView = this.generateViews(wrongShape);
            // 确保不重复
            if (!options.some(opt => this.viewsEqual(opt, wrongView))) {
                options.push(wrongView);
            }
        }
        
        // 打乱选项
        this.shuffleArray(options);
        
        return {
            shape: shape,
            correctView: correctView,
            options: options
        };
    }

    // 生成三视图
    generateViews(shape) {
        // 简化版：用文字描述视图
        const viewTemplates = {
            'cube': {
                front: '□',  // 正方形
                top: '□',
                side: '□'
            },
            'cylinder': {
                front: '▭',  // 长方形
                top: '○',    // 圆形
                side: '▭'
            },
            'cone': {
                front: '△',  // 三角形
                top: '○',    // 圆形（带圆心点）
                side: '△'
            },
            'rectangular': {
                front: '▭',  // 长方形
                top: '▭',
                side: '▭'
            }
        };
        
        return viewTemplates[shape] || viewTemplates['cube'];
    }

    // 创建 3D 几何体
    create3DShape(shapeType) {
        // 清除之前的几何体
        if (this.shapeMesh) {
            this.game.scene.remove(this.shapeMesh);
            this.shapeMesh.geometry.dispose();
            this.shapeMesh.material.dispose();
        }
        
        // 创建新几何体
        const shapeData = Shapes.getAllShapes().find(s => s.type === shapeType) || 
                         { type: shapeType, name: shapeType, emoji: '📦', color: 0x667eea };
        
        this.shapeMesh = Shapes.createByType(shapeType, shapeData.color);
        this.shapeMesh.position.set(0, 0, 0);
        this.shapeMesh.scale.set(1.5, 1.5, 1.5);
        
        this.game.scene.add(this.shapeMesh);
    }

    // 创建选项
    createOptions(options) {
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        container.style.display = 'flex';
        
        // 隐藏 3D 选择区
        document.getElementById('selection-zone').classList.remove('active');
        
        options.forEach((view, index) => {
            const btn = document.createElement('div');
            btn.className = 'option-btn';
            btn.innerHTML = `
                <div style="font-size: 32px;">${view.front}${view.top}${view.side}</div>
                <div style="font-size: 12px;">选项${String.fromCharCode(65 + index)}</div>
            `;
            btn.addEventListener('click', () => this.selectOption(index, btn));
            container.appendChild(btn);
        });
    }

    // 选择选项
    selectOption(index, btnElement) {
        // 移除其他选项的选中状态
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        btnElement.classList.add('selected');
        
        // 检查答案
        setTimeout(() => {
            this.checkAnswer(index);
        }, 300);
    }

    // 检查答案
    checkAnswer(selectedIndex) {
        const selectedView = this.currentQuestion.options[selectedIndex];
        const isCorrect = this.viewsEqual(selectedView, this.currentQuestion.correctView);
        
        if (isCorrect) {
            // 答对了
            this.streak++;
            const points = 10 * this.currentLevel * (1 + Math.floor(this.streak / 3) * 0.5);
            this.game.addScore(Math.floor(points));
            
            // 播放成功动画
            if (this.shapeMesh) {
                this.animateSuccess();
            }
            
            // 显示成功消息
            setTimeout(() => {
                this.game.showMessage(
                    '🎉 太棒了！',
                    `你答对了！\n当前关卡：第${this.currentLevel}关\n得分：+${Math.floor(points)}`,
                    this.currentLevel >= 10 ? '返回菜单' : '下一关',
                    () => {
                        if (this.currentLevel >= 10) {
                            this.game.returnToMenu();
                        } else {
                            this.loadLevel(this.currentLevel + 1);
                        }
                    }
                );
            }, 500);
        } else {
            // 答错了
            this.streak = 0;
            
            // 震动效果
            document.getElementById('options-container').classList.add('shake');
            setTimeout(() => {
                document.getElementById('options-container').classList.remove('shake');
            }, 500);
            
            // 显示答案解析
            this.showExplanation();
        }
    }

    // 显示答案解析
    showExplanation() {
        const explanation = document.getElementById('explanation');
        const text = document.getElementById('explanation-text');
        
        const shapeNames = {
            'cube': '正方体',
            'cylinder': '圆柱体',
            'cone': '圆锥体',
            'rectangular': '长方体'
        };
        
        text.innerHTML = `
            <strong>${shapeNames[this.currentQuestion.shape]}</strong>的三视图特点：<br><br>
            • 主视图（从正面看）：${this.getViewDescription(this.currentQuestion.shape, 'front')}<br>
            • 俯视图（从上面看）：${this.getViewDescription(this.currentQuestion.shape, 'top')}<br>
            • 左视图（从侧面看）：${this.getViewDescription(this.currentQuestion.shape, 'side')}<br><br>
            💡 <strong>小技巧</strong>：想象自己站在几何体的不同方向观察！
        `;
        
        explanation.style.display = 'block';
        
        document.getElementById('explanation-close').onclick = () => {
            explanation.style.display = 'none';
        };
    }

    // 获取视图描述
    getViewDescription(shape, view) {
        const descriptions = {
            'cube': { front: '正方形', top: '正方形', side: '正方形' },
            'cylinder': { front: '长方形', top: '圆形', side: '长方形' },
            'cone': { front: '三角形', top: '圆形（带圆心）', side: '三角形' },
            'rectangular': { front: '长方形', top: '长方形', side: '长方形' }
        };
        return descriptions[shape]?.[view] || '未知';
    }

    // 播放成功动画
    animateSuccess() {
        if (!this.shapeMesh) return;
        
        let scale = 1.5;
        let growing = true;
        const animate = () => {
            if (growing) {
                scale += 0.1;
                if (scale >= 2) growing = false;
            } else {
                scale -= 0.1;
                if (scale <= 1.5) {
                    this.shapeMesh.scale.set(scale, scale, scale);
                    return;
                }
            }
            this.shapeMesh.scale.set(scale, scale, scale);
            requestAnimationFrame(animate);
        };
        animate();
    }

    // 比较两个视图是否相等
    viewsEqual(v1, v2) {
        return v1.front === v2.front && v1.top === v2.top && v1.side === v2.side;
    }

    // 数组乱序
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 清理
    cleanup() {
        if (this.shapeMesh) {
            this.game.scene.remove(this.shapeMesh);
            this.shapeMesh = null;
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ViewMatchMode;
}
