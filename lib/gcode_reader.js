var instructionPos = 0;
var slicer = undefined;
var Slicer = {
 CURA: 0,
 SIMP: 1,
 SLIC: 2,
}
var moves = [];
var preview;
var fileSize;
var meshMaterial;
var fileInput;
window.onload = function() {
	
	var lr = new LineReader({
		chunkSize: 512
	});
	
	$("#read").click(function () {
		var start = new Date();
		/*noLoop();
		pos= 150;
		rot_angle = 0;
		offset_buildPlate = 0;
		rot = 0;
		resetDisplay(true);
		*/
		slicer = undefined;
		for(var key in pointCloud)
		{
			if(slicer==undefined || key == "Unknown" || key != "length" )
			{
				for(var layer in pointCloud[key])
				{
					scene.remove(scene.getObjectByName(key+"_"+layer));
				}
			}
		}
		pointCloud = {length: 1};
		moves = [];
		
		pointMaterial = new THREE.LineBasicMaterial({color : 0xff0000});
		var moveMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});
		fileInput = document.getElementById('fileInput').files[0];
		fileSize = fileInput.size;
		$("#status")[0].innerHTML = "parsing : " + fileInput.name;
		var lastPrct = -1;
		var totalCount = 1;
		var output = $('#fileDisplayArea');
		boundingBox = {min:{x:1000,y:1000,z:1000}, max:{x:-1000,y:-1000,z:-1000}};
		layers = [];
		layer = {lBBox : {min:{x:1000,y:1000,z:1000}, max:{x:-1000,y:-1000,z:-1000}},points: []};
		lastPos = {x: undefined, y: undefined, z: undefined, e: undefined, f: undefined, t:"Unknown"};
		relativeExtrude = false;
		extruding = false;
		lr.on('line', function(line, next) {
			line = parseGCode(line, lr.offset);
			var output = $('#fileDisplayArea');
			if (line)
			{
				totalCount++;
			}
			instructionPos = lr.GetReadPos();
			if (Math.ceil((instructionPos/fileSize)*1000) > lastPrct)
			{
				lastPrct = Math.ceil((instructionPos/fileSize)*1000);
				$("#loadedBar")[0].style.width = lastPrct/10 + "%";
				$("#loadedBar")[0].innerHTML = lastPrct/10 + "%";
				var ELT = ((new Date() - start)/(instructionPos/fileSize));
				var ERT = ELT * (1-(instructionPos/fileSize))
				$("#eta")[0].innerHTML = "eta: " + toHMS(Math.round(ERT/1000), true);
			}
			//if (totalCount < 100)
				next();
		});		
		
		lr.on('error', function(err) {
			console.log(err);
		});
		
		lr.on('end', function() {
			console.log("Read complete!\n"+totalCount+" lines parsed\n took " +  toHMS(Math.round((new Date() - start)/1000), true));
			$("#eta")[0].innerHTML = "Done took: " + toHMS(Math.round((new Date() - start)/1000), true)
			var threeDee;
			hasGeoToRender = true;
			/*for(var layer in moves)
			{
				var moveDisp = new THREE.LineSegments( moves[layer], moveMaterial );
				switch (slicer)
				{
					case Slicer.CURA:
						$("#move_cura")[0].parentElement.style.display = "block";;
						break;
					case Slicer.SIMP:
						$("#move_simp")[0].parentElement.style.display = "block";;
						break;
					case Slicer.SLIC:
						$("#move_slic")[0].parentElement.style.display = "block";;
						break;
				}
				moveDisp.name = "MOVE_"+layer;
				scene.add( moveDisp );
			}*/
			pointCloud["MOVE"] = moves;
			pointCloud.length ++;
			$("#firstLayer")[0].value = 0;
			$("#lastLayer")[0].value = nbLayers;
			$("#firstLayer")[0].max = nbLayers;
			$("#lastLayer")[0].max = nbLayers;
			initRender();
		});
		
		lr.read(fileInput);
	});
};

//M:\1_Delta_Standard_2016\4_ELECTRIQUE ET ELECTRONIQUE\_Electronique embarquee\1_RepRapFirmware\2_S600Dv0_Lynxter\_Backup\2017-11-14\gcodes\PLA\Lynxter Argent\Dassault
function parseGCode(line)
{
	var cmdLine = line.replace(/;.*$/, '').trim(); // Remove comments
	var comLine = ""
	if (line.indexOf(";") > -1)
		comLine = line.replace(/[a-zA-Z0-9| |.|-]*[;]/, '').trim();
	if (cmdLine)
	{
		var tokens = cmdLine.split(' ');
		if (tokens) {
		  var cmd = tokens[0];
		  var args = {
			'cmd': cmd
		  };
		  tokens.splice(1).forEach(function(token) {
			if (token)
			{
				var key = token[0].toLowerCase();
				var value = parseFloat(token.substring(1));
				args[key] = value;
			}
		  });
		  extractGCode(args);	  
		}
	}
	if (comLine)
	{
		if (slicer === undefined)
		{
			if (comLine.toUpperCase().includes("CURA"))
			{
				console.log("Cura detected");
				$("#form_cura")[0].style.display = "block"
				slicer = Slicer.CURA;
			} else if (comLine.toUpperCase().includes("SIMPLIFY3D"))
			{
				console.log("Simplify 3D detected");
				$("#form_simp")[0].style.display = "block"
				slicer = Slicer.SIMP;
			} else if (comLine.toUpperCase().includes("SLIC3R"))
			{
				console.log("Slic3r detected");
				$("#form_slic")[0].style.display = "block"
				slicer = Slicer.SLIC;
			}else {
				// try Cura as the slicer name is at line 5
				var tokens = comLine.split(':');
					if (tokens) {
						var cmd = tokens[0].toUpperCase();
						var args = {
						'cmd': cmd
						};
						var key = 0;
						tokens.splice(1).forEach(function(token) {
						if (token)
						{
							key++;
							var value = token;
							args[key] = value;
						}
					});
					decodeCuraCom(args);
					}
				//console.log(comLine);
			}
		} else {
			switch (slicer)
			{
				case Slicer.CURA:
					var tokens = comLine.split(':');
					if (tokens) {
						var cmd = tokens[0];
						var args = {
						'cmd': cmd
						};
						var key = 0;
						tokens.splice(1).forEach(function(token) {
						if (token)
						{
							key++;
							var value = token;
							args[key] = value;
						}
					});
					decodeCuraCom(args);
					}
					break;
				case Slicer.SIMP:
					decodeSimpCom(comLine);
					break;
				case Slicer.SLIC:
					decodeSlicCom(comLine);
					break;
				default:
					console.log(comLine);
					break;
			}
		}
	}
	return cmdLine;
}

var i;
var nbKey;
var keys = [];
var hasGeoToRender = false;
var lays = [];
var lay;

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
	
	for(var key in pointCloud)
	{
		if(slicer==undefined || key == "Unknown" || key != "length" )
		{
			for(var layer in pointCloud[key])
			{
				scene.remove(scene.getObjectByName(key+"_"+layer));
			}
		}
	}
	
	if(scene.getObjectByName("bbox"))
	{
		scene.remove(scene.getObjectByName("bbox"))
	}
	var geo = new THREE.Geometry();
	// bottom bbox
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.min.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.min.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.min.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.min.y))
	// sides bbox
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.min.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.min.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.min.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.min.z, boundingBox.min.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.min.y))
	
	//top bbox
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.min.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.max.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.min.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.max.x, boundingBox.max.z, boundingBox.min.y))
	geo.vertices.push(new THREE.Vector3(-boundingBox.min.x, boundingBox.max.z, boundingBox.min.y))
	
	var bbox = new THREE.LineSegments(geo, new THREE.LineBasicMaterial());
	bbox.name = "bbox";
	scene.add(bbox)
}

function renderLoop()
{	
	if (i == keys.length)
	{
		hasGeoToRender = false;
		$("#status")[0].innerHTML = "Done ";
		redrawScene();
		setTimeout(function(){
		$("#status")[0].innerHTML = "";
		}, 1000);
		return;
	}
	if (lays[lay] != undefined )
	{
		var start = new Date();
		do {
			renderGeo(keys[i], lays[lay])
			lay ++;
		}while ((new Date() - start < 50) && (lays[lay] != undefined ))
	} else if (i < keys.length)
	{
		if (slicer != undefined)
		{
			switch (slicer)
			{
				case Slicer.CURA:
					$("#"+keys[i].toLowerCase()+"_cura")[0].parentElement.style.display = "block";
					break;
				case Slicer.SIMP:
					$("#"+keys[i].toLowerCase()+"_simp")[0].parentElement.style.display = "block";
					break;
				case Slicer.SLIC:
					$("#"+keys[i].toLowerCase()+"_slic")[0].parentElement.style.display = "block";
					break;
			}
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
		$("#status")[0].innerHTML = "Drawing "+keys[i];
	} else {
		hasGeoToRender = false;
		$("#status")[0].innerHTML = "Done ";
	}
}


function renderGeo(key, layer)
{
	pointCloud[key][layer].computeVertexNormals();
	//pointCloud[key][layer].normalize();
	if (fileSize < 10*1024*1024)
	{
	threeDee = (key != "MOVE"?new THREE.Mesh(
		new THREE.BufferGeometry().fromGeometry(pointCloud[key][layer])
		, meshMaterial )
		: new THREE.LineSegments(pointCloud[key][layer]
		, pointMaterial ))
	} else {
		threeDee =  new THREE.LineSegments(pointCloud[key][layer]
		, pointMaterial )
	}
	threeDee.castShadow = true;
	threeDee.receiveShadow = true;
	threeDee.name = key+"_"+layer;
	scene.add( threeDee );
}