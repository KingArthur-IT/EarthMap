import * as THREE from 'three';

//scene
let canvas, scene, renderer;
//params
let params = {
	sceneWidth: 850,
	sceneHeight: 450,
	bgSrc: './assets/img/interaction_bg.jpeg',
	EarthTextSrc: './assets/Earth.png',
}

class App {
	init() {
		canvas = document.getElementById('canvas');
		canvas.setAttribute('width', 	params.sceneWidth);
		canvas.setAttribute('height', 	params.sceneHeight);
		
		scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(40.0, params.sceneWidth / params.sceneHeight, 0.1, 5000);
		camera.position.set(0, 0, 100);

		const light = new THREE.AmbientLight(0xffffff);
		scene.add(light);

		let textureLoader = new THREE.TextureLoader();
		let EarthTexture = textureLoader.load(params.EarthTextSrc, function (texture) {
			texture.minFilter = THREE.LinearFilter;
		});
		const EarthGeometry = new THREE.SphereGeometry( 15, 32, 16 );
		const EarthMaterial = new THREE.MeshBasicMaterial( { map: EarthTexture } );
		const EarthMesh = new THREE.Mesh( EarthGeometry, EarthMaterial );
		scene.add( EarthMesh );

		//renderer
		renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
		renderer.setClearColor(0xffffff);

		//Load background texture
		/*
		let loader = new THREE.TextureLoader();
		loader.load(params.bgSrc, function (texture) {
			texture.minFilter = THREE.LinearFilter;
			scene.background = texture;
		});
		*/
		renderer.render(scene, camera);
		//window.addEventListener( 'resize', onWindowResize, false );
		canvas.addEventListener('mousemove', onMouseMove, false);
		canvas.addEventListener('mousedown', onMouseDown, false);

		animate();
	}
}

function onMouseMove(event) {
}

function onMouseDown() {
	
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

export default App;
