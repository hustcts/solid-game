// main.js - 主程序

let scene, camera, renderer, controls;
let targetMesh = null;
let optionMeshes = [];
let game = null;
let currentLevelData = null;
let successCount = 0;
const SUCCESS_NEEDED = 3; // 每关需要成功 3 次

// 初始化
function init() {
    // 创建游戏实例
    game = new Game();

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);

    // 创建相机
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight - 80);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 添加到容器
    const container = document.getElementById('canvas-container');
    container.appendChild(renderer.domElement);

    // 添加轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.enablePan = false;

    // 添加光源
    setupLights();

    // 添加地面
    addGround();

    // 加载第一关
    loadLevel(1);

    // 设置事件监听
    setupEventListeners();

    // 开始动画循环
    animate();
}

// 设置光源
function setupLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 主光源（太阳光）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // 补光
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // 底部补光
    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.2);
    bottomLight.position.set(0, -5, 0);
    scene.add(bottomLight);
}

// 添加地面
function addGround() {
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xe8ecf1,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 添加网格
    const gridHelper = new THREE.GridHelper(20, 20, 0x667eea, 0x667eea);
    gridHelper.position.y = -1.99;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

// 加载关卡
function loadLevel(levelNum) {
    // 清除之前的几何体
    clearShapes();

    // 初始化关卡
    currentLevelData = game.initLevel(levelNum);
    successCount = 0;
    game.updateProgress(0, SUCCESS_NEEDED);

    // 创建目标几何体（半透明影子效果）
    createTargetShape(currentLevelData.target);

    // 创建选项几何体
    createOptionShapes(currentLevelData.options);

    // 更新 UI
    game.updateUI();
}

// 清除所有几何体
function clearShapes() {
    if (targetMesh) {
        scene.remove(targetMesh);
        targetMesh.geometry.dispose();
        targetMesh.material.dispose();
        targetMesh = null;
    }

    optionMeshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    });
    optionMeshes = [];
}

// 创建目标几何体（影子）
function createTargetShape(shapeType) {
    const shapeData = Shapes.getAllShapes().find(s => s.type === shapeType);
    if (!shapeData) return;

    targetMesh = Shapes.createByType(shapeType, 0x333333);
    targetMesh.position.set(0, 0, 0);
    targetMesh.scale.set(1.2, 1.2, 1.2);
    
    // 设置为半透明影子效果
    targetMesh.material.transparent = true;
    targetMesh.material.opacity = 0.4;
    targetMesh.material.depthWrite = false;
    
    targetMesh.castShadow = true;
    targetMesh.receiveShadow = true;
    
    scene.add(targetMesh);
}

// 创建选项几何体
function createOptionShapes(optionTypes) {
    const allShapes = Shapes.getAllShapes();
    const spacing = 2.5;
    const startX = -((optionTypes.length - 1) * spacing) / 2;

    optionTypes.forEach((type, index) => {
        const shapeData = allShapes.find(s => s.type === type);
        if (!shapeData) return;

        const mesh = Shapes.createByType(type, shapeData.color);
        mesh.position.set(startX + index * spacing, -0.5, 2);
        mesh.scale.set(0.8, 0.8, 0.8);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.isOption = true;
        mesh.userData.shapeType = type;

        scene.add(mesh);
        optionMeshes.push(mesh);
    });

    // 创建底部选择按钮
    createSelectionButtons(optionTypes);
}

// 创建底部选择按钮
function createSelectionButtons(optionTypes) {
    const zone = document.getElementById('selection-zone');
    zone.innerHTML = '';

    const allShapes = Shapes.getAllShapes();

    optionTypes.forEach(type => {
        const shapeData = allShapes.find(s => s.type === type);
        if (!shapeData) return;

        const button = document.createElement('div');
        button.className = 'shape-option';
        button.textContent = shapeData.emoji;
        button.dataset.shapeType = type;

        button.addEventListener('click', () => selectShape(type, button));

        zone.appendChild(button);
    });
}

// 选择几何体
function selectShape(shapeType, buttonElement) {
    // 移除其他按钮的选中状态
    document.querySelectorAll('.shape-option').forEach(btn => {
        btn.classList.remove('selected');
    });

    // 添加选中状态
    buttonElement.classList.add('selected');

    // 高亮对应的 3D 几何体
    highlightShape(shapeType);

    // 检查答案
    setTimeout(() => {
        checkAnswer(shapeType);
    }, 300);
}

// 高亮几何体
function highlightShape(shapeType) {
    optionMeshes.forEach(mesh => {
        if (mesh.userData.shapeType === shapeType) {
            // 动画效果：上下浮动
            const originalY = mesh.position.y;
            let time = 0;
            const animateHighlight = () => {
                time += 0.1;
                mesh.position.y = originalY + Math.sin(time) * 0.2;
                mesh.rotation.y += 0.05;
                
                if (time < Math.PI * 2) {
                    requestAnimationFrame(animateHighlight);
                } else {
                    mesh.position.y = originalY;
                }
            };
            animateHighlight();
        }
    });
}

// 检查答案
function checkAnswer(selectedType) {
    const result = game.checkAnswer(selectedType);

    if (result.correct) {
        successCount++;
        game.updateProgress(successCount, SUCCESS_NEEDED);

        // 成功动画
        if (targetMesh) {
            game.showSuccess(targetMesh);
        }

        // 播放成功音效（可选）
        playSound('success');

        if (successCount >= SUCCESS_NEEDED) {
            // 完成关卡
            setTimeout(() => {
                game.showMessage(
                    '🎉 太棒了！',
                    `你完成了第${game.getLevel()}关！\n当前得分：${result.score}`,
                    '继续下一关',
                    () => {
                        loadLevel(game.getLevel() + 1);
                    }
                );
            }, 500);
        }
    } else {
        // 失败动画
        playSound('error');
        
        // 震动效果
        const cameraPos = camera.position.clone();
        let shake = 0;
        const animateShake = () => {
            shake += 0.5;
            camera.position.x = cameraPos.x + Math.sin(shake) * 0.1;
            
            if (shake < Math.PI * 4) {
                requestAnimationFrame(animateShake);
            } else {
                camera.position.x = cameraPos.x;
            }
        };
        animateShake();

        game.showMessage(
            '😅 再试一次！',
            '这个几何体不太对哦~\n仔细看看影子的形状！',
            '我知道了',
            () => {
                document.getElementById('message').style.display = 'none';
            }
        );
    }
}

// 播放音效（简化版）
function playSound(type) {
    // 这里可以添加实际的音效
    // 使用 Web Audio API 或 HTML5 Audio
    console.log('Play sound:', type);
}

// 设置事件监听
function setupEventListeners() {
    // 窗口大小调整
    window.addEventListener('resize', onWindowResize);

    // 触摸支持
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight - 80);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - 80);
}

// 触摸事件处理
function handleTouchStart(event) {
    // 可以在这里添加触摸交互逻辑
}

function handleTouchMove(event) {
    // 可以在这里添加触摸拖动逻辑
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    // 更新控制器
    controls.update();

    // 缓慢旋转目标几何体
    if (targetMesh) {
        targetMesh.rotation.y += 0.005;
    }

    // 缓慢旋转选项几何体
    optionMeshes.forEach((mesh, index) => {
        mesh.rotation.y += 0.01;
    });

    // 渲染场景
    renderer.render(scene, camera);
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);

// 导出供调试使用
window.gameDebug = {
    scene: () => scene,
    camera: () => camera,
    renderer: () => renderer,
    game: () => game,
    resetGame: () => {
        game.reset();
        loadLevel(1);
    }
};
