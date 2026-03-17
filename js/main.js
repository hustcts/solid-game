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
    const isMobile = window.innerWidth < 768;
    const headerHeight = isMobile ? 60 : 80;
    const canvasHeight = window.innerHeight - headerHeight;
    const aspect = window.innerWidth / canvasHeight;
    
    camera = new THREE.PerspectiveCamera(
        isMobile ? 50 : 75,  // 手机端视野更小，避免变形
        aspect,
        0.1,
        1000
    );
    
    // 相机位置：手机端让相机正对几何体区域
    if (isMobile) {
        camera.position.set(0, 2, 8);  // 降低高度，正对
    } else {
        camera.position.set(0, 3, 8);
    }
    camera.lookAt(0, -0.5, 0);  // 看向几何体所在区域
    
    console.log('Camera - FOV:', camera.fov, 'Aspect:', aspect, 'Pos:', camera.position);

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
    if (!container) {
        console.error('Canvas container not found!');
        return;
    }
    container.appendChild(renderer.domElement);
    
    // 详细调试信息
    console.log('=== Game Init ===');
    console.log('Screen:', window.innerWidth, 'x', window.innerHeight);
    console.log('Container:', container.clientWidth, 'x', container.clientHeight);
    console.log('Camera:', camera.position);
    console.log('Camera lookAt:', camera.lookAt.toString());
    console.log('Is mobile:', window.innerWidth < 768);

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
    
    // 调试：输出几何体信息
    console.log('=== Level Loaded ===');
    console.log('Target:', currentLevelData.target);
    console.log('Options:', currentLevelData.options);
    console.log('Created shapes:', optionMeshes.length);
    optionMeshes.forEach((mesh, i) => {
        console.log(`Shape ${i}:`, mesh.userData.shapeType, 
            'pos:', mesh.position, 
            'scale:', mesh.scale,
            'visible:', mesh.visible);
    });
    console.log('Scene children:', scene.children.length);

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
    
    // 手机端放大目标几何体，更容易看到
    const isMobile = window.innerWidth < 768;
    const scale = isMobile ? 1.5 : 1.2;
    targetMesh.scale.set(scale, scale, scale);
    
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
    
    // 根据屏幕宽度调整间距
    const isMobile = window.innerWidth < 768;
    const spacing = isMobile ? 1.8 : 2.5;
    const startX = -((optionTypes.length - 1) * spacing) / 2;

    optionTypes.forEach((type, index) => {
        const shapeData = allShapes.find(s => s.type === type);
        if (!shapeData) return;

        const mesh = Shapes.createByType(type, shapeData.color);
        
        // 手机端调整位置，让几何体在屏幕中央
        const yPos = isMobile ? 0.5 : -0.5;  // 统一高度
        const zPos = 2;         // 手机端稍远
        const scale = isMobile ? 0.7 : 0.8;    // 手机端稍小
        
        mesh.position.set(startX + index * spacing, yPos, zPos);
        mesh.scale.set(scale, scale, scale);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.isOption = true;
        mesh.userData.shapeType = type;
        mesh.userData.originalZ = zPos;
        
        // 确保几何体可见
        mesh.frustumCulled = false;

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

// 射线检测器（用于点击和拖拽）
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedMesh = null;
let isDragging = false;
let dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

// 鼠标/触摸事件处理
function onMouseDown(event) {
    event.preventDefault();
    
    // 获取鼠标/触摸位置
    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    
    if (!clientX || !clientY) return;
    
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // 检测是否点击了几何体
    const intersects = raycaster.intersectObjects(optionMeshes);
    
    if (intersects.length > 0) {
        selectedMesh = intersects[0].object;
        isDragging = true;
        
        // 高亮选中的几何体
        document.querySelectorAll('.shape-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 找到对应的按钮并高亮
        const btn = document.querySelector(`[data-shape-type="${selectedMesh.userData.shapeType}"]`);
        if (btn) btn.classList.add('selected');
        
        // 提升几何体（向相机方向移动）
        selectedMesh.position.z += 1;
        selectedMesh.material.emissive = new THREE.Color(0x444444);
        
        // 放大效果
        selectedMesh.scale.multiplyScalar(1.2);
        
        console.log('Selected:', selectedMesh.userData.shapeType);
    }
}

function onMouseMove(event) {
    if (!isDragging || !selectedMesh) return;
    
    event.preventDefault();
    
    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    
    if (!clientX || !clientY) return;
    
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // 根据几何体原始深度调整拖拽平面
    const originalZ = selectedMesh.userData.originalZ || 2;
    dragPlane.constant = -originalZ;
    
    const target = new THREE.Vector3();
    const intersects = raycaster.ray.intersectPlane(dragPlane, target);
    
    if (intersects) {
        // 限制移动范围，避免拖出屏幕
        selectedMesh.position.x = THREE.MathUtils.clamp(target.x, -5, 5);
        selectedMesh.position.y = THREE.MathUtils.clamp(target.y, -2, 3);
    }
}

function onMouseUp(event) {
    if (!isDragging || !selectedMesh) return;
    
    isDragging = false;
    
    // 检查是否在目标区域内
    const distance = selectedMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
    
    if (distance < 1.5) {
        // 在目标区域内，检查答案
        checkAnswer(selectedMesh.userData.shapeType);
    }
    
    // 恢复位置
    resetMeshPosition(selectedMesh);
    selectedMesh = null;
}

function resetMeshPosition(mesh) {
    mesh.position.z = 2;
    mesh.position.y = -0.5;
    mesh.material.emissive = new THREE.Color(0x000000);
    
    // 找到原始 X 位置
    const allShapes = Shapes.getAllShapes();
    const optionTypes = currentLevelData ? currentLevelData.options : [];
    const index = optionTypes.indexOf(mesh.userData.shapeType);
    if (index >= 0) {
        const spacing = 2.5;
        const startX = -((optionTypes.length - 1) * spacing) / 2;
        mesh.position.x = startX + index * spacing;
    }
}

// 选择几何体（兼容旧版按钮点击）
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

    // 鼠标拖拽
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    // 触摸支持
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
}

// 触摸事件处理
function handleTouchStart(event) {
    if (event.touches.length === 1) {
        onMouseDown(event.touches[0]);
    }
}

function handleTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault(); // 防止滚动
        onMouseMove(event.touches[0]);
    }
}

function handleTouchEnd(event) {
    onMouseUp(event);
}

// 窗口大小调整
function onWindowResize() {
    const headerHeight = window.innerWidth < 768 ? 60 : 80;
    camera.aspect = window.innerWidth / (window.innerHeight - headerHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - headerHeight);
    
    // 手机端重新加载关卡以调整几何体位置
    if (window.innerWidth < 768) {
        loadLevel(game.getLevel());
    }
}

// 触摸事件处理
function handleTouchStart(event) {
    // 可以在这里添加触摸交互逻辑
}

function handleTouchMove(event) {
    // 可以在这里添加触摸拖动逻辑
}

// 动画循环
let frameCount = 0;
let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    // FPS 计算
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = now;
        
        // 更新调试信息
        const debugEl = document.getElementById('debug-info');
        if (debugEl && debugEl.style.display !== 'none') {
            document.getElementById('debug-screen').textContent = `${window.innerWidth}x${window.innerHeight}`;
            document.getElementById('debug-shapes').textContent = optionMeshes.length;
            document.getElementById('debug-fps').textContent = fps;
        }
    }

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

// 切换调试面板（双击屏幕）
let lastTap = 0;
document.addEventListener('dblclick', () => {
    const debugEl = document.getElementById('debug-info');
    if (debugEl) {
        debugEl.style.display = debugEl.style.display === 'none' ? 'block' : 'none';
    }
});

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
