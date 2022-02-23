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
	EarthTextSrc: './assets/map.png',
	MeridiansTextSrc: './assets/meridians.png',
	EarthMeshName: 'EarthMesh',
	EarthGroupName: 'EarthGroup',
	canvasId: 'earthCanvas',
	containerId: 'earthScene',
	recreaseRotationRate: 0.1,
	currentSelectedCountry: '',
	isEarthRotatingToTarget: false,
	rotationTargetAngle: 0,
	rotationTargetAngleStep: 0.025,
}
let raycaster = new THREE.Raycaster(), 
	earthParams = {
		isActive: false,
		mouse: new THREE.Vector2(),
		frameRotationValue: 0,
		rotationDecreaseStep: 0.0005,
		minRotationValue: 0.0025,
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
			pulseScaleValue: 5,
			pulseDirection: -1,
			pulseStep: 2
		},
		{
			name: 'UnitedKingdom',
			coodsOnEarth: new THREE.Vector3(21, 10.7, 9.96),
			normal: new THREE.Euler(0, 0.6, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/UnitedKingdom.png',
			pulseScaleValue: 5,
			pulseDirection: -1,
			pulseStep: 3
		},{
			name: 'Indonesia',
			coodsOnEarth: new THREE.Vector3(4.41, -8.48, -23.05),
			normal: new THREE.Euler(0, 0, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/Indonesia.png',
			pulseScaleValue: 5,
			pulseDirection: -1,
			pulseStep: 3
		},{
			name: 'Philippines',
			coodsOnEarth: new THREE.Vector3(1.805, -4.96, -24.3),
			normal: new THREE.Euler(0, 0, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/Philippines.png',
			pulseScaleValue: 5,
			pulseDirection: -1,
			pulseStep: 3
		},{
			name: 'Thailand',
			coodsOnEarth: new THREE.Vector3(9.4, -3.71, -22.83),
			normal: new THREE.Euler(0, 0, 0),
			size: new THREE.Vector3(4, 4, 4),
			imgPath: './assets/Countries/Thailand.png',
			pulseScaleValue: 5,
			pulseDirection: -1,
			pulseStep: 2
		},
	];
let decals = {
	array: [],
	step: 0.003,
	min: 0.7,
	current: 0.7,
	max: 1.1,
	hoveredName: '',
	hoverColor: {
		r: 0.93,
		g: 0.11,
		b: 0.14
	},
	hoverEmissiveColor: {
		intensity: 0.3,
		r: 1,
		g: 0,
		b: 0
	},
}

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
		const EarthGroup = new THREE.Object3D();
		EarthGroup.name = params.EarthGroupName;
		
		let textureLoader = new THREE.TextureLoader();
		let EarthTexture = textureLoader.load(params.EarthTextSrc, function (texture) {
			texture.minFilter = THREE.NearestFilter;	
			texture.magFilter = THREE.NearestFilter	
		});
		let MeridiansTexture = textureLoader.load(params.MeridiansTextSrc, function (texture) {
			texture.minFilter = THREE.LinearMipMapLinearFilter;	
			texture.magFilter = THREE.NearestFilter
		});
		const EarthGeometry = new THREE.SphereGeometry( 25, 64, 64 );
		const EarthMaterial = new THREE.MeshBasicMaterial({ 
			map: EarthTexture, 
			transparent: true, 
			opacity: 0.8, 
			side: THREE.DoubleSide, 
		});
		const EarthMesh = new THREE.Mesh( EarthGeometry, EarthMaterial );
		EarthMesh.name = params.EarthMeshName;
		EarthGroup.add(EarthMesh);
		
		const MeridiansMaterial = new THREE.MeshPhysicalMaterial({ 
			map: MeridiansTexture, 
			transparent: true, 
			opacity: 0.8, 
			side: THREE.DoubleSide, 
		});
		const MeridiansMesh = new THREE.Mesh( EarthGeometry, MeridiansMaterial );
		EarthGroup.add(MeridiansMesh);

		scene.add( EarthGroup );

		//scale koeff for decals
		decals.array.push(1.2)
		while (decals.current < decals.max) {
			decals.array.push(decals.current);
			decals.current += decals.step;
		}
		//decal countries
		countriesArray.forEach((countryObject) => {
			//decal params
			countryObject.pulseScaleValue = Math.round(Math.random() * (decals.array.length - 1));
			//decal objects
			let countryTexture = textureLoader.load(earthParams.countryLabelPath, function (texture) {
				texture.minFilter = THREE.LinearMipMapLinearFilter;	
				texture.magFilter = THREE.NearestFilter		
			});
			const decalMaterial = new THREE.MeshStandardMaterial({
				map: countryTexture,
				transparent: true,
				depthTest: true,
				depthWrite: false,
				polygonOffset: true,
				polygonOffsetFactor: -4,
				wireframe: false,
				side: THREE.FrontSide
			});

			for (let index = 0; index < decals.array.length; index++) {
				const koeff = decals.array[index];
				const decalGeometry = new DecalGeometry(
					EarthMesh,
					countryObject.coodsOnEarth,
					countryObject.normal,
					new THREE.Vector3(koeff * countryObject.size.x, koeff * countryObject.size.y, koeff * countryObject.size.z)
				);
				const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
				decalMesh.name = countryObject.name + index;
				EarthMesh.add(decalMesh);
			}
		});
		//renderer
		renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true});
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
		//toggle selected country
		document.getElementById('earthScene').addEventListener('click', () => {
			params.isEarthRotatingToTarget = false;
			countriesArray.map((i) => {return i.name}).forEach((countryName) => {
				document.getElementById(countryName).classList.remove("selected");
				if (countryName === params.currentSelectedCountry){
					document.getElementById(countryName).classList.add("selected");
					params.isEarthRotatingToTarget = true;
					if (countryName === 'UnitedKingdom')
						params.rotationTargetAngle = 1.98;
					else
						params.rotationTargetAngle = 0.3;
					setDecalColor(countryName, true);
				} else 
				setDecalColor(countryName, false);
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

function onMouseMove(event) {
	//default values
	document.body.style.cursor = 'default';
	params.currentSelectedCountry = '';
	//mouse vector
	const mouseVector = new THREE.Vector2();
	mouseVector.x = ((event.offsetX) / params.sceneWidth) * 2 - 1;
	mouseVector.y = - ((event.offsetY) / params.sceneHeight) * 2 + 1;
	//raycast
	raycaster.setFromCamera(mouseVector, camera);
	raycaster.layers.enableAll()
	let intersects = []
	raycaster.intersectObjects(scene.children, true, intersects);
	//stop rotating on hover
	const isEarth = (element) => element.object.name === params.EarthMeshName;
	let onDecalHoverCountruName = '';
	if (intersects.some(isEarth)){
		earthParams.isHover = true;
		//change curson on country hover
		countriesArray.forEach((country) => {
			if (intersects.some((e) => e.object.name === country.name + '0'))
			{
				document.body.style.cursor = 'pointer';
				document.getElementById(country.name).classList.add("selected");
				params.currentSelectedCountry = country.name;
				onDecalHoverCountruName = country.name;
				setDecalColor(country.name, true);
			}
		})
	} else {
		earthParams.isHover = false;
		earthParams.hoverValue = 1;
	}
	countriesArray.map((i) => {return i.name}).forEach((countryName) => {
		if (onDecalHoverCountruName !== countryName){
			document.getElementById(countryName).classList.remove("selected");
			setDecalColor(countryName, false)
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

	params.currentSelectedCountry = '';
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
		if (intersects.some((e) => e.object.name.includes(countryName))){
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
		if (intersects.some((e) => e.object.name.includes(countryName))){
			params.currentSelectedCountry = idNodeHasClass(countryName) ? '' : countryName;
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
	//Earth rotate
	if (params.isEarthRotatingToTarget){
		let normolizedCurrentAngle = scene.getObjectByName(params.EarthGroupName).rotation.y;
		normolizedCurrentAngle = Math.abs(normolizedCurrentAngle) > 2 * Math.PI ? normolizedCurrentAngle % (2 * Math.PI) : normolizedCurrentAngle;
		normolizedCurrentAngle = normolizedCurrentAngle < 0 ? normolizedCurrentAngle + 2 * Math.PI : normolizedCurrentAngle;
		scene.getObjectByName(params.EarthGroupName).rotation.y = normolizedCurrentAngle;
		let direction = 1;
		if (Math.abs(params.rotationTargetAngle - normolizedCurrentAngle) < Math.PI)
			direction = Math.sign(params.rotationTargetAngle - normolizedCurrentAngle);
		else direction = Math.sign(Math.PI * 2 + params.rotationTargetAngle - normolizedCurrentAngle);
		if (Math.abs(normolizedCurrentAngle - params.rotationTargetAngle) > params.rotationTargetAngleStep){
			scene.getObjectByName(params.EarthGroupName).rotation.y += direction * params.rotationTargetAngleStep;
		}
	}
	else {
		if (Math.abs(earthParams.frameRotationValue) > earthParams.rotationDecreaseStep){
			earthParams.frameRotationValue -= Math.sign(earthParams.frameRotationValue) * earthParams.rotationDecreaseStep;
		}
		else earthParams.frameRotationValue = earthParams.minRotationValue;
		let fixedRotationStep = (Math.sign(earthParams.frameRotationValue) >= 0 ? 1 : -1) * earthParams.minRotationValue;
		if (earthParams.isHover) earthParams.hoverValue *= 0.96;
		if (earthParams.hoverValue < 0.1) earthParams.hoverValue = 0;
		scene.getObjectByName(params.EarthGroupName).rotation.y += (earthParams.frameRotationValue + fixedRotationStep) * earthParams.hoverValue;
	}
	
	//pulse country decals
	const MIN_SLIDE = 1, MAX_SLIDE = Math.round((decals.max - decals.min) / decals.step);
	countriesArray.forEach((country) => {
		decals.array.forEach((element, index) => {
			scene.getObjectByName(country.name + index).visible = false;
		});
		scene.getObjectByName(country.name + country.pulseScaleValue).visible = true;
		country.pulseScaleValue += country.pulseStep * country.pulseDirection;
		if (country.pulseScaleValue < MIN_SLIDE){
			country.pulseDirection *= -1;
			country.pulseScaleValue = MIN_SLIDE; 
		}
		if (country.pulseScaleValue > MAX_SLIDE){
			country.pulseDirection *= -1;
			country.pulseScaleValue = MAX_SLIDE; 
		}
	});
	
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

function setDecalColor(decalName, isHover){
	decals.array.forEach((element, index) => {
		if (isHover){
			scene.getObjectByName(decalName + index).material.color.r = decals.hoverColor.r;
			scene.getObjectByName(decalName + index).material.color.g = decals.hoverColor.g;
			scene.getObjectByName(decalName + index).material.color.b = decals.hoverColor.b;
			scene.getObjectByName(decalName + index).material.emissive.r = decals.hoverEmissiveColor.r;
			scene.getObjectByName(decalName + index).material.emissive.g = decals.hoverEmissiveColor.g;
			scene.getObjectByName(decalName + index).material.emissive.b = decals.hoverEmissiveColor.b;
			scene.getObjectByName(decalName + index).material.emissiveIntensity = decals.hoverEmissiveColor.intensity;
		} else {
			scene.getObjectByName(decalName + index).material.color.r = 1;
			scene.getObjectByName(decalName + index).material.color.g = 1;
			scene.getObjectByName(decalName + index).material.color.b = 1;
			scene.getObjectByName(decalName + index).material.emissive.r = 1;
			scene.getObjectByName(decalName + index).material.emissive.g = 1;
			scene.getObjectByName(decalName + index).material.emissive.b = 1;
			scene.getObjectByName(decalName + index).material.emissiveIntensity = 0;
		}
	});
}

export default App;
