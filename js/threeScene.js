// Our Javascript will go here.
var layStart = 0;
var layEnd = 100;
 var camera, scene, renderer;
var strDownloadMime = "image/octet-stream";
var statsfps;
var controls;
var needsRedraw = false;

function initScene()
{
	statsfps = new Stats();
	statsfps.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( statsfps.dom );
	
	 var saveLink = document.createElement('div');
        saveLink.style.position = 'absolute';
        saveLink.style.top = '10px';
        saveLink.style.width = '100%';
        saveLink.style.color = 'white !important';
        saveLink.style.textAlign = 'center';
        saveLink.innerHTML =
            '<a href="#" id="saveLink">Save Frame</a>';
        document.body.appendChild(saveLink);
        document.getElementById("saveLink").addEventListener('click', saveAsImage);
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, 600 / 600, 0.1, 10000 );
	//camera = new THREE.OrthographicCamera( -300, 300, 300, -300, 0.1, 1000 );
	
	var space = $("#threeDisplay")[0];
	renderer = new THREE.WebGLRenderer({
                    preserveDrawingBuffer: true
                });
	renderer.setSize( 600, 600 );
	
	renderer.shadowMapEnabeled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	
	space.appendChild( renderer.domElement );
	
	var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
	scene.add(ambientLight);
	
	var light = new THREE.PointLight( 0xffffff, 1, 600);
	light.position.set( 0, 295, 0 );
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 1000
	scene.add( light );
	
    helper = new THREE.PointLightHelper(light, 0.1);
	scene.add(helper);
	
	var geometry = new THREE.CircleGeometry( 190, 30);
	var material = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 } );
	var buildPlate = new THREE.Mesh( geometry, material );
	buildPlate.receiveShadow = true;
	buildPlate.rotation.x = -Math.PI/2;
	buildPlate.position.y = 0;
	var topMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff,  side: THREE.BackSide} );
	var topCircle = new THREE.Mesh( geometry, topMaterial );
	topCircle.rotation.x = -Math.PI/2;
	topCircle.position.y = 600;
	scene.add( topCircle );
	scene.add( buildPlate );
	geometry = new THREE.CylinderGeometry( 190, 190, 600, 32, 1, true, 0, Math.PI );
	material = new THREE.MeshPhongMaterial({color: 0xe0e0e0, side: THREE.BackSide} );
	var buildVolume = new THREE.Mesh( geometry, material );
	//buildVolume.rotation.y = Math.PI/2;
	//buildVolume.rotation.x = Math.PI/2;
	buildVolume.position.y = 300;
	scene.add( buildVolume );
		
	controls = new THREE.OrbitControls( camera , $("#threeDisplay")[0]);
	//controls.autoRotate = true;
	controls.autoRotateSpeed = 1;
	controls.panningMode = 1;
	
	//  horizontally angle control
	//controls.minAzimuthAngle = -Math.PI / 4;
	//controls.maxAzimuthAngle = Math.PI / 4;
	 
	// vertical angle control
	controls.minPolarAngle = -Math.PI / 2;
	controls.maxPolarAngle = Math.PI / 2;
	
	// camera center
	camera.position.set(-400, 250, 0);
	// camera positive
	//camera.position.set(-100, 150, 100);
	//camera.rotation.set(-Math.PI/2, 0, -Math.PI/2);
	controls.update();
	
	function animate() {
		statsfps.begin();
		date = Date.now() * 0.001;
		//camera.position.x = Math.sin(date) * (camera.position.x-pos.x+100)
		//camera.position.z = Math.cos(date) * (camera.position.z-pos.z+100)
		//camera.rotation.set( date, date, date);
		controls.update();
		requestAnimationFrame( animate );
		renderer.render( scene, camera );
		if (hasGeoToRender)
			renderLoop();
		if (needsRedraw)
			redrawLoop();
		//light.position.z -= 0.1;
		statsfps.end();
	}
	animate();
}

function saveAsImage() {
	var imgData, imgNode;

	try {
		var strMime = "image/jpeg";
		imgData = renderer.domElement.toDataURL(strMime);

		saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg");

	} catch (e) {
		console.log(e);
		return;
	}

}

var i;
var nbKey;
var keys = [];
var lays = [];
var lay;
var thisLay = 0;

function initRedraw()
{
	needsRedraw = true;
	//layStart = parseInt($("#firstLayer")[0].value);
	//layEnd = parseInt($("#lastLayer")[0].value);
	if (layStart == undefined)
		layStart = 0;
	if (layEnd == undefined)
		layEnd = nbLayers;
	
	i = 0;
	lay = 0;
	nbKey = pointCloud.length;
	keys = [];
	for(var key in pointCloud)
	{
		if(key != "length" )
		{
			keys.push(key)
		}
	}
	for(var layer in pointCloud[keys[0]])
	{
		lays.push(layer);
	}
	var color = new THREE.Color().setHSL((i/nbKey), 0.75, 0.5);
	//console.log(key +" ("+color.r+","+color.g+","+color.b+")")
	pointMaterial = new THREE.LineBasicMaterial({color: color, width:2});
	meshMaterial = new THREE.MeshPhongMaterial({color: color});
	
}

function redrawLoop()
{
	if (i == keys.length)
	{
		needsRedraw = false;
		
		return;
	}
	if (lays[lay] != undefined )
	{
		var start = new Date();
		do {
			switch (slicer)
			{
				case Slicer.CURA:
					//redrawScene(keys[i], lays[lay],
						//(($("#"+keys[i].toLowerCase()+"_cura")[0].checked) && (lay >= layStart && lay <= layEnd)));
					break;
				case Slicer.SIMP:
					//redrawScene(keys[i], lays[lay],
							//(($("#"+keys[i].toLowerCase()+"_simp")[0].checked) && (lay >= layStart && lay <= layEnd)));
					break;						
				case Slicer.SLIC:
					//redrawScene(keys[i], lays[lay],
							// (($("#"+keys[i].toLowerCase()+"_slic")[0].checked) && (lay >= layStart && lay <= layEnd)));
					break;
			}
			lay ++;
		}while ((new Date() - start < 10) && (lays[lay] != undefined ))
	} else if (i < keys.length)
	{
		i++;
		lays = [];
		for(var layer in pointCloud[keys[i]])
		{
			lays.push(layer);
		}
		var color = new THREE.Color().setHSL((i/nbKey), 0.75, 0.5);
		//console.log(key +" ("+color.r+","+color.g+","+color.b+")")
		pointMaterial = new THREE.LineBasicMaterial({color: color, linewidth: 2});
		meshMaterial = new THREE.MeshPhongMaterial({color: color});
		lay = 0;
	}
}

function redrawScene(key, layer, visible)
{
	if (scene.getObjectByName(key+"_"+layer))
		scene.getObjectByName(key+"_"+layer).visible = visible
}