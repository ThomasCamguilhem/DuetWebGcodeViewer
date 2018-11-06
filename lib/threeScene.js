// Our Javascript will go here.
var scene;
var layStart = 0;
var layEnd = 100;
function initScene()
{
	scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, 400 / 600, 0.1, 10000 );
	
	var space = $("#threeDisplay")[0];
	var renderer = new THREE.WebGLRenderer({
                    preserveDrawingBuffer: true
                });
	renderer.setSize( 400, 600 );
	
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
		
	//var controls = new THREE.OrbitControls( camera , $("#threeDisplay")[0]);
	//controls.enableRotate = false;
	
	camera.position.set(0, 400, 0);
	camera.rotation.set(-Math.PI/2, 0, -Math.PI/2);

	//controls.update();
	
	
	function animate() {	
		//controls.update();
		requestAnimationFrame( animate );
		renderer.render( scene, camera );
		if (hasGeoToRender)
			renderLoop();
		//light.position.z -= 0.1;
	}
	animate();
}

function redrawScene()
{
	layStart = parseInt($("#firstLayer")[0].value);
	layEnd = parseInt($("#lastLayer")[0].value);
	if (layStart == undefined)
		layStart = 0;
	if (layEnd == undefined)
		layEnd = nbLayers;
	for(var key in pointCloud)
	{
		if(key != "length" )
		{
			for (var layer in pointCloud[key])
			{
				switch (slicer)
				{
					case Slicer.CURA:
						scene.getObjectByName(key+"_"+layer).visible = (($("#"+key.toLowerCase()+"_cura")[0].checked) && (layer >= layStart && layer <= layEnd));
						break;
					case Slicer.SIMP:
						scene.getObjectByName(key+"_"+layer).visible = (($("#"+key.toLowerCase()+"_simp")[0].checked) && (layer >= layStart && layer <= layEnd));
						break;						
					case Slicer.SLIC:
						scene.getObjectByName(key+"_"+layer).visible = (($("#"+key.toLowerCase()+"_slic")[0].checked) && (layer >= layStart && layer <= layEnd));
						break;
				}
			}
		}
	}
	
}