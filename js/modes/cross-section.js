// modes/cross-section.js - 模式 3: 截面猜猜看

class CrossSectionMode {
    constructor(game) {
        this.game = game;
        this.name = 'cross-section';
        this.displayName = '截面猜猜看';
        this.currentLevel = 1;
        this.currentQuestion = null;
        this.streak = 0;
        this.cutPlane = null;
    }

    // 初始化模式
    init() {
        console.log('CrossSectionMode initialized');
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
        document.getElementById('hint-text').textContent = '💡 想象平面切割后的截面形状';
        
        // 创建 3D 几何体和切割平面
        this.create3DShape(question.shape);
        this.createCutPlane(question.cutType);
        
        // 创建选项
        this.createOptions(question.options);
    }

    // 生成题目
    generateQuestion(level) {
        const shapes = [
            { type: 'cube', name: '正方体' },
            { type: 'cylinder', name: '圆柱体' },
            { type: 'cone', name: '圆锥体' },
            { type: 'sphere', name: '球体' }
        ];
        
        const cutTypes = [
            { type: 'horizontal', name: '水平切割', description: '平行于底面' },
            { type: 'vertical', name: '垂直切割', description: '垂直于底面' },
            { type: 'diagonal', name: '斜着切割', description: '倾斜角度' }
        ];
        
        const shape = shapes[Math.min(level - 1, shapes.length - 1)];
        const cutType = cutTypes[level % 3];
        
        // 获取正确答案
        const correctSection = this.getSectionShape(shape.type, cutType.type);
        
        // 生成选项
        const allSections = ['圆形', '三角形', '正方形', '长方形', '椭圆', '梯形'];
        const options = [correctSection];
        
        while (options.length < 4) {
            const wrong = allSections[Math.floor(Math.random() * allSections.length)];
            if (!options.includes(wrong)) {
                options.push(wrong);
            }
        }
        
        this.shuffleArray(options);
        
        return {
            shape: shape,
            cutType: cutType,
            correctSection: correctSection,
            options: options
        };
    }

    // 获取截面形状
    getSectionShape(shapeType, cutType) {
        const sections = {
            'cube': {
                'horizontal': '正方形',
                'vertical': '长方形',
                'diagonal': '梯形'
            },
            'cylinder': {
                'horizontal': '圆形',
                'vertical': '长方形',
                'diagonal': '椭圆'
            },
            'cone': {
                'horizontal': '圆形',
                'vertical': '三角形',
                'diagonal': '椭圆'
            },
            'sphere': {
                'horizontal': '圆形',
                'vertical': '圆形',
                'diagonal': '圆形'
            }
        };
        
        return sections[shapeType]?.[cutType] || '圆形';
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
        
        // 设置为半透明，方便看到切割面
        this.shapeMesh.material.transparent = true;
        this.shapeMesh.material.opacity = 0.7;
        
        this.game.scene.add(this.shapeMesh);
    }

    // 创建切割平面
    createCutPlane(cutType) {
        if (this.cutPlane) {
            this.game.scene.remove(this.cutPlane);
        }
        
        const planeGeometry = new THREE.PlaneGeometry(5, 5);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        this.cutPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        
        if (cutType === 'horizontal') {
            this.cutPlane.rotation.x = Math.PI / 2;
            this.cutPlane.position.y = 0;
        } else if (cutType === 'vertical') {
            this.cutPlane.rotation.y = Math.PI / 2;
            this.cutPlane.position.x = 0;
        } else { // diagonal
            this.cutPlane.rotation.x = Math.PI / 4;
            this.cutPlane.position.y = 0;
        }
        
        this.game.scene.add(this.cutPlane);
    }

    // 创建选项
    createOptions(options) {
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        container.style.display = 'flex';
        
        document.getElementById('selection-zone').classList.remove('active');
        
        const shapeEmojis = {
            '圆形': '⚪',
            '三角形': '△',
            '正方形': '□',
            '长方形': '▭',
            '椭圆': '⬭',
            '梯形': '▱'
        };
        
        options.forEach((section, index) => {
            const btn = document.createElement('div');
            btn.className = 'option-btn';
            btn.innerHTML = `
                <div style="font-size: 48px;">${shapeEmojis[section] || '❓'}</div>
                <div style="font-size: 14px;">${section}</div>
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
        const selectedSection = this.currentQuestion.options[selectedIndex];
        const isCorrect = selectedSection === this.currentQuestion.correctSection;
        
        if (isCorrect) {
            this.streak++;
            const points = 10 * this.currentLevel * (1 + Math.floor(this.streak / 3) * 0.5);
            this.game.addScore(Math.floor(points));
            
            // 播放截面动画
            this.animateCut();
            
            setTimeout(() => {
                this.game.showMessage(
                    '🎉 正确！',
                    `你答对了！\n${this.currentQuestion.cutType.description}切割${this.currentQuestion.shape.name}，得到${this.currentQuestion.correctSection}截面。`,
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
            'cube': {
                'horizontal': '水平切割正方体，截面是<strong>正方形</strong>。',
                'vertical': '垂直切割正方体，截面是<strong>长方形</strong>。',
                'diagonal': '斜着切割正方体，截面可能是<strong>梯形、三角形或五边形</strong>。'
            },
            'cylinder': {
                'horizontal': '水平切割圆柱体（平行于底面），截面是<strong>圆形</strong>。',
                'vertical': '垂直切割圆柱体，截面是<strong>长方形</strong>。',
                'diagonal': '斜着切割圆柱体，截面是<strong>椭圆</strong>。'
            },
            'cone': {
                'horizontal': '水平切割圆锥体（平行于底面），截面是<strong>圆形</strong>。',
                'vertical': '垂直切割圆锥体（过顶点），截面是<strong>三角形</strong>。',
                'diagonal': '斜着切割圆锥体，截面是<strong>椭圆</strong>。'
            },
            'sphere': {
                'horizontal': '无论怎么切割球体，截面都是<strong>圆形</strong>！',
                'vertical': '无论怎么切割球体，截面都是<strong>圆形</strong>！',
                'diagonal': '无论怎么切割球体，截面都是<strong>圆形</strong>！'
            }
        };
        
        const shapeExp = explanations[this.currentQuestion.shape.type];
        const exp = shapeExp ? shapeExp[this.currentQuestion.cutType.type] : '';
        
        text.innerHTML = `
            <strong>${this.currentQuestion.shape.name}</strong> + 
            <strong>${this.currentQuestion.cutType.name}</strong><br><br>
            ${exp}<br><br>
            💡 <strong>思考</strong>：想象用刀切蛋糕，切面的形状就是截面！
        `;
        
        explanation.style.display = 'block';
        
        document.getElementById('explanation-close').onclick = () => {
            explanation.style.display = 'none';
        };
    }

    // 播放切割动画
    animateCut() {
        if (!this.cutPlane) return;
        
        let position = -2;
        const direction = 0.1;
        const animate = () => {
            position += direction;
            if (this.currentQuestion.cutType.type === 'horizontal') {
                this.cutPlane.position.y = position;
            } else if (this.currentQuestion.cutType.type === 'vertical') {
                this.cutPlane.position.x = position;
            }
            
            if (position < 2) {
                requestAnimationFrame(animate);
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
        if (this.cutPlane) {
            this.game.scene.remove(this.cutPlane);
            this.cutPlane = null;
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossSectionMode;
}
