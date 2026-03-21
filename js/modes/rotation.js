// modes/rotation.js - 模式 5: 旋转体形成

class RotationMode {
    constructor(game) {
        this.game = game;
        this.name = 'rotation';
        this.displayName = '旋转体形成';
        this.currentLevel = 1;
        this.currentQuestion = null;
        this.streak = 0;
        this.isAnimating = false;
    }

    // 初始化模式
    init() {
        console.log('RotationMode initialized');
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
        document.getElementById('hint-text').textContent = '💡 想象平面图形旋转后形成的立体';
        
        // 显示 2D 平面图形
        this.show2DShape(question.planeShape);
        
        // 创建选项
        this.createOptions(question.options);
    }

    // 生成题目
    generateQuestion(level) {
        const planeShapes = [
            { type: 'rectangle', name: '长方形', description: '绕一边旋转' },
            { type: 'triangle', name: '直角三角形', description: '绕直角边旋转' },
            { type: 'semicircle', name: '半圆', description: '绕直径旋转' },
            { type: 'trapezoid', name: '直角梯形', description: '绕垂直边旋转' }
        ];
        
        const planeShape = planeShapes[Math.min(level - 1, planeShapes.length - 1)];
        
        // 获取正确答案
        const correctSolid = this.getRotatedSolid(planeShape.type);
        
        // 生成选项
        const allSolids = [
            { type: 'cylinder', name: '圆柱体', emoji: '🛢️' },
            { type: 'cone', name: '圆锥体', emoji: '🎉' },
            { type: 'sphere', name: '球体', emoji: '⚽' },
            { type: 'torus', name: '圆环体', emoji: '🍩' }
        ];
        
        const options = [correctSolid];
        while (options.length < 4) {
            const wrong = allSolids[Math.floor(Math.random() * allSolids.length)];
            if (!options.some(o => o.type === wrong.type)) {
                options.push(wrong);
            }
        }
        
        this.shuffleArray(options);
        
        return {
            planeShape: planeShape,
            correctSolid: correctSolid,
            options: options
        };
    }

    // 获取旋转后的立体
    getRotatedSolid(planeType) {
        const mapping = {
            'rectangle': { type: 'cylinder', name: '圆柱体', emoji: '🛢️' },
            'triangle': { type: 'cone', name: '圆锥体', emoji: '🎉' },
            'semicircle': { type: 'sphere', name: '球体', emoji: '⚽' },
            'trapezoid': { type: 'cylinder', name: '圆台', emoji: '🛢️' }
        };
        return mapping[planeType] || mapping['rectangle'];
    }

    // 显示 2D 平面图形
    show2DShape(shapeType) {
        const canvas = document.getElementById('2d-canvas');
        canvas.style.display = 'block';
        canvas.width = 300;
        canvas.height = 300;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 300, 300);
        
        // 绘制旋转轴
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(150, 20);
        ctx.lineTo(150, 280);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 绘制旋转轴标签
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText('旋转轴', 160, 280);
        
        // 绘制平面图形
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
        
        if (shapeType === 'rectangle') {
            // 长方形（在旋转轴左侧）
            ctx.beginPath();
            ctx.rect(80, 100, 70, 100);
            ctx.fill();
            ctx.stroke();
            
            // 标注旋转边
            ctx.strokeStyle = '#f5576c';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(150, 100);
            ctx.lineTo(150, 200);
            ctx.stroke();
        } else if (shapeType === 'triangle') {
            // 直角三角形
            ctx.beginPath();
            ctx.moveTo(150, 100);
            ctx.lineTo(150, 200);
            ctx.lineTo(80, 200);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // 标注旋转边
            ctx.strokeStyle = '#f5576c';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(150, 100);
            ctx.lineTo(150, 200);
            ctx.stroke();
        } else if (shapeType === 'semicircle') {
            // 半圆
            ctx.beginPath();
            ctx.arc(150, 150, 70, Math.PI / 2, 3 * Math.PI / 2);
            ctx.lineTo(150, 220);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // 标注直径（旋转轴）
            ctx.strokeStyle = '#f5576c';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(150, 80);
            ctx.lineTo(150, 220);
            ctx.stroke();
        } else if (shapeType === 'trapezoid') {
            // 直角梯形
            ctx.beginPath();
            ctx.moveTo(150, 100);
            ctx.lineTo(150, 200);
            ctx.lineTo(80, 200);
            ctx.lineTo(100, 100);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // 标注旋转边
            ctx.strokeStyle = '#f5576c';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(150, 100);
            ctx.lineTo(150, 200);
            ctx.stroke();
        }
        
        // 绘制旋转箭头
        ctx.strokeStyle = '#43e97b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(150, 150, 90, -0.3 * Math.PI, 0.3 * Math.PI);
        ctx.stroke();
        
        // 箭头头部
        ctx.beginPath();
        ctx.moveTo(150 + 90 * Math.cos(0.3 * Math.PI), 150 + 90 * Math.sin(0.3 * Math.PI));
        ctx.lineTo(150 + 85 * Math.cos(0.25 * Math.PI), 150 + 85 * Math.sin(0.25 * Math.PI));
        ctx.lineTo(150 + 85 * Math.cos(0.35 * Math.PI), 150 + 85 * Math.sin(0.35 * Math.PI));
        ctx.closePath();
        ctx.fillStyle = '#43e97b';
        ctx.fill();
    }

    // 创建选项
    createOptions(options) {
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        container.style.display = 'flex';
        
        document.getElementById('selection-zone').classList.remove('active');
        
        options.forEach((solid, index) => {
            const btn = document.createElement('div');
            btn.className = 'option-btn';
            btn.innerHTML = `
                <div style="font-size: 48px;">${solid.emoji}</div>
                <div style="font-size: 14px;">${solid.name}</div>
            `;
            btn.addEventListener('click', () => this.selectOption(index, btn));
            container.appendChild(btn);
        });
    }

    // 选择选项
    selectOption(index, btnElement) {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        btnElement.classList.add('selected');
        
        setTimeout(() => {
            this.checkAnswer(index);
        }, 300);
    }

    // 检查答案
    checkAnswer(selectedIndex) {
        const selectedSolid = this.currentQuestion.options[selectedIndex];
        const isCorrect = selectedSolid.type === this.currentQuestion.correctSolid.type;
        
        if (isCorrect) {
            this.streak++;
            const points = 10 * this.currentLevel * (1 + Math.floor(this.streak / 3) * 0.5);
            this.game.addScore(Math.floor(points));
            
            // 播放旋转动画
            this.animateRotation();
            
            setTimeout(() => {
                this.game.showMessage(
                    '🎉 正确！',
                    `${this.currentQuestion.planeShape.name}${this.currentQuestion.planeShape.description}，形成${this.currentQuestion.correctSolid.name}！`,
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
            this.streak = 0;
            document.getElementById('options-container').classList.add('shake');
            setTimeout(() => {
                document.getElementById('options-container').classList.remove('shake');
            }, 500);
            
            this.showExplanation();
        }
    }

    // 显示答案解析
    showExplanation() {
        const explanation = document.getElementById('explanation');
        const text = document.getElementById('explanation-text');
        
        const explanations = {
            'rectangle': {
                solid: '圆柱体',
                description: '长方形绕一边旋转一周，形成<strong>圆柱体</strong>。',
                tip: '旋转的边成为圆柱的高，另一条边成为底面半径！'
            },
            'triangle': {
                solid: '圆锥体',
                description: '直角三角形绕直角边旋转一周，形成<strong>圆锥体</strong>。',
                tip: '旋转的直角边成为圆锥的高，另一条直角边成为底面半径！'
            },
            'semicircle': {
                solid: '球体',
                description: '半圆绕直径旋转一周，形成<strong>球体</strong>。',
                tip: '直径是旋转轴，半圆的弧旋转形成球面！'
            },
            'trapezoid': {
                solid: '圆台',
                description: '直角梯形绕垂直边旋转一周，形成<strong>圆台</strong>。',
                tip: '圆台可以看作是被截断的圆锥！'
            }
        };
        
        const exp = explanations[this.currentQuestion.planeShape.type];
        
        text.innerHTML = `
            <strong>${this.currentQuestion.planeShape.name}</strong> + 
            <strong>${this.currentQuestion.planeShape.description}</strong><br><br>
            ${exp.description}<br><br>
            💡 <strong>${exp.tip}</strong><br><br>
            <strong>常见旋转体对应关系：</strong><br>
            • 长方形 → 圆柱体<br>
            • 直角三角形 → 圆锥体<br>
            • 半圆 → 球体<br>
            • 直角梯形 → 圆台
        `;
        
        explanation.style.display = 'block';
        
        document.getElementById('explanation-close').onclick = () => {
            explanation.style.display = 'none';
        };
    }

    // 播放旋转动画
    animateRotation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const canvas = document.getElementById('2d-canvas');
        const ctx = canvas.getContext('2d');
        
        let angle = 0;
        const animate = () => {
            angle += 0.1;
            
            // 清除画布
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 300, 300);
            
            // 绘制旋转轴
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(150, 20);
            ctx.lineTo(150, 280);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // 绘制旋转中的图形（用透明度和多重图像模拟）
            for (let i = 0; i < 6; i++) {
                const alpha = 1 - i / 6;
                ctx.strokeStyle = `rgba(102, 126, 234, ${alpha})`;
                ctx.lineWidth = 2;
                
                ctx.save();
                ctx.translate(150, 150);
                ctx.rotate(angle + i * 0.2);
                ctx.translate(-150, -150);
                
                // 绘制简化的 3D 效果
                ctx.beginPath();
                ctx.ellipse(150, 150, 70 * Math.cos(angle + i * 0.2), 70, 0, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.restore();
            }
            
            if (angle < Math.PI * 2) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                // 恢复原状
                this.show2DShape(this.currentQuestion.planeShape.type);
            }
        };
        animate();
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
        document.getElementById('2d-canvas').style.display = 'none';
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RotationMode;
}
