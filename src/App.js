import * as THREE from 'three';

//scene
let canvas, camera, scene, renderer;
//params
let params = {
	sceneWidth: 850,
	sceneHeight: 450,
	bgSrc: './assets/background.jpg',
	EarthTextSrc: './assets/Earth.png',
	EarthMeshName: 'EarthMesh',
	recreaseRotationRate: 0.1
}
let raycaster = new THREE.Raycaster(), 
	EarthActive = {
		isActive: false,
		mouse: new THREE.Vector2(),
		rotation: 0,
		rotationDecreaseStep: 0.0005
	}

class App {
	init() {
		canvas = document.getElementById('canvas');
		canvas.setAttribute('width', 	params.sceneWidth);
		canvas.setAttribute('height', 	params.sceneHeight);
		
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(40.0, params.sceneWidth / params.sceneHeight, 0.1, 5000);
		camera.position.set(0, 0, 100);

		const light = new THREE.AmbientLight(0xffffff);
		scene.add(light);

		//Load background texture
		let textureLoader = new THREE.TextureLoader();
		textureLoader.load(params.bgSrc, function (texture) {
			texture.minFilter = THREE.LinearFilter;
			//scene.background = texture;
		});
		
		let EarthTexture = textureLoader.load(params.EarthTextSrc, function (texture) {
			texture.minFilter = THREE.LinearFilter;			
		});
		const EarthGeometry = new THREE.SphereGeometry( 25, 32, 32 );
		const EarthMaterial = new THREE.MeshBasicMaterial( { map: EarthTexture, transparent: true, opacity: 0.7, side: THREE.DoubleSide } );
		const EarthMesh = new THREE.Mesh( EarthGeometry, EarthMaterial );
		EarthMesh.name = params.EarthMeshName;
		scene.add( EarthMesh );

		//renderer
		renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
		renderer.setClearColor(0xffffff);

		renderer.render(scene, camera);
		//window.addEventListener( 'resize', onWindowResize, false );
		canvas.addEventListener('mousemove', onMouseMove, false);
		canvas.addEventListener('mousedown', onMouseDown, false);
		canvas.addEventListener('mouseup', onMouseUp, false);

		animate();
	}
}

function onMouseMove(event) {
	if (EarthActive.isActive){
		const mouseVector = new THREE.Vector2();
		mouseVector.x = (event.clientX / params.sceneWidth) * 2 - 1;
		mouseVector.y = - (event.clientY / params.sceneHeight) * 2 + 1;

		EarthActive.rotation = 
			params.recreaseRotationRate * (mouseVector.x - EarthActive.mouse.x);
	}
}

function onMouseDown(event) {
	const clickVector = new THREE.Vector2();
	clickVector.x = (event.clientX / params.sceneWidth) * 2 - 1;
	clickVector.y = - (event.clientY / params.sceneHeight) * 2 + 1;
	
	raycaster.setFromCamera(clickVector, camera);
	raycaster.layers.enableAll()
	let intersects = []
	raycaster.intersectObjects(scene.children, true, intersects);
	
	const isEarth = (element) => element.object.name === params.EarthMeshName;
	if (intersects.some(isEarth)){
		EarthActive.isActive = true;
		EarthActive.mouse.copy(clickVector);
	}
}

function onMouseUp() {
	EarthActive.isActive = false;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	if (Math.abs(EarthActive.rotation) > EarthActive.rotationDecreaseStep){
		scene.getObjectByName(params.EarthMeshName).rotation.y += EarthActive.rotation;
		EarthActive.rotation -= Math.sign(EarthActive.rotation) * EarthActive.rotationDecreaseStep;
	}
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

export default App;
