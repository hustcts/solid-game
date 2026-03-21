// modes/position.js - 模式 6: 空间位置关系

class PositionMode {
    constructor(game) {
        this.game = game;
        this.name = 'position';
        this.displayName = '空间位置关系';
        this.currentLevel = 1;
        this.currentQuestion = null;
        this.streak = 0;
    }

    // 初始化模式
    init() {
        console.log('PositionMode initialized');
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
        document.getElementById('hint-text').textContent = '💡 观察几何体，判断点线面的位置关系';
        
        // 创建 3D 场景
        this.create3DScene(question.scenario);
        
        // 显示问题
        this.showQuestion(question);
        
        // 创建选项
        this.createOptions(question.options);
    }

    // 生成题目
    generateQuestion(level) {
        const scenarios = [
            {
                type: 'line_plane',
                name: '线与面的关系',
                description: '判断直线与平面的位置关系',
                question: '图中直线 AB 与平面α的位置关系是？',
                options: ['平行', '垂直', '相交', '在面内'],
                correct: '垂直'
            },
            {
                type: 'line_line',
                name: '线与线的关系',
                description: '判断两条直线的位置关系',
                question: '图中直线 AB 与直线 CD 的位置关系是？',
                options: ['平行', '相交', '异面', '重合'],
                correct: '异面'
            },
            {
                type: 'plane_plane',
                name: '面与面的关系',
                description: '判断两个平面的位置关系',
                question: '图中平面α与平面β的位置关系是？',
                options: ['平行', '垂直', '相交', '重合'],
                correct: '垂直'
            },
            {
                type: 'point_line',
                name: '点与线的关系',
                description: '判断点与直线的位置关系',
                question: '图中点 P 与直线 l 的位置关系是？',
                options: ['在直线上', '在直线外'],
                correct: '在直线外'
            }
        ];
        
        const scenario = scenarios[Math.min(level - 1, scenarios.length - 1)];
        
        return {
            scenario: scenario,
            question: scenario.question,
            options: scenario.options,
            correct: scenario.correct
        };
    }

    // 创建 3D 场景
    create3DScene(scenarioType) {
        // 清除之前的元素
        this.clearScene();
        
        // 创建一个立方体框架作为参考
        this.createCubeFrame();
        
        if (scenarioType.type === 'line_plane') {
            this.createLinePlaneScenario();
        } else if (scenarioType.type === 'line_line') {
            this.createLineLineScenario();
        } else if (scenarioType.type === 'plane_plane') {
            this.createPlanePlaneScenario();
        } else if (scenarioType.type === 'point_line') {
            this.createPointLineScenario();
        }
    }

    // 创建立方体框架
    createCubeFrame() {
        const material = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });
        const points = [];
        
        // 立方体的 12 条边
        const size = 3;
        const vertices = [
            [-size, -size, -size], [size, -size, -size],
            [size, size, -size], [-size, size, -size],
            [-size, -size, size], [size, -size, size],
            [size, size, size], [-size, size, size]
        ];
        
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];
        
        edges.forEach(edge => {
            points.push(vertices[edge[0]]);
            points.push(vertices[edge[1]]);
        });
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
        this.cubeFrame = new THREE.LineSegments(geometry, material);
        this.game.scene.add(this.cubeFrame);
    }

    // 线面关系场景
    createLinePlaneScenario() {
        // 创建平面（立方体底面）
        const planeGeometry = new THREE.PlaneGeometry(6, 6);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.plane.rotation.x = Math.PI / 2;
        this.plane.position.y = -3;
        this.game.scene.add(this.plane);
        
        // 创建垂直线
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -3, 0),
            new THREE.Vector3(0, 3, 0)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf5576c, linewidth: 4 });
        this.line = new THREE.Line(lineGeometry, lineMaterial);
        this.game.scene.add(this.line);
        
        // 添加标签
        this.addLabel('A', 0, 3.5, 0);
        this.addLabel('B', 0, -3.5, 0);
        this.addLabel('α', 2.5, -3, 2.5);
    }

    // 线线关系场景
    createLineLineScenario() {
        // 第一条线（立方体前面的上边）
        const line1Geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-3, 3, -3),
            new THREE.Vector3(3, 3, -3)
        ]);
        const line1Material = new THREE.LineBasicMaterial({ color: 0xf5576c, linewidth: 4 });
        this.line1 = new THREE.Line(line1Geometry, line1Material);
        this.game.scene.add(this.line1);
        
        // 第二条线（立方体后面的侧边）
        const line2Geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(3, -3, 3),
            new THREE.Vector3(3, 3, 3)
        ]);
        const line2Material = new THREE.LineBasicMaterial({ color: 0x43e97b, linewidth: 4 });
        this.line2 = new THREE.Line(line2Geometry, line2Material);
        this.game.scene.add(this.line2);
        
        // 添加标签
        this.addLabel('A', -3.5, 3, -3);
        this.addLabel('B', 3.5, 3, -3);
        this.addLabel('C', 3.5, -3, 3);
        this.addLabel('D', 3.5, 3.5, 3);
    }

    // 面面关系场景
    createPlanePlaneScenario() {
        // 第一个平面（底面）
        const plane1Geometry = new THREE.PlaneGeometry(6, 6);
        const plane1Material = new THREE.MeshBasicMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        this.plane1 = new THREE.Mesh(plane1Geometry, plane1Material);
        this.plane1.rotation.x = Math.PI / 2;
        this.plane1.position.y = -3;
        this.game.scene.add(this.plane1);
        
        // 第二个平面（侧面）
        const plane2Geometry = new THREE.PlaneGeometry(6, 6);
        const plane2Material = new THREE.MeshBasicMaterial({
            color: 0xf5576c,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        this.plane2 = new THREE.Mesh(plane2Geometry, plane2Material);
        this.plane2.rotation.z = Math.PI / 2;
        this.plane2.position.x = 3;
        this.game.scene.add(this.plane2);
        
        // 添加标签
        this.addLabel('α', 2.5, -3, 2.5);
        this.addLabel('β', 3.5, 2, 0);
    }

    // 点线关系场景
    createPointLineScenario() {
        // 创建直线
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-3, 0, 0),
            new THREE.Vector3(3, 0, 0)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf5576c, linewidth: 4 });
        this.line = new THREE.Line(lineGeometry, lineMaterial);
        this.game.scene.add(this.line);
        
        // 创建点（在直线外）
        const pointGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x43e97b });
        this.point = new THREE.Mesh(pointGeometry, pointMaterial);
        this.point.position.set(0, 2, 0);
        this.game.scene.add(this.point);
        
        // 添加标签
        this.addLabel('l', -3.5, 0, 0);
        this.addLabel('P', 0.5, 2.5, 0);
    }

    // 添加标签
    addLabel(text, x, y, z) {
        // 简化版：用 2D canvas 创建标签
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 64, 32);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 32, 16);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(x, y, z);
        sprite.scale.set(1, 0.5, 1);
        this.game.scene.add(sprite);
        
        if (!this.labels) this.labels = [];
        this.labels.push(sprite);
    }

    // 显示问题
    showQuestion(question) {
        const questionArea = document.getElementById('question-area');
        const questionText = document.getElementById('question-text');
        
        questionArea.style.display = 'block';
        questionText.innerHTML = `
            <div style="font-size: 16px; color: #666; margin-bottom: 8px;">
                ${question.scenario.name}
            </div>
            <div style="font-size: 18px; color: #333; font-weight: bold;">
                ${question.question}
            </div>
        `;
    }

    // 创建选项
    createOptions(options) {
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        container.style.display = 'flex';
        
        document.getElementById('selection-zone').classList.remove('active');
        
        options.forEach((option, index) => {
            const btn = document.createElement('div');
            btn.className = 'option-btn';
            btn.innerHTML = `
                <div style="font-size: 16px; font-weight: bold;">${option}</div>
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
        const isCorrect = selectedAnswer === this.currentQuestion.correct;
        
        if (isCorrect) {
            this.streak++;
            const points = 10 * this.currentLevel * (1 + Math.floor(this.streak / 3) * 0.5);
            this.game.addScore(Math.floor(points));
            
            this.animateSuccess();
            
            setTimeout(() => {
                this.game.showMessage(
                    '🎉 正确！',
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
        
        const explanations = {
            'line_plane': {
                '平行': '直线与平面没有交点，直线上的所有点到平面的距离相等。',
                '垂直': '直线与平面相交，且与平面内的所有直线都垂直。',
                '相交': '直线与平面有一个交点。',
                '在面内': '直线上的所有点都在平面内。'
            },
            'line_line': {
                '平行': '两条直线在同一平面内，且没有交点。',
                '相交': '两条直线在同一平面内，且有一个交点。',
                '异面': '两条直线不在同一平面内，既不平行也不相交。',
                '重合': '两条直线完全重叠。'
            },
            'plane_plane': {
                '平行': '两个平面没有交线。',
                '垂直': '两个平面相交，且二面角为 90°。',
                '相交': '两个平面有一条交线。',
                '重合': '两个平面完全重叠。'
            },
            'point_line': {
                '在直线上': '点是直线的一部分。',
                '在直线外': '点不在直线上。'
            }
        };
        
        const scenarioExp = explanations[this.currentQuestion.scenario.type];
        const correctExp = scenarioExp ? scenarioExp[this.currentQuestion.correct] : '';
        
        text.innerHTML = `
            <strong>${this.currentQuestion.scenario.name}</strong><br><br>
            正确答案：<strong>${this.currentQuestion.correct}</strong><br><br>
            ${correctExp}<br><br>
            💡 <strong>判断技巧</strong>：<br>
            • 观察是否有交点/交线<br>
            • 想象延长后的情况<br>
            • 利用立方体框架作为参考
        `;
        
        explanation.style.display = 'block';
        
        document.getElementById('explanation-close').onclick = () => {
            explanation.style.display = 'none';
        };
    }

    // 播放成功动画
    animateSuccess() {
        if (this.line) {
            let scale = 1;
            let growing = true;
            const animate = () => {
                if (growing) {
                    scale += 0.1;
                    if (scale >= 1.5) growing = false;
                } else {
                    scale -= 0.1;
                    if (scale <= 1) {
                        this.line.scale.set(scale, scale, scale);
                        return;
                    }
                }
                this.line.scale.set(scale, scale, scale);
                requestAnimationFrame(animate);
            };
            animate();
        }
    }

    // 清除场景
    clearScene() {
        if (this.cubeFrame) {
            this.game.scene.remove(this.cubeFrame);
            this.cubeFrame = null;
        }
        if (this.plane) {
            this.game.scene.remove(this.plane);
            this.plane = null;
        }
        if (this.plane1) {
            this.game.scene.remove(this.plane1);
            this.plane1 = null;
        }
        if (this.plane2) {
            this.game.scene.remove(this.plane2);
            this.plane2 = null;
        }
        if (this.line) {
            this.game.scene.remove(this.line);
            this.line = null;
        }
        if (this.line1) {
            this.game.scene.remove(this.line1);
            this.line1 = null;
        }
        if (this.line2) {
            this.game.scene.remove(this.line2);
            this.line2 = null;
        }
        if (this.point) {
            this.game.scene.remove(this.point);
            this.point = null;
        }
        if (this.labels) {
            this.labels.forEach(label => this.game.scene.remove(label));
            this.labels = [];
        }
    }

    // 清理
    cleanup() {
        this.clearScene();
        document.getElementById('question-area').style.display = 'none';
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PositionMode;
}
