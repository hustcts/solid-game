// main.js - 主程序（多模式支持）

let scene, camera, renderer;
let currentMode = null;
let game = null;

// 模式映射
const MODES = {
    'view-match': ViewMatchMode,
    'net-match': NetMatchMode,
    'cross-section': CrossSectionMode,
    'volume-calc': VolumeCalcMode,
    'rotation': RotationMode,
    'position': PositionMode
};

// 初始化
function init() {
    console.log('=== Solid Game 2.0 Init ===');
    
    // 创建游戏实例
    game = new Game();
    
    // 加载玩家进度
    game.loadProgress();
    updatePlayerStats();
    
    // 设置事件监听
    setupMenuListeners();
    
    // 初始化 3D 场景（延迟到进入游戏时）
    // 主菜单不需要 3D 场景
}

// 设置主菜单事件监听
function setupMenuListeners() {
    // 模式选择
    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            selectMode(mode);
        });
    });
    
    // 继续游戏
    document.getElementById('btn-continue').addEventListener('click', () => {
        const lastMode = game.getLastPlayedMode();
        if (lastMode) {
            selectMode(lastMode);
        } else {
            selectMode('view-match'); // 默认第一个模式
        }
    });
    
    // 重置进度
    document.getElementById('btn-reset').addEventListener('click', () => {
        if (confirm('确定要重置所有游戏进度吗？此操作不可恢复！')) {
            game.resetProgress();
            updatePlayerStats();
            alert('进度已重置！');
        }
    });
    
    // 帮助
    document.getElementById('btn-help').addEventListener('click', () => {
        document.getElementById('help-modal').classList.add('active');
    });
    
    // 关闭帮助
    document.getElementById('help-close').addEventListener('click', () => {
        document.getElementById('help-modal').classList.remove('active');
    });
    
    // 返回菜单按钮
    document.getElementById('back-to-menu').addEventListener('click', () => {
        returnToMenu();
    });
}

// 选择模式
function selectMode(modeName) {
    console.log('Selecting mode:', modeName);
    
    // 隐藏主菜单
    document.getElementById('main-menu').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // 初始化 3D 场景
    init3DScene();
    
    // 创建模式实例
    const ModeClass = MODES[modeName];
    if (ModeClass) {
        currentMode = new ModeClass(game);
        currentMode.init();
        
        // 记录最后玩的模式
        game.setLastPlayedMode(modeName);
    } else {
        console.error('Mode not found:', modeName);
    }
}

// 初始化 3D 场景
function init3DScene() {
    if (scene) return; // 已初始化
    
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);
    
    // 创建相机
    const isMobile = window.innerWidth < 768;
    const headerHeight = 70;
    const canvasHeight = window.innerHeight - headerHeight;
    const aspect = window.innerWidth / canvasHeight;
    
    camera = new THREE.PerspectiveCamera(
        isMobile ? 50 : 75,
        aspect,
        0.1,
        1000
    );
    
    if (isMobile) {
        camera.position.set(0, 2, 8);
    } else {
        camera.position.set(0, 3, 8);
    }
    camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight - headerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 添加到容器
    const container = document.getElementById('canvas-container');
    if (container) {
        container.appendChild(renderer.domElement);
    }
    
    // 添加光源
    setupLights();
    
    // 添加地面
    addGround();
    
    // 设置窗口大小调整
    window.addEventListener('resize', onWindowResize);
    
    // 开始动画循环
    animate();
}

// 设置光源
function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
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
    ground.position.y = -4;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const gridHelper = new THREE.GridHelper(20, 20, 0x667eea, 0x667eea);
    gridHelper.position.y = -3.99;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

// 返回菜单
function returnToMenu() {
    // 清理当前模式
    if (currentMode) {
        currentMode.cleanup();
        currentMode = null;
    }
    
    // 隐藏游戏界面
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('main-menu').classList.add('active');
    
    // 隐藏 UI 元素
    document.getElementById('question-area').style.display = 'none';
    document.getElementById('options-container').innerHTML = '';
    document.getElementById('options-container').style.display = 'none';
    document.getElementById('selection-zone').classList.remove('active');
    document.getElementById('explanation').style.display = 'none';
    document.getElementById('message').style.display = 'none';
    
    // 更新统计
    updatePlayerStats();
}

// 窗口大小调整
function onWindowResize() {
    if (!camera || !renderer) return;
    
    const headerHeight = 70;
    camera.aspect = window.innerWidth / (window.innerHeight - headerHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - headerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    if (scene && camera && renderer) {
        // 缓慢旋转场景中的物体（如果有）
        if (currentMode && currentMode.shapeMesh) {
            currentMode.shapeMesh.rotation.y += 0.005;
        }
        
        renderer.render(scene, camera);
    }
}

// 更新玩家统计
function updatePlayerStats() {
    const progress = game.getProgress();
    document.getElementById('total-stars').textContent = progress.totalStars || 0;
    document.getElementById('total-gems').textContent = progress.totalGems || 0;
    document.getElementById('player-level').textContent = progress.level || 1;
    document.getElementById('games-played').textContent = progress.gamesPlayed || 0;
}

// 导出给模式使用
window.gameDebug = {
    scene: () => scene,
    camera: () => camera,
    renderer: () => renderer,
    game: () => game
};

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);
