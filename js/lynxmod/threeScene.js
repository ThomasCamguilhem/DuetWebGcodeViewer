/* ======== THREE_SCENE ======== */
var layStart = 0;
var layEnd = 100;
var previewCamera, previewScene, previewRenderer;
var liveCamera, liveScene, liveRenderer;
var strDownloadMime = "image/octet-stream";
var statsfps;
var previewControls;
var needsRedraw = false;

function initScene()
{
	statsfps = new Stats();
	statsfps.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	if(DEBUG)
	{
		document.body.appendChild( statsfps.dom );
	}
	
	initPreview();
	initLive();
	
	function animate() {
		statsfps.begin();
		previewControls.update();
		requestAnimationFrame( animate );
		if (hasGeoToRender || needsRedraw)
			previewRenderer.render( previewScene, previewCamera );
		liveRenderer.render(liveScene, liveCamera);
		if (hasGeoToRender)
			renderLoop();
		if (needsRedraw)
			redrawLoop();
		//light.position.z -= 0.1;
		statsfps.end();
	}
	animate();
}

function initPreview()
{
	previewScene = new THREE.Scene();
	previewCamera = new THREE.PerspectiveCamera( 75, 600 / 600, 0.1, 10000 );	
	var previewSpace = $("#threeDisplay")[0];
	previewRenderer = new THREE.WebGLRenderer({
                    preserveDrawingBuffer: true,
                    alpha: true
                });
	previewRenderer.setSize( 600, 600 );
	
	previewRenderer.shadowMapEnabeled = true;
	previewRenderer.shadowMap.type = THREE.BasicShadowMap;
	previewSpace.appendChild( previewRenderer.domElement );	
	var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
	previewScene.add(ambientLight);
	
	var light = new THREE.PointLight( 0xffffff, 1, 600);
	light.position.set( 0, 295, 0 );
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 1000
	previewScene.add( light );
		
	var geometry = new THREE.CircleGeometry( 180, 30);
	var material = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 } );
	var buildPlate = new THREE.Mesh(new THREE.CircleGeometry( 200, 30), new THREE.MeshBasicMaterial({ color: 0xf0f0f0 }));
	buildPlate.receiveShadow = true;
	buildPlate.rotation.x = -Math.PI/2;
	buildPlate.position.y = -0.1;
	var buildSurface = new THREE.Mesh( geometry, material );
	buildSurface.receiveShadow = true;
	buildSurface.rotation.x = -Math.PI/2;
	buildSurface.position.y = 0.1;
	var topMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff,  side: THREE.BackSide} );
	var topCircle = new THREE.Mesh( geometry, topMaterial );
	topCircle.rotation.x = -Math.PI/2;
	topCircle.position.y = 600;
	//previewScene.add( topCircle );
	previewScene.add( buildSurface );
	previewScene.add( buildPlate );
	geometry = new THREE.CylinderGeometry( 200, 200, 600, 32, 1, true, 0, Math.PI );
	material = new THREE.MeshBasicMaterial({color: 0xe0e0e0, side: THREE.BackSide} );
	var buildVolume = new THREE.Mesh( geometry, material );

	buildVolume.position.y = 300;
	previewScene.add( buildVolume );
		
	previewControls = new THREE.OrbitControls( previewCamera , $("#threeDisplay")[0]);
	
	var gridPrimeGeo = new THREE.Geometry();
	var gridSecGeo = new THREE.Geometry();
	var materPrime = new THREE.LineBasicMaterial({ color: 0x7f7f7f});
	var materSec = new THREE.LineBasicMaterial({ color: 0xafafaf});
	
	prepareGridBPGeoPreview(gridPrimeGeo, gridSecGeo);
	
	previewScene.add(new THREE.LineSegments(gridPrimeGeo, materPrime));
	previewScene.add(new THREE.LineSegments(gridSecGeo, materSec));
	
	// previewCamera center
	previewCamera.position.set(-400, 575, 0);
	//previewCamera positive
	//previewCamera.position.set(-100, 150, 100);
	previewCamera.rotation.set(-Math.PI/2, -1, -Math.PI/2);
}

function prepareGridBPGeoPreview(gridPrime, gridSec)
{
	for (var posY = -200; posY < 180; posY += 100)
	{
		var miniX = -180 * Math.sqrt(1 - ((posY/180) * (posY/180)));
		var maxiX =  180 * Math.sqrt(1 - ((posY/180) * (posY/180)));
		gridPrime.vertices.push(new THREE.Vector3(miniX, 1, posY));
		gridPrime.vertices.push(new THREE.Vector3(maxiX, 1, posY));
		gridPrime.vertices.push(new THREE.Vector3(posY, 1, miniX));
		gridPrime.vertices.push(new THREE.Vector3(posY, 1, maxiX));
		for (var posX = posY + 20; posX < posY + 100; posX += 20)
		{
			miniX = -180 * Math.sqrt(1 - ((posX/180) * (posX/180)));
			maxiX =  180 * Math.sqrt(1 - ((posX/180) * (posX/180)));
			gridSec.vertices.push(new THREE.Vector3(miniX, 1, posX));
			gridSec.vertices.push(new THREE.Vector3(maxiX, 1, posX));
			gridSec.vertices.push(new THREE.Vector3(posX, 1, miniX));
			gridSec.vertices.push(new THREE.Vector3(posX, 1, maxiX));
		}
	}
}

function saveAsImage() {
	var imgData, imgNode;

	try {
		var strMime = "image/jpeg";
		imgData = previewRenderer.domElement.toDataURL(strMime);

		savePicture(imgData.replace(strMime, strDownloadMime), "test.jpg");

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
			keys.push(key);
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
					//redrawpreviewScene(keys[i], lays[lay],
						//(($("#"+keys[i].toLowerCase()+"_cura")[0].checked) && (lay >= layStart && lay <= layEnd)));
					break;
				case Slicer.SIMP:
					//redrawpreviewScene(keys[i], lays[lay],
							//(($("#"+keys[i].toLowerCase()+"_simp")[0].checked) && (lay >= layStart && lay <= layEnd)));
					break;						
				case Slicer.SLIC:
					//redrawpreviewScene(keys[i], lays[lay],
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

function redrawpreviewScene(key, layer, visible)
{
	if (previewScene.getObjectByName(key+"_"+layer))
		previewScene.getObjectByName(key+"_"+layer).visible = visible;
}

/*
setTimeout( function(){
	redrawBP()
	drawHead({x: 300, y: 295});
}
		, 2000);
*/


var i;
var nbKey;
var keys = [];
var hasGeoToRender = false;
var lays = [];
var lay;
var newStatus = {};
function initRender()
{
	i = 0;
	lay = 0;
	nbKey = pointCloud.length;
	keys = [];
	for(var key in pointCloud)
	{
		if(key != "length" )
		{
			keys.push(key);
		}
	}
	for(var gcodeLayer in pointCloud[keys[0]])
	{
		lays.push(gcodeLayer);
	}
	var color = new THREE.Color().setHSL((i/nbKey), 0.75, 0.5);
	//console.log(key +" ("+color.r+","+color.g+","+color.b+")")
	pointMaterial = new THREE.LineBasicMaterial({color: color, linewidth:2});
	meshMaterial = new THREE.MeshPhongMaterial({color: color});
	
	for(var key in pointCloud)
	{
		if(slicer==undefined || key == "Unknown" || key != "length" )
		{
			for(var gcodeLayer in pointCloud[key])
			{
				previewScene.remove(previewScene.getObjectByName(key+"_"+gcodeLayer));
			}
		}
	}
	
	if(previewScene.getObjectByName("bbox"))
	{
		previewScene.remove(previewScene.getObjectByName("bbox"));
	}
	var geo = new THREE.Geometry();
	// bottom bbox
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.min.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.min.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.min.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.min.y));
	// sides bbox
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.min.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.min.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.min.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.min.y));
	//top bbox
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.min.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.max.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.min.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.min.y));
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.min.y));
	
	var bbox = new THREE.LineSegments(geo, new THREE.LineBasicMaterial());
	bbox.name = "bbox";
	previewScene.add(bbox);
	newStatus = parseRows[parsedFileCount].find("#status");
}

function renderLoop()
{	
	if (i == keys.length)
	{
		hasGeoToRender = false;
		newStatus[0].innerHTML = "Done ";
		initRedraw();
		setTimeout(function(){
		newStatus[0].innerHTML = "";
		}, 1000);
		var imgData, imgNode;
		try {
			previewCamera.position.set(-400, 575, 0);
			previewControls.target.set(0, 300, 0);
			previewControls.update();
			previewRenderer.render( previewScene, previewCamera );
			var strMime = "image/jpeg";
			imgData = previewRenderer.domElement.toDataURL(strMime);
			savePicture(imgData.replace(strMime, strDownloadMime), fileInput.name.substring(0,fileInput.name.lastIndexOf("."))+"_bp.jpg");
			
			var centerX = (boundingBox.max.x + boundingBox.min.x)/2;
			var centerY = (boundingBox.max.y + boundingBox.min.y)/2;
			var centerZ = (boundingBox.max.z + boundingBox.min.z)/2;
			var width = boundingBox.max.x - boundingBox.min.x;
			var length = boundingBox.max.y - boundingBox.min.y;
			var height = boundingBox.max.z - boundingBox.min.z;
			dFromC = 3/5*Math.sqrt(width*width+length*length);
			previewControls.object.position.set(-centerX+dFromC*Math.cos(Math.PI/4), 4/5*(centerZ+Math.max(width, length, height)), centerY+dFromC*Math.sin(Math.PI/4));
			previewControls.target.set(-centerX, centerZ, centerY);
			previewControls.update();
			previewRenderer.render(previewScene, previewCamera);
			imgData = previewRenderer.domElement.toDataURL(strMime);
			savePicture(imgData.replace(strMime, strDownloadMime), fileInput.name.substring(0,fileInput.name.lastIndexOf("."))+"_ico.jpg");
		} catch (e) {
			console.error(e);
			return;
		}
		clearFileCacheDirectory(currentGCodeDirectory);
		gcodeUpdateIndex = -1;
		updateGCodeFiles();
		$(".span-refresh-files").addClass("hidden");
		return;
	}
	if (lays[lay] != undefined )
	{
		var start = new Date();
		do {
			renderGeo(keys[i], lays[lay]);
			lay ++;
		}while ((new Date() - start < 50) && (lays[lay] != undefined ))
	} else if (i < keys.length)
	{
		/*if (slicer != undefined)
		{
			switch (slicer)
			{
				case Slicer.CURA:
					if (keys[i] == "MOVE")
							$("#"+keys[i].toLowerCase()+"_cura")[0].checked = false;
					$("#"+keys[i].toLowerCase()+"_cura")[0].parentElement.style.display = "block";
					break;
				case Slicer.SIMP:
					if (keys[i] == "MOVE")
						$("#"+keys[i].toLowerCase()+"_simp")[0].checked = false;
					$("#"+keys[i].toLowerCase()+"_simp")[0].parentElement.style.display = "block";
					break;
				case Slicer.SLIC:
					if (keys[i] == "MOVE")
						$("#"+keys[i].toLowerCase()+"_slic")[0].checked = false;
					$("#"+keys[i].toLowerCase()+"_slic")[0].parentElement.style.display = "block";
					break;
			}
		}*/
		i++;
		lays = [];
		for(var gcodeLayer in pointCloud[keys[i]])
		{
			lays.push(gcodeLayer);
		}
		var color = new THREE.Color(tempChartOptions.colors[parseInt(keys[i])]);
		//console.log(key +" ("+color.r+","+color.g+","+color.b+")")
		pointMaterial = new THREE.LineBasicMaterial({color: color, linewidth: 2});
		meshMaterial = new THREE.MeshPhongMaterial({color: color});
		lay = 0;
		newStatus[0].innerHTML = "Drawing "+keys[i];
	} else {
		hasGeoToRender = false;
		newStatus[0].innerHTML = "Done ";
	}
}

function renderGeo(key, gcodeLayer)
{
	if (pointCloud[key] && pointCloud[key][gcodeLayer])
	{
		pointCloud[key][gcodeLayer].computeVertexNormals();
		if (fileSize < 10*1024*1024)
		{
		threeDee = (key != "MOVE"?new THREE.Mesh(
			new THREE.BufferGeometry().fromGeometry(pointCloud[key][gcodeLayer])
			, meshMaterial )
			: new THREE.LineSegments(pointCloud[key][gcodeLayer]
			, pointMaterial ));
		} else {
			threeDee =  new THREE.LineSegments(pointCloud[key][gcodeLayer]
			, pointMaterial );
		}
		if (key == "MOVE")
			threeDee.visible = false;
		threeDee.castShadow = true;
		threeDee.receiveShadow = true;
		threeDee.name = key+"_"+gcodeLayer;
		previewScene.add( threeDee );
	}
}