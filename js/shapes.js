// shapes.js - 几何体定义（增强版）

const Shapes = {
    // 立方体
    createCube: function(color = 0x667eea) {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 100,
            specular: 0x444444
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.userData.shapeType = 'cube';
        cube.userData.shapeName = '立方体';
        return cube;
    },

    // 球体
    createSphere: function(color = 0xf093fb) {
        const geometry = new THREE.SphereGeometry(1.3, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 100,
            specular: 0x444444
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.userData.shapeType = 'sphere';
        sphere.userData.shapeName = '球体';
        return sphere;
    },

    // 圆柱体
    createCylinder: function(color = 0xf5576c) {
        const geometry = new THREE.CylinderGeometry(1, 1, 2.5, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 100,
            specular: 0x444444
        });
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.userData.shapeType = 'cylinder';
        cylinder.userData.shapeName = '圆柱体';
        return cylinder;
    },

    // 圆锥体
    createCone: function(color = 0x4facfe) {
        const geometry = new THREE.ConeGeometry(1.2, 2.5, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 100,
            specular: 0x444444
        });
        const cone = new THREE.Mesh(geometry, material);
        cone.userData.shapeType = 'cone';
        cone.userData.shapeName = '圆锥体';
        return cone;
    },

    // 圆环体（甜甜圈）
    createTorus: function(color = 0x43e97b) {
        const geometry = new THREE.TorusGeometry(1.2, 0.5, 16, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 100,
            specular: 0x444444
        });
        const torus = new THREE.Mesh(geometry, material);
        torus.userData.shapeType = 'torus';
        torus.userData.shapeName = '圆环体';
        return torus;
    },

    // 金字塔
    createPyramid: function(color = 0xfa709a) {
        const geometry = new THREE.ConeGeometry(1.5, 2.5, 4);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 100,
            specular: 0x444444
        });
        const pyramid = new THREE.Mesh(geometry, material);
        pyramid.userData.shapeType = 'pyramid';
        pyramid.userData.shapeName = '金字塔';
        return pyramid;
    },

    // 长方体
    createRectangular: function(color = 0x667eea) {
        const geometry = new THREE.BoxGeometry(3, 2, 1.5);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 100,
            specular: 0x444444
        });
        const rect = new THREE.Mesh(geometry, material);
        rect.userData.shapeType = 'rectangular';
        rect.userData.shapeName = '长方体';
        return rect;
    },

    // 获取所有几何体类型
    getAllShapes: function() {
        return [
            { type: 'cube', name: '立方体', emoji: '📦', color: 0x667eea },
            { type: 'sphere', name: '球体', emoji: '⚽', color: 0xf093fb },
            { type: 'cylinder', name: '圆柱体', emoji: '🛢️', color: 0xf5576c },
            { type: 'cone', name: '圆锥体', emoji: '🎉', color: 0x4facfe },
            { type: 'torus', name: '圆环体', emoji: '🍩', color: 0x43e97b },
            { type: 'pyramid', name: '金字塔', emoji: '🔺', color: 0xfa709a },
            { type: 'rectangular', name: '长方体', emoji: '📐', color: 0x43e97b }
        ];
    },

    // 根据类型创建几何体
    createByType: function(type, color) {
        const shapeMap = {
            'cube': this.createCube,
            'sphere': this.createSphere,
            'cylinder': this.createCylinder,
            'cone': this.createCone,
            'torus': this.createTorus,
            'pyramid': this.createPyramid,
            'rectangular': this.createRectangular
        };

        if (shapeMap[type]) {
            return shapeMap[type].call(this, color);
        }
        
        // 默认返回立方体
        console.warn('Unknown shape type:', type, 'using cube instead');
        return this.createCube(color);
    }
};

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Shapes;
}
