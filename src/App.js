import * as THREE from 'three';
import { NearestFilter } from 'three';
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
		isHover: false,
		hoverValue: 1,
		countryLabelPath: './assets/country-label.png'
	},
	countriesArray = [
		{
			name: 'China',
			coodsOnEarth: new THREE.Vector3(9.87, 2.24, -22.8),
			normal: new THREE.Euler(0, 0, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/China.png',
			pulseScaleValue: 1.0,
			pulseAmplitude: 0.1,
			pulseChangeStep: 0.001,
			pulseDirection: 1
		},
		{
			name: 'UnitedKingdom',
			coodsOnEarth: new THREE.Vector3(21, 10.7, 9.96),
			normal: new THREE.Euler(0, 0.6, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/UnitedKingdom.png',
			pulseScaleValue: 1.0,
			pulseAmplitude: 0.1,
			pulseChangeStep: 0.001,
			pulseDirection: 1
		},{
			name: 'Indonesia',
			coodsOnEarth: new THREE.Vector3(4.41, -8.48, -23.05),
			normal: new THREE.Euler(0, 0, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/Indonesia.png',
			pulseScaleValue: 1.0,
			pulseAmplitude: 0.1,
			pulseChangeStep: 0.001,
			pulseDirection: 1
		},{
			name: 'Philippines',
			coodsOnEarth: new THREE.Vector3(1.805, -4.96, -24.3),
			normal: new THREE.Euler(0, 0, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/Philippines.png',
			pulseScaleValue: 1.0,
			pulseAmplitude: 0.1,
			pulseChangeStep: 0.001,
			pulseDirection: 1
		},{
			name: 'Thailand',
			coodsOnEarth: new THREE.Vector3(9.4, -3.71, -22.83),
			normal: new THREE.Euler(0, 0, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/Thailand.png',
			pulseScaleValue: 1.0,
			pulseAmplitude: 0.1,
			pulseChangeStep: 0.001,
			pulseDirection: 1
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
			texture.minFilter = THREE.NearestMipmapLinearFilter;	
			texture.magFilter = THREE.NearestFilter		
		});
		const EarthGeometry = new THREE.SphereGeometry( 25, 32, 32 );
		const EarthMaterial = new THREE.MeshBasicMaterial( { map: EarthTexture, transparent: true, opacity: 0.8, side: THREE.DoubleSide } );
		const EarthMesh = new THREE.Mesh( EarthGeometry, EarthMaterial );
		EarthMesh.name = params.EarthMeshName;
		scene.add( EarthMesh );

		//decal countries
		countriesArray.forEach((countryObject) => {
			let countryTexture = textureLoader.load(earthParams.countryLabelPath, function (texture) {
				texture.minFilter = THREE.LinearMipMapLinearFilter;	
				texture.magFilter = THREE.NearestFilter		
			});
			const decalMaterial = new THREE.MeshStandardMaterial({
				map: countryTexture,
				flatShading: false,
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
		renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance", autoClear: true });
		renderer.setPixelRatio(params.sceneWidth / params.sceneHeight);

		renderer.render(scene, camera);
		window.addEventListener('resize', onWindowResize, false );
		document.querySelector('#UnitedKingdom .country-item__header').addEventListener('click', () => {
			params.currentSelectedCountry = idNodeHasClass('UnitedKingdom') ? '' : 'UnitedKingdom';
		})
		document.querySelector('#Thailand .country-item__header').addEventListener('click', () => {
			params.currentSelectedCountry =idNodeHasClass('Thailand') ? '' : 'Thailand';
		})
		document.querySelector('#Philippines .country-item__header').addEventListener('click', () => {
			params.currentSelectedCountry = idNodeHasClass('Philippines') ? '' : 'Philippines';
		})
		document.querySelector('#China .country-item__header').addEventListener('click', () => {
			params.currentSelectedCountry = idNodeHasClass('China') ? '' : 'China';
		})
		document.querySelector('#Indonesia .country-item__header').addEventListener('click', () => {
			params.currentSelectedCountry = idNodeHasClass('Indonesia') ? '' : 'Indonesia';
		})
		//mouse
		canvas.addEventListener('mousemove', onMouseMove, false);
		canvas.addEventListener('mousedown', onMouseDown, false);
		canvas.addEventListener('mouseup', onMouseUp, false);
		//touch
		canvas.addEventListener("touchmove", onTouchMove);    
		canvas.addEventListener("touchstart", onTouchStart);
		canvas.addEventListener("touchend",  onMouseUp);
		//moveCountryLabel
		document.getElementById('earthScene').addEventListener('mousemove', moveCountryLabel, false)
		//toggle selected country
		document.getElementById('earthScene').addEventListener('click', () => {
			countriesArray.map((i) => {return i.name}).forEach((countryName) => {
				document.getElementById(countryName).classList.remove("selected");
				if (countryName === params.currentSelectedCountry){
					document.getElementById(countryName).classList.add("selected");
				}
			})
			params.currentSelectedCountry = '';
		})

		animate();
	}
}

function idNodeHasClass(id){
	return document.getElementById(id)?.classList.contains('selected');
}

function setSizes(){
	const w = document.getElementById(params.containerId).getBoundingClientRect().width;
	const h = document.getElementById(params.containerId).getBoundingClientRect().height;
	let size = w > 800 ? Math.min(h * 0.9, w * 0.9) : w < 600 ? w * 0.65: w / 2.0;
	params.sceneWidth = params.sceneHeight = size;
	canvas.setAttribute('width', 	params.sceneWidth);
	canvas.setAttribute('height', 	params.sceneHeight);
	params.canvasPositionX = canvas.getBoundingClientRect().left;
	params.canvasPositionY = canvas.getBoundingClientRect().top;
}

function moveCountryLabel(event){
	const w = document.getElementById('cursor-country').offsetWidth; 
	const h = document.getElementById('cursor-country').offsetHeight;
	document.getElementById('cursor-country').style.top = (event.clientY - h/2) + 'px';
	document.getElementById('cursor-country').style.left = (event.clientX - w/2) + 'px';
}

function onMouseMove(event) {
	//default values
	document.body.style.cursor = 'default';
	//mouse vector
	const mouseVector = new THREE.Vector2();
	mouseVector.x = ((event.clientX - params.canvasPositionX) / params.sceneWidth) * 2 - 1;
	mouseVector.y = - ((event.clientY - params.canvasPositionY) / params.sceneHeight) * 2 + 1;

	document.getElementById('cursor-country').style.opacity = 0;
	//raycast
	raycaster.setFromCamera(mouseVector, camera);
	raycaster.layers.enableAll()
	let intersects = []
	raycaster.intersectObjects(scene.children, true, intersects);
	//stop rotating on hover
	const isEarth = (element) => element.object.name === params.EarthMeshName;
	if (intersects.some(isEarth)){
		earthParams.isHover = true;
	} else {
		earthParams.isHover = false;
		earthParams.hoverValue = 1;
	}
	//change curson on country hover
	countriesArray.forEach((country) => {
		if (intersects.some((e) => e.object.name == country.name)){
			document.body.style.cursor = 'pointer';
			document.getElementById('cursor-country').src = country.imgPath;
			document.getElementById('cursor-country').style.opacity = 1;
		}
	})
	//move earth
	if (earthParams.isActive){
		earthParams.hoverValue = 1;
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

	//define click on country decal - toggle currentSelectedCountry val
	countriesArray.map((i) => {return i.name}).forEach((countryName) => {
		if (intersects.some((e) => e.object.name == countryName)){
			params.currentSelectedCountry = idNodeHasClass(countryName) ? '' : countryName;
		}
	})
}

function onMouseUp() {
	earthParams.isActive = false;
}

function onTouchMove(e) {
	//default values
	document.body.style.cursor = 'default';
	//mouse vector
	const mouseVector = new THREE.Vector2();
	let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
	let touch = evt.touches[0] || evt.changedTouches[0];
	let newPosX = parseInt(touch.pageX);
	let newPosY = parseInt(touch.pageY);
	mouseVector.x = ((newPosX - params.canvasPositionX) / params.sceneWidth) * 2 - 1;
	mouseVector.y = - ((newPosY - params.canvasPositionY) / params.sceneHeight) * 2 + 1;
	
	//raycast
	raycaster.setFromCamera(mouseVector, camera);
	raycaster.layers.enableAll()
	let intersects = []
	raycaster.intersectObjects(scene.children, true, intersects);
	//change curson on country hover
	countriesArray.map((i) => {return i.name}).forEach((countryName) => {
		if (intersects.some((e) => e.object.name == countryName)){
			document.body.style.cursor = 'pointer'
		}
	})
	//move earth
	if (earthParams.isActive){
		earthParams.hoverValue = 1;
		earthParams.frameRotationValue = params.recreaseRotationRate * (mouseVector.x - earthParams.mouse.x);
	}
}

function onTouchStart(e) {
	//mouse vector
	const clickVector = new THREE.Vector2();
	let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
	let touch = evt.touches[0] || evt.changedTouches[0];
	let newPosX = parseInt(touch.pageX);
	let newPosY = parseInt(touch.pageY);
	clickVector.x = ((newPosX - params.canvasPositionX) / params.sceneWidth) * 2 - 1;
	clickVector.y = - ((newPosY - params.canvasPositionY) / params.sceneHeight) * 2 + 1;
	earthParams.isHover = false;
	earthParams.hoverValue = 1;

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
	if (earthParams.isHover) earthParams.hoverValue *= 0.96;
	if (earthParams.hoverValue < 0.1) earthParams.hoverValue = 0;
	scene.getObjectByName(params.EarthMeshName).rotation.y += (earthParams.frameRotationValue + fixedRotationStep) * earthParams.hoverValue;
	/*
	countriesArray.forEach((country) => {
		country.pulseScaleValue += country.pulseDirection * country.pulseChangeStep;
		if (Math.abs(country.pulseScaleValue - country.pulseChangeStep) < country.pulseChangeStep)
			country.pulseDirection *= -1;
		scene.getObjectByName(country.name).scale.copy(new THREE.Vector3(country.pulseScaleValue, 1, country.pulseScaleValue));
	});
	*/
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

export default App;
