// modes/volume-calc.js - 模式 4: 体积/表面积计算挑战

class VolumeCalcMode {
    constructor(game) {
        this.game = game;
        this.name = 'volume-calc';
        this.displayName = '体积·表面积';
        this.currentLevel = 1;
        this.currentQuestion = null;
        this.streak = 0;
    }

    // 初始化模式
    init() {
        console.log('VolumeCalcMode initialized');
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
        document.getElementById('hint-text').textContent = '💡 根据尺寸计算体积或表面积';
        
        // 显示问题
        this.showQuestion(question);
        
        // 创建 3D 几何体
        this.create3DShape(question.shape, question.dimensions);
        
        // 创建选项
        this.createOptions(question.options);
    }

    // 生成题目
    generateQuestion(level) {
        const shapes = [
            { type: 'cube', name: '正方体', formula: { V: 'a³', S: '6a²' } },
            { type: 'rectangular', name: '长方体', formula: { V: 'l×w×h', S: '2(lw+lh+wh)' } },
            { type: 'cylinder', name: '圆柱体', formula: { V: 'πr²h', S: '2πr²+2πrh' } },
            { type: 'cone', name: '圆锥体', formula: { V: '⅓πr²h', S: 'πr²+πrl' } }
        ];
        
        const shape = shapes[Math.min(level - 1, shapes.length - 1)];
        const calcType = level % 2 === 1 ? 'volume' : 'surface'; // 奇数关算体积，偶数关算表面积
        
        // 生成尺寸
        const dimensions = this.generateDimensions(shape.type, level);
        
        // 计算正确答案
        const correctAnswer = this.calculate(shape.type, calcType, dimensions);
        
        // 生成选项（正确答案 + 3 个错误答案）
        const options = [correctAnswer];
        while (options.length < 4) {
            const wrong = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 20 + 10);
            if (wrong > 0 && !options.includes(wrong)) {
                options.push(wrong);
            }
        }
        
        this.shuffleArray(options);
        
        return {
            shape: shape,
            calcType: calcType,
            dimensions: dimensions,
            correctAnswer: correctAnswer,
            options: options
        };
    }

    // 生成尺寸
    generateDimensions(shapeType, level) {
        const base = Math.min(level + 1, 10);
        
        if (shapeType === 'cube') {
            return { a: Math.floor(Math.random() * 5) + 2 };
        } else if (shapeType === 'rectangular') {
            return { 
                l: Math.floor(Math.random() * 5) + 3,
                w: Math.floor(Math.random() * 4) + 2,
                h: Math.floor(Math.random() * 3) + 2
            };
        } else if (shapeType === 'cylinder') {
            return { 
                r: Math.floor(Math.random() * 3) + 2,
                h: Math.floor(Math.random() * 5) + 3
            };
        } else if (shapeType === 'cone') {
            return { 
                r: Math.floor(Math.random() * 3) + 2,
                h: Math.floor(Math.random() * 4) + 3
            };
        }
        return { a: 3 };
    }

    // 计算
    calculate(shapeType, calcType, dim) {
        const π = Math.PI;
        
        if (shapeType === 'cube') {
            if (calcType === 'volume') {
                return Math.round(dim.a * dim.a * dim.a);
            } else {
                return Math.round(6 * dim.a * dim.a);
            }
        } else if (shapeType === 'rectangular') {
            if (calcType === 'volume') {
                return Math.round(dim.l * dim.w * dim.h);
            } else {
                return Math.round(2 * (dim.l * dim.w + dim.l * dim.h + dim.w * dim.h));
            }
        } else if (shapeType === 'cylinder') {
            if (calcType === 'volume') {
                return Math.round(π * dim.r * dim.r * dim.h);
            } else {
                return Math.round(2 * π * dim.r * (dim.r + dim.h));
            }
        } else if (shapeType === 'cone') {
            if (calcType === 'volume') {
                return Math.round((1/3) * π * dim.r * dim.r * dim.h);
            } else {
                const l = Math.sqrt(dim.r * dim.r + dim.h * dim.h); // 斜高
                return Math.round(π * dim.r * (dim.r + l));
            }
        }
        return 0;
    }

    // 显示问题
    showQuestion(question) {
        const questionArea = document.getElementById('question-area');
        const questionText = document.getElementById('question-text');
        
        const calcText = question.calcType === 'volume' ? '体积' : '表面积';
        
        let dimText = '';
        if (question.shape.type === 'cube') {
            dimText = `棱长 = ${question.dimensions.a}`;
        } else if (question.shape.type === 'rectangular') {
            dimText = `长 = ${question.dimensions.l}, 宽 = ${question.dimensions.w}, 高 = ${question.dimensions.h}`;
        } else if (question.shape.type === 'cylinder') {
            dimText = `底面半径 = ${question.dimensions.r}, 高 = ${question.dimensions.h}`;
        } else if (question.shape.type === 'cone') {
            dimText = `底面半径 = ${question.dimensions.r}, 高 = ${question.dimensions.h}`;
        }
        
        questionArea.style.display = 'block';
        questionText.innerHTML = `
            <div style="font-size: 16px; color: #666; margin-bottom: 8px;">
                ${question.shape.name}的${calcText}
            </div>
            <div style="font-size: 20px; color: #667eea; font-weight: bold;">
                ${dimText}
            </div>
        `;
    }

    // 创建 3D 几何体
    create3DShape(shapeType, dimensions) {
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
        
        const letters = ['A', 'B', 'C', 'D'];
        
        options.forEach((answer, index) => {
            const btn = document.createElement('div');
            btn.className = 'option-btn';
            btn.innerHTML = `
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">${answer}</div>
                <div style="font-size: 12px; color: #666;">选项${letters[index]}</div>
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
        const selectedAnswer = this.currentQuestion.options[selectedIndex];
        const isCorrect = selectedAnswer === this.currentQuestion.correctAnswer;
        
        if (isCorrect) {
            this.streak++;
            const points = 10 * this.currentLevel * (1 + Math.floor(this.streak / 3) * 0.5);
            this.game.addScore(Math.floor(points));
            
            // 播放成功动画
            this.animateSuccess();
            
            setTimeout(() => {
                this.game.showMessage(
                    '🎉 计算正确！',
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
        
        const q = this.currentQuestion;
        const calcText = q.calcType === 'volume' ? '体积' : '表面积';
        
        let formula = '';
        let calculation = '';
        
        if (q.shape.type === 'cube') {
            if (q.calcType === 'volume') {
                formula = 'V = a³';
                calculation = `${q.dimensions.a}³ = ${q.correctAnswer}`;
            } else {
                formula = 'S = 6a²';
                calculation = `6 × ${q.dimensions.a}² = ${q.correctAnswer}`;
            }
        } else if (q.shape.type === 'rectangular') {
            if (q.calcType === 'volume') {
                formula = 'V = l × w × h';
                calculation = `${q.dimensions.l} × ${q.dimensions.w} × ${q.dimensions.h} = ${q.correctAnswer}`;
            } else {
                formula = 'S = 2(lw + lh + wh)';
                calculation = `2 × (${q.dimensions.l}×${q.dimensions.w} + ${q.dimensions.l}×${q.dimensions.h} + ${q.dimensions.w}×${q.dimensions.h}) = ${q.correctAnswer}`;
            }
        } else if (q.shape.type === 'cylinder') {
            const π = Math.PI;
            if (q.calcType === 'volume') {
                formula = 'V = πr²h';
                calculation = `π × ${q.dimensions.r}² × ${q.dimensions.h} ≈ ${q.correctAnswer}`;
            } else {
                formula = 'S = 2πr(r + h)';
                calculation = `2π × ${q.dimensions.r} × (${q.dimensions.r} + ${q.dimensions.h}) ≈ ${q.correctAnswer}`;
            }
        } else if (q.shape.type === 'cone') {
            const π = Math.PI;
            if (q.calcType === 'volume') {
                formula = 'V = ⅓πr²h';
                calculation = `⅓ × π × ${q.dimensions.r}² × ${q.dimensions.h} ≈ ${q.correctAnswer}`;
            } else {
                formula = 'S = πr(r + l)';
                calculation = `π × ${q.dimensions.r} × (${q.dimensions.r} + 斜高) ≈ ${q.correctAnswer}`;
            }
        }
        
        text.innerHTML = `
            <strong>${q.shape.name}的${calcText}计算</strong><br><br>
            <strong>公式：</strong>${formula}<br><br>
            <strong>计算过程：</strong><br>
            ${calculation}<br><br>
            💡 <strong>提示</strong>：记住公式，代入数值，注意单位！
        `;
        
        explanation.style.display = 'block';
        
        document.getElementById('explanation-close').onclick = () => {
            explanation.style.display = 'none';
        };
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
        document.getElementById('question-area').style.display = 'none';
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VolumeCalcMode;
}
