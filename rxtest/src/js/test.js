var THREE = require('three');

var renderer;
function initThree() {
    width = document.getElementById('canvas-frame').clientWidth;
    height = document.getElementById('canvas-frame').clientHeight;
    renderer = new THREE.WebGLRenderer({
        antialias : true
    });
    renderer.setSize(width, height);
    document.getElementById('canvas-frame').appendChild(renderer.domElement);
    renderer.setClearColor(0xFFFFFF, 1.0);
}

var camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 600;
    camera.up.x = 0;
    camera.up.y = 1;
    camera.up.z = 0;
    camera.lookAt(0,0,0);
}

var scene;
function initScene() {
    scene = new THREE.Scene();
}

var light;
function initLight() {
    // light = new THREE.DirectionalLight(0xFF0000, 1.0, 0);
    light = new THREE.AmbientLight(0xFFFFFF);
    light.position.set(100, 100, 200);
    scene.add(light);
    light = new THREE.PointLight(0x00FF00);
    light.position.set(0,0,300);
    scene.add(light);
}

// function initObject() {
//     var geometry = new THREE.Geometry();
//     var material = new THREE.LineBasicMaterial( { vertexColors: true } );
//     var color1 = new THREE.Color( 0x444444 ), color2 = new THREE.Color( 0xFF0000 );

//     // 线的材质可以由2点的颜色决定
//     var p1 = new THREE.Vector3( -100, 0, 100 );
//     var p2 = new THREE.Vector3(  100, 0, -100 );
//     geometry.vertices.push(p1);
//     geometry.vertices.push(p2);
//    // geometry.colors.push( color1, color2 );
//     for(var i = 0; i <= 20;i++) {
//         var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
//         line.position.z = ( i * 50 ) - 500;
//         scene.add( line );

//         var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
//         line.position.x = ( i * 50 ) - 500;
//         line.rotation.y = 90 * Math.PI / 180;
//         scene.add( line );

//     }

    
//     scene.add(line);
// }
function initObject() {
    var geometry = new THREE.CylinderBufferGeometry(100,150,400);
    var material = new THREE.MeshLambertMaterial({color: 0xFFFF00});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position = new THREE.Vector3(0,0,0);
    scene.add(mesh);
}
function animation() {
    camera.position.x = camera.position.x + 1;
    renderer.render(scene, camera);
    requestAnimationFrame(animation);
}
function threeStart() {
    initThree();
    initCamera();
    initScene();
    initLight();
    initObject();
    animation();
}

document.body.onload = threeStart();