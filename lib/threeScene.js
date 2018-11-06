// Our Javascript will go here.
var layStart = 0;
var layEnd = 100;
 var camera, scene, renderer;
var strDownloadMime = "image/octet-stream";

function initScene()
{
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
		
	//var controls = new THREE.OrbitControls( camera , $("#threeDisplay")[0]);
	//controls.enableRotate = false;
	
	// camera center
	camera.position.set(0, 250, 0);
	// camera positive
	camera.position.set(-100, 150, 100);
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

var saveFile = function (strData, filename) {
	var link = document.createElement('a');
	if (typeof link.download === 'string') {
		document.body.appendChild(link); //Firefox requires the link to be in the body
		link.download = filename;
		link.href = strData;
		link.click();
		document.body.removeChild(link); //remove the link when done
	} else {
		location.replace(uri);
	}
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