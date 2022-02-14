import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry'

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
	recreaseRotationRate: 0.1,
	currentSelectedCountry: ''
}
let raycaster = new THREE.Raycaster(), 
	earthParams = {
		isActive: false,
		mouse: new THREE.Vector2(),
		frameRotationValue: 0,
		rotationDecreaseStep: 0.0005,
		minRotationValue: 0.0075,
		isHover: 1
	},
	countriesArray = [
		{
			name: 'China',
			coodsOnEarth: new THREE.Vector3(9.87, 2.24, -22.8),
			normal: new THREE.Euler(0, 0, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/China.png'
		},
		{
			name: 'UnitedKingdom',
			coodsOnEarth: new THREE.Vector3(21, 10.7, 9.96),
			normal: new THREE.Euler(0, 0.6, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/UnitedKingdom.png'
		},{
			name: 'Indonesia',
			coodsOnEarth: new THREE.Vector3(4.41, -8.48, -23.05),
			normal: new THREE.Euler(0, 0, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/Indonesia.png'
		},{
			name: 'Philippines',
			coodsOnEarth: new THREE.Vector3(1.805, -4.96, -24.3),
			normal: new THREE.Euler(0, 0, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/Philippines.png'
		},{
			name: 'Thailand',
			coodsOnEarth: new THREE.Vector3(9.4, -3.71, -22.83),
			normal: new THREE.Euler(0, 0, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/Thailand.png'
		},
	]

class App {
	init() {
		canvas = document.getElementById(params.canvasId);
		setSizes();
		
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(40.0, params.sceneWidth / params.sceneHeight, 0.1, 5000);
		camera.position.set(0, 0, -100);  
		camera.rotation.set(0, Math.PI, 0);  
		scene.add(camera)

		const light = new THREE.AmbientLight(0xffffff);
		scene.add(light);

		//Load texture and Create Earth Mesh
		let textureLoader = new THREE.TextureLoader();
		let EarthTexture = textureLoader.load(params.EarthTextSrc, function (texture) {
			texture.minFilter = THREE.LinearFilter;			
		});
		const EarthGeometry = new THREE.SphereGeometry( 25, 32, 32 );
		const EarthMaterial = new THREE.MeshBasicMaterial( { map: EarthTexture, transparent: true, opacity: 0.7, side: THREE.DoubleSide } );
		const EarthMesh = new THREE.Mesh( EarthGeometry, EarthMaterial );
		EarthMesh.name = params.EarthMeshName;
		scene.add( EarthMesh );

		//decal countries
		countriesArray.forEach((countryObject) => {
			let countryTexture = textureLoader.load(countryObject.imgPath, function (texture) {
				texture.minFilter = THREE.LinearFilter;			
			});
			const decalMaterial = new THREE.MeshPhongMaterial({
				map: countryTexture,
				flatShading: false,
				shininess: 30, 
				transparent: true,
				depthTest: true,
				depthWrite: false,
				polygonOffset: true,
				polygonOffsetFactor: -4,
				wireframe: false,
				side: THREE.FrontSide
			});
			const decalGeometry = new DecalGeometry(
				EarthMesh,
				countryObject.coodsOnEarth,
				countryObject.normal,
				countryObject.size
			);
			const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
			decalMesh.name = countryObject.name;
			EarthMesh.add(decalMesh);
		});

		//renderer
		renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
		renderer.setClearColor(0xffffff, 0);

		renderer.render(scene, camera);
		window.addEventListener('resize', onWindowResize, false );
		canvas.addEventListener('mousemove', onMouseMove, false);
		canvas.addEventListener('mousedown', onMouseDown, false);
		canvas.addEventListener('mouseup', onMouseUp, false);
		//toggle selected country
		document.getElementById('earthScene').addEventListener('click', () => {
			countriesArray.map((i) => {return i.name}).forEach((countryName) => {
				document.getElementById(countryName).classList.remove("selected");
				if (countryName === params.currentSelectedCountry){
					document.getElementById(countryName).classList.add("selected");
					params.currentSelectedCountry = '';
				}
			})
		})

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
	//default values
	document.body.style.cursor = 'default';
	earthParams.isHover = 1;
	//mouse vector
	const mouseVector = new THREE.Vector2();
	mouseVector.x = ((event.clientX - params.canvasPositionX) / params.sceneWidth) * 2 - 1;
	mouseVector.y = - ((event.clientY - params.canvasPositionY) / params.sceneHeight) * 2 + 1;
	//raycast
	raycaster.setFromCamera(mouseVector, camera);
	raycaster.layers.enableAll()
	let intersects = []
	raycaster.intersectObjects(scene.children, true, intersects);
	//stop rotating on hover
	const isEarth = (element) => element.object.name === params.EarthMeshName;
	if (intersects.some(isEarth)){
		earthParams.isHover = 0;
	};
	//change curson on country hover
	countriesArray.map((i) => {return i.name}).forEach((countryName) => {
		if (intersects.some((e) => e.object.name == countryName)){
			document.body.style.cursor = 'pointer'
		}
	})
	//move earth
	if (earthParams.isActive){
		earthParams.isHover = 1;
		earthParams.frameRotationValue = params.recreaseRotationRate * (mouseVector.x - earthParams.mouse.x);
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
	
	//move earth only on click on it
	const isEarth = (element) => element.object.name === params.EarthMeshName;
	if (intersects.some(isEarth)){
		earthParams.isActive = true;
		earthParams.mouse.copy(clickVector);
	};

	//define click on country decal
	countriesArray.map((i) => {return i.name}).forEach((countryName) => {
		if (intersects.some((e) => e.object.name == countryName)){
			params.currentSelectedCountry = countryName;
			//document.getElementById(countryName).classList.add("selected");
		}
	})
}

function onMouseUp() {
	earthParams.isActive = false;
}

function onWindowResize() {
	setSizes();
	camera.aspect = params.sceneWidth / params.sceneHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(params.sceneWidth, params.sceneHeight);
}

function animate() {
	
	if (Math.abs(earthParams.frameRotationValue) > earthParams.rotationDecreaseStep){
		earthParams.frameRotationValue -= Math.sign(earthParams.frameRotationValue) * earthParams.rotationDecreaseStep;
	}
	let fixedRotationStep = (Math.sign(earthParams.frameRotationValue) >= 0 ? 1 : -1) * earthParams.minRotationValue;
	scene.getObjectByName(params.EarthMeshName).rotation.y += (earthParams.frameRotationValue + fixedRotationStep) * earthParams.isHover;
	
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

export default App;
