// modes/net-match.js - 模式 2: 展开图配对

class NetMatchMode {
    constructor(game) {
        this.game = game;
        this.name = 'net-match';
        this.displayName = '展开图配对';
        this.currentLevel = 1;
        this.currentQuestion = null;
        this.streak = 0;
        this.isAnimating = false;
    }

    // 初始化模式
    init() {
        console.log('NetMatchMode initialized');
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
        document.getElementById('hint-text').textContent = '💡 观察 3D 几何体，选择正确的展开图';
        
        // 创建 3D 几何体
        this.create3DShape(question.shape);
        
        // 创建选项（展开图）
        this.createOptions(question.options);
    }

    // 生成题目
    generateQuestion(level) {
        const shapes = [
            { type: 'cube', name: '正方体' },
            { type: 'cylinder', name: '圆柱体' },
            { type: 'cone', name: '圆锥体' },
            { type: 'rectangular', name: '长方体' },
            { type: 'triangular_prism', name: '三棱柱' }
        ];
        
        const shape = shapes[Math.min(level - 1, shapes.length - 1)];
        
        // 生成正确答案
        const correctNet = this.generateNet(shape.type);
        
        // 生成错误选项
        const options = [correctNet];
        while (options.length < 4) {
            const wrongShape = shapes[Math.floor(Math.random() * shapes.length)];
            const wrongNet = this.generateNet(wrongShape.type);
            if (!options.some(opt => opt.type === wrongNet.type && opt.variant === wrongNet.variant)) {
                options.push(wrongNet);
            }
        }
        
        this.shuffleArray(options);
        
        return {
            shape: shape,
            correctNet: correctNet,
            options: options
        };
    }

    // 生成展开图数据
    generateNet(shapeType) {
        const nets = {
            'cube': [
                { type: 'cube', variant: 0, description: '1-4-1 型展开图' },
                { type: 'cube', variant: 1, description: '2-3-1 型展开图' },
                { type: 'cube', variant: 2, description: '2-2-2 型展开图' }
            ],
            'cylinder': [
                { type: 'cylinder', variant: 0, description: '侧面展开为长方形' }
            ],
            'cone': [
                { type: 'cone', variant: 0, description: '侧面展开为扇形' }
            ],
            'rectangular': [
                { type: 'rectangular', variant: 0, description: '长方体展开图' }
            ],
            'triangular_prism': [
                { type: 'triangular_prism', variant: 0, description: '三棱柱展开图' }
            ]
        };
        
        const shapeNets = nets[shapeType] || nets['cube'];
        const variant = shapeNets[Math.floor(Math.random() * shapeNets.length)];
        return variant;
    }

    // 创建 3D 几何体
    create3DShape(shapeType) {
        if (this.shapeMesh) {
            this.game.scene.remove(this.shapeMesh);
            this.shapeMesh.geometry.dispose();
            this.shapeMesh.material.dispose();
        }
        
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
        
        document.getElementById('selection-zone').classList.remove('active');
        
        options.forEach((net, index) => {
            const btn = document.createElement('div');
            btn.className = 'option-btn';
            
            // 绘制展开图预览
            const canvas = document.createElement('canvas');
            canvas.width = 80;
            canvas.height = 80;
            this.drawNetPreview(canvas, net);
            
            btn.innerHTML = `
                ${canvas.outerHTML}
                <div style="font-size: 11px; text-align: center;">${net.description.substring(0, 8)}...</div>
            `;
            btn.addEventListener('click', () => this.selectOption(index, btn));
            container.appendChild(btn);
        });
    }

    // 绘制展开图预览
    drawNetPreview(canvas, net) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 80, 80);
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        
        if (net.type === 'cube') {
            // 绘制正方体展开图（简化为 6 个正方形）
            const size = 15;
            // 画十字形
            ctx.strokeRect(30, 10, size, size);
            ctx.strokeRect(30, 25, size, size);
            ctx.strokeRect(30, 40, size, size);
            ctx.strokeRect(15, 25, size, size);
            ctx.strokeRect(45, 25, size, size);
            ctx.strokeRect(30, 55, size, size);
        } else if (net.type === 'cylinder') {
            // 圆柱展开图：一个长方形 + 两个圆形
            ctx.strokeRect(20, 25, 40, 30);
            ctx.beginPath();
            ctx.arc(40, 15, 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(40, 65, 10, 0, Math.PI * 2);
            ctx.stroke();
        } else if (net.type === 'cone') {
            // 圆锥展开图：一个扇形 + 一个圆形
            ctx.beginPath();
            ctx.arc(40, 35, 25, 0.2 * Math.PI, 1.8 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(40, 65, 10, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // 默认：长方体展开图
            ctx.strokeRect(20, 20, 40, 40);
            ctx.strokeRect(10, 20, 10, 40);
            ctx.strokeRect(60, 20, 10, 40);
            ctx.strokeRect(20, 10, 40, 10);
            ctx.strokeRect(20, 60, 40, 10);
        }
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
        const selectedNet = this.currentQuestion.options[selectedIndex];
        const isCorrect = selectedNet.type === this.currentQuestion.correctNet.type;
        
        if (isCorrect) {
            this.streak++;
            const points = 10 * this.currentLevel * (1 + Math.floor(this.streak / 3) * 0.5);
            this.game.addScore(Math.floor(points));
            
            // 播放展开动画
            this.animateUnfold();
            
            setTimeout(() => {
                this.game.showMessage(
                    '🎉 正确！',
                    `你答对了！\n${this.currentQuestion.shape.name}的展开图特点：${this.currentQuestion.correctNet.description}`,
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
        
        const shapeInfo = {
            'cube': {
                name: '正方体',
                description: '正方体有 6 个面，每个面都是正方形。展开图有 11 种基本形式。',
                tips: '记住：相对的面在展开图中不相邻！'
            },
            'cylinder': {
                name: '圆柱体',
                description: '圆柱体展开后，侧面是长方形，上下底面是两个圆形。',
                tips: '长方形的长 = 底面圆的周长！'
            },
            'cone': {
                name: '圆锥体',
                description: '圆锥体展开后，侧面是扇形，底面是一个圆形。',
                tips: '扇形的弧长 = 底面圆的周长！'
            },
            'rectangular': {
                name: '长方体',
                description: '长方体有 6 个面，相对的面完全相同。',
                tips: '相对的面在展开图中不相邻！'
            },
            'triangular_prism': {
                name: '三棱柱',
                description: '三棱柱有 5 个面：2 个三角形底面 + 3 个长方形侧面。',
                tips: '两个三角形底面在展开图中相对！'
            }
        };
        
        const info = shapeInfo[this.currentQuestion.shape.type] || shapeInfo['cube'];
        
        text.innerHTML = `
            <strong>${info.name}</strong><br><br>
            ${info.description}<br><br>
            💡 <strong>${info.tips}</strong>
        `;
        
        explanation.style.display = 'block';
        
        document.getElementById('explanation-close').onclick = () => {
            explanation.style.display = 'none';
        };
    }

    // 播放展开动画
    animateUnfold() {
        if (!this.shapeMesh || this.isAnimating) return;
        this.isAnimating = true;
        
        // 简单的旋转 + 缩放动画
        let rotation = 0;
        const animate = () => {
            rotation += 0.1;
            this.shapeMesh.rotation.y = rotation;
            this.shapeMesh.rotation.z = Math.sin(rotation) * 0.2;
            
            if (rotation < Math.PI * 2) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
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
        if (this.shapeMesh) {
            this.game.scene.remove(this.shapeMesh);
            this.shapeMesh = null;
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetMatchMode;
}
