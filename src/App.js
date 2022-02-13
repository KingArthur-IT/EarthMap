import * as THREE from 'three';

//scene
let canvas, camera, scene, renderer;
//params
let params = {
	sceneWidth: 400,
	sceneHeight: 400,
	canvasPositionX: 0,
	canvasPositionY: 0,
	EarthTextSrc: './assets/EarthTexture.png',
	EarthMeshName: 'EarthMesh',
	canvasId: 'earthCanvas',
	containerId: 'earthScene',
	recreaseRotationRate: 0.1
}
let raycaster = new THREE.Raycaster(), 
	EarthActive = {
		isActive: false,
		mouse: new THREE.Vector2(),
		frameRotationValue: 0,
		rotationDecreaseStep: 0.0005,
		minRotationValue: 0.0075
	}

class App {
	init() {
		canvas = document.getElementById(params.canvasId);
		setSizes();
		
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(40.0, params.sceneWidth / params.sceneHeight, 0.1, 5000);
		camera.position.set(0, 0, 100);

		const light = new THREE.AmbientLight(0xffffff);
		scene.add(light);

		//Load texture
		let textureLoader = new THREE.TextureLoader();
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
		renderer.setClearColor(0xffffff, 0);

		renderer.render(scene, camera);
		window.addEventListener('resize', onWindowResize, false );
		canvas.addEventListener('mousemove', onMouseMove, false);
		canvas.addEventListener('mousedown', onMouseDown, false);
		canvas.addEventListener('mouseup', onMouseUp, false);

		animate();
	}
}

function setSizes(){
	let size = Math.min(document.getElementById(params.containerId).getBoundingClientRect().height / 2.0, document.getElementById(params.containerId).getBoundingClientRect().width);
	params.sceneWidth = params.sceneHeight = size;
	canvas.setAttribute('width', 	params.sceneWidth);
	canvas.setAttribute('height', 	params.sceneHeight);
	params.canvasPositionX = canvas.getBoundingClientRect().left;
	params.canvasPositionY = canvas.getBoundingClientRect().top;
}

function onMouseMove(event) {
	if (EarthActive.isActive){
		const mouseVector = new THREE.Vector2();
		mouseVector.x = ((event.clientX - params.canvasPositionX) / params.sceneWidth) * 2 - 1;
		mouseVector.y = - ((event.clientY - params.canvasPositionY) / params.sceneHeight) * 2 + 1;

		EarthActive.frameRotationValue = params.recreaseRotationRate * (mouseVector.x - EarthActive.mouse.x);
	}
}

function onMouseDown(event) {
	const clickVector = new THREE.Vector2();
	clickVector.x = ((event.clientX - params.canvasPositionX) / params.sceneWidth) * 2 - 1;
	clickVector.y = - ((event.clientY - params.canvasPositionY) / params.sceneHeight) * 2 + 1;
	
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
	setSizes();
	camera.aspect = params.sceneWidth / params.sceneHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(params.sceneWidth, params.sceneHeight);
}

function animate() {
	if (Math.abs(EarthActive.frameRotationValue) > EarthActive.rotationDecreaseStep){
		EarthActive.frameRotationValue -= Math.sign(EarthActive.frameRotationValue) * EarthActive.rotationDecreaseStep;
	}
	let fixedRotationStep = (Math.sign(EarthActive.frameRotationValue) >= 0 ? 1 : -1) * EarthActive.minRotationValue;
	scene.getObjectByName(params.EarthMeshName).rotation.y += (EarthActive.frameRotationValue + fixedRotationStep);
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

export default App;
