const DEBUG = false;
var PREVIEW = true;
var SHOW_ALL = false;
var SHOW_PREV = false;
var SHOW_MOINS_2 = false;

var layers = [];
var layer = {lBBox : {min:{x:10000,y:10000,z:10000}, max:{x:-10000,y:-10000,z:-10000}},points: []};
var zLayer = 0;
var zPrevLayer = 0;
var lastPos = {x: undefined, y: undefined, z: undefined, e: undefined, f: undefined, t: "Unknown"};
var relative = false;
var startLayer = 0;
var relativeExtrude = false;
var extruding = false;
var boundingBox = {min:{x:10000,y:10000,z:10000}, max:{x:-10000,y:-10000,z:-10000}}

var pointCloud = {length: 1};

function extractGCode(args)
{
	switch (args.cmd)
	{
		
		/* ====== G Codes ====== */
		
		case "G0":
		case "G1":
			
			//console.log("move");
			/*console.log("new position: \n\t" +
			(args.x?(relative?lastPos.x+args.x:args.x):lastPos.x) + "\n\t" +
			(args.y?(relative?lastPos.y+args.y:args.y):lastPos.y) + "\n\t" +
			(args.z?(relative?lastPos.z+args.z:args.z):lastPos.z));*/
			if ((relative?lastPos.z+args.z:args.z) > lastPos.z)
			{
				extruding = false;
			}
			if(args.e)
				extruding = (lastPos.e < (relativeExtrude? lastPos.e + args.e : args.e));
			if (zLayer != lastPos.z && extruding)
			{
				zPrevLayer = zLayer
				zLayer = lastPos.z
				
				if(curLay === undefined)
				{
					layers.push({layerStart: startLayer, layer: layer});
					nbLayers++;
				}
				startLayer = instructionPos;
				if(PREVIEW) {
					/* ====== SHOW BOUNDING BOX ====== */
					if (layers[curLay-1] || layers[curLay] || ((slicer == undefined || slicer == Slicer.SLIC) && nbLayers > 0))
					{
						if (!scene.getObjectByName("bbox"))
						{
							var centerX = (boundingBox.max.x + boundingBox.min.x)/2;
							var centerY = (boundingBox.max.y + boundingBox.min.y)/2;
							var width = boundingBox.max.x - boundingBox.min.x;
							var length = boundingBox.max.y - boundingBox.min.y;
							controls.object.position.set(-centerX, 0,centerY)
							if (nbLayers && layHeight)
								controls.object.position.y = (nbLayers*layHeight)
						}
						scene.remove(scene.getObjectByName("bbox"))
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
						
						var centerX = (boundingBox.max.x + boundingBox.min.x)/2;
						var centerY = (boundingBox.max.y + boundingBox.min.y)/2;
						camera.position.set(-centerX, 0,centerY)
						var width = boundingBox.max.x - boundingBox.min.x;
						var length = boundingBox.max.y - boundingBox.min.y;
						controls.target.x = -centerX;
						controls.target.z =  centerY;
						//length)
						if (curLay!=undefined && layHeight)
						{
							controls.object.position.y =  4/6*Math.max(width, length)+(curLay*layHeight)
							controls.target.y = (boundingBox.max.z + boundingBox.min.z)/2;
						} else {
							controls.object.position.y = 4/6*Math.max(width, length)+(lastPos.z);
							controls.target.y = (boundingBox.max.z + boundingBox.min.z)/2;
						}
						controls.update();
					}
					nbKey = 0;
					for (var key in pointCloud)
					{
						//x: -76.86905692997644, y: 12.150000000000002, z: 125.93689950861615
						var id = [];
						if (!curLay)
							for (var i in pointCloud[key])
								id.push(i);
						var pt = id.length;
						if (!SHOW_PREV && !SHOW_ALL) {
							scene.remove(scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-2:id[pt-2])));
							scene.remove(scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-2:id[pt-2])));
						}else if (scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-2:id[pt-2])))
							scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-2:id[pt-2])).material.color = {r:0, g:0, b:0};
						if (!SHOW_MOINS_2 && !SHOW_ALL){
							scene.remove(scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-3:id[pt-3])));
							scene.remove(scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-3:id[pt-3])));
						} else if (scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-3:id[pt-3])))
							scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-3:id[pt-3])).material.color =  {r:0.25, g:0.25, b:0.25};
						if (!SHOW_ALL){
							scene.remove(scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-4:id[pt-4])));
							scene.remove(scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-4:id[pt-4])));
							}
						else if	(scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-4:id[pt-4])))
							scene.getObjectByName( key+"_"+(curLay!=undefined?curLay-4:id[pt-4])).material.color =  {r:0.5, g:0.5, b:0.5};
						if (pointCloud[key][(curLay!=undefined?curLay-1:id[pt-1])] != undefined)
						{
							nbKey++;
						}
					}
					var i = 0;						
					for (var key in pointCloud)
					{
						var id = [];
						if (curLay == undefined)
							for (var i in pointCloud[key])
								id.push(i);
						var pt = id.length;
						var color = new THREE.Color().setHSL(((i-1)/nbKey), 1, 0.5);
						//console.log(key +" ("+color.r+","+color.g+","+color.b+")")
						pointMaterial = new THREE.LineBasicMaterial({color: color, linewidth:2});
						meshMaterial = new THREE.MeshPhongMaterial({color: color});
						if (pointCloud[key][(curLay!=undefined?curLay-1:id[pt-1])] != undefined)
						{
							pointCloud[key][(curLay!=undefined?curLay-1:id[pt-1])].computeVertexNormals();
							if (fileSize < 10*1024*1024)
							{
								threeDee = (key != "MOVE"?new THREE.Mesh(
									new THREE.BufferGeometry().fromGeometry(pointCloud[key][(curLay!=undefined?curLay-1:id[pt-1])])
									, meshMaterial )
									: new THREE.LineSegments(pointCloud[key][(curLay!=undefined?curLay-1:id[pt-1])]
									, pointMaterial ))
							} else {
								threeDee =  new THREE.LineSegments(pointCloud[key][(curLay!=undefined?curLay-1:id[pt-1])]
								, pointMaterial )
							}
							threeDee.castShadow = true;
							threeDee.receiveShadow = true;
							threeDee.name = key+"_"+((curLay!=undefined?curLay-1:id[pt-1]));
							scene.add( threeDee );
						}
						i++;
					}
					
					if (layers.length > 1)
					{
						var imgData, imgNode;
						try {
							controls.update();
							renderer.render( scene, camera );
							var strMime = "image/jpeg";
							imgData = renderer.domElement.toDataURL(strMime);
							//.replace(strMime, strDownloadMime)
							saveFile(imgData, fileInput.name.substring(0,fileInput.name.lastIndexOf("."))+"_"+(curLay-1)+".jpg");
						} catch (e) {
							console.error(e);
							return;
						}
					}
				}
				layer = {lBBox : {min:{x:1000,y:1000,z:1000}, max:{x:-1000,y:-1000,z:-1000}},points: []};
			}
			
			if ((lastPos.x && lastPos.y && lastPos.z) && (args.x || args.y || args.z))
			{
				var x2 = (relative?(lastPos.x + args.x):args.x);
				var y2 = (relative?(lastPos.y + args.y):args.y);
					
				var point_start = new THREE.Vector3();
				var point_end = new THREE.Vector3();
				if (args.e)
				{
					//console.log(Math.round(lastPos.z*100));
					if(!pointCloud[lastPos.t] || !pointCloud[lastPos.t][(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))])
					{
						if ( !pointCloud[lastPos.t])
						{
							pointCloud[lastPos.t] = [];
							pointCloud.length++;
						}
						pointCloud[lastPos.t][(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))] = new THREE.Geometry();
						pointCloud[lastPos.t][(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))].name = lastPos.t+"_"+(curLay!=undefined?curLay:(Math.round(lastPos.z*100)));
					}
					point_start.x = -lastPos.x;
					point_start.y = lastPos.z; //-y2;
					point_start.z = lastPos.y//lastPos.z;
					
					point_end.x = -x2;
					point_end.y = lastPos.z; //-y2;
					point_end.z = y2//lastPos.z;
					if (fileSize < 10*1024*1024)
					{
						setPoly(point_start, point_end);
					} else {
						pointCloud[lastPos.t][(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))].vertices.push( point_start );
						pointCloud[lastPos.t][(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))].vertices.push( point_end );
					}
					
				} else {
					point_start.x = -lastPos.x;
					point_start.y = lastPos.z; //-y2;
					point_start.z = lastPos.y//lastPos.z;
					
					point_end.x = -x2;
					point_end.y = (args.z?(relative?(lastPos.z + args.z):args.z):lastPos.z); //-y2;
					point_end.z = y2//lastPos.z;
					if (!moves[(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))])
					{
						moves[(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))] = new THREE.Geometry();
						moves[(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))].name = "MOVE_"+(curLay?curLay:(Math.round(lastPos.z*100)));
					}
					moves[(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))].vertices.push( point_start );
					moves[(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))].vertices.push( point_end );
				}
			}
			
			if (args.x)
			{
				lastPos.x = (relative?lastPos.x+args.x:args.x);
				if (lastPos.x < layer.lBBox.min.x)
					layer.lBBox.min.x = lastPos.x;
				if (lastPos.x > layer.lBBox.max.x)
					layer.lBBox.max.x = lastPos.x;
				if (lastPos.x < boundingBox.min.x)
					boundingBox.min.x = lastPos.x;
				if (lastPos.x > boundingBox.max.x)
					boundingBox.max.x = lastPos.x;
					
			}
			if (args.y)
			{
				lastPos.y = (relative?lastPos.y+args.y:args.y);
				if (lastPos.y < layer.lBBox.min.y)
					layer.lBBox.min.y = lastPos.y;
				if (lastPos.y > layer.lBBox.max.y)
					layer.lBBox.max.y = lastPos.y;
				if (lastPos.y < boundingBox.min.y)
					boundingBox.min.y = lastPos.y;
				if (lastPos.y > boundingBox.max.y)
					boundingBox.max.y = lastPos.y;
			}
			if (args.z)
			{
				lastPos.z = (relative?lastPos.z+args.z:args.z);
				if (lastPos.z < layer.lBBox.min.z)
					layer.lBBox.min.z = lastPos.z;
				if (lastPos.z > layer.lBBox.max.z)
					layer.lBBox.max.z = lastPos.z;
				if (lastPos.z < boundingBox.min.z)
					boundingBox.min.z = lastPos.z;
				if (lastPos.z > boundingBox.max.z)
					boundingBox.max.z = lastPos.z;
			}
			if (args.e)
			{
				lastPos.e = (relativeExtrude? lastPos.e + args.e : args.e)
			}
			if (args.f)
				lastPos.f = args.f;
			
			if(args.x || args.y)
			{
				var tmpPos ={};
				tmpPos.x = lastPos.x
				tmpPos.y = lastPos.y
				tmpPos.z = lastPos.z
				tmpPos.e = lastPos.e
				tmpPos.f = lastPos.f
				tmpPos.t = lastPos.t
				layer.points.push(tmpPos);
			}
			break;
			
		case "G4":
			// console.log("Wait")
		
		case "G10":
			if (DEBUG)
				if (args.p && (args.s || args.r))
					console.log("Set tool "+ args.p +" \n\tstanby temp: "+args.r +"\n\tactive temp: " + args.s);
				else if (args.l)
					console.log("Set tool "+ args.p + " offset\n\t X:"+ args.x +"\n\t Y:" + args.y + "\n\t Z:"+args.z);
				else 
					console.log("Retracting filament");
			break;
				
		case "G21":
			if(DEBUG)
				console.log("Units set to mm");
			break;
			
		case "G28":
			if(DEBUG)
				console.log("Homing");
			lastPos.x = 0;
			lastPos.y = 0;
			lastPos.z = 0;
			break;
			
		case "G90":
			if(DEBUG)
				console.log("Absolute positioning")
			relative = false;
			break;
		
		case "G91":
			if(DEBUG)
				console.log("Relative positioning")
			relative = true;
			break;
			
		case "G92":
			if(DEBUG && (args.x || args.y || args.z))
				console.log("position set to" +
				(args.x?" \n\tX: " + args.x:"") +
				(args.y?" \n\tY: " + args.y:"") +
				(args.z?" \n\tZ: " + args.z:""));
			lastPos.x = (args.x?args.x:lastPos.x);
			lastPos.y = (args.y?args.y:lastPos.y);
			lastPos.z = (args.y?args.z:lastPos.z);
			break;
		
		/* ====== M Codes ====== */
		
		case "M42":
			if(DEBUG)
				console.log("new state "+args.s+" for Pin "+args.p);
			break;
		
		case "M82":
			if(DEBUG)
				console.log("Absolute extruder")
			relativeExtrude = false;
			break;
		
		case "M83":
		if(DEBUG)
			console.log("Relative extruder")
			relativeExtrude = true;
			break;
		
		case "M84":
			if(DEBUG)
				console.log("Steppers off")
			break;
		
		case "M104":		
			if(DEBUG)
				console.log("Extruder set to "+args.s+"°C")
			break;
		
		case "M106":
			if(DEBUG && false)
				console.log("Fan " + (args.p?args.p+" ":"")+(args.s?"set to: " +args.s:"On"))
			break;
			
		case "M107":
			if(DEBUG)
				console.log("Fan off")
			break;
			
		case "M109":
			if(DEBUG)
				console.log("wait for Extruder to reach " + args.s+"°C");
			break;
		
		case "M116":
			if(DEBUG)
				if(args.p || args.h || args.c)
					console.log("wait for "+(args.p? "Tool "+args.p+" ":"")+(args.h?"Extruder "+args.h+" ":"")+(args.c?"Chamber "+args.c+" ":"")+"to reach it's target temperature");
				else
					console.log("wait for All to reach their target temperature")
			break;
			
		case "M117":
			break;
		
		case "M140":
			if(DEBUG)
				console.log("Bed set to "+args.s+"°C")
			break;
			
		case "M141":
			if(DEBUG)
				console.log("Chamber set to "+args.s+"°C")
			break;
		
		case "M190":
			if(DEBUG)
				console.log("Wait for bed to reach "+args.s+"°C")
			break;
			
		case "M191":
			if(DEBUG)
				console.log("Wait for chamber to reach "+args.s+"°C")
			break;
			
		/* ====== T Codes ====== */
		case "T0":
			if(DEBUG)
				console.log("Tool 0 selected");
				console.log(extruders[0]);
				extWidth = extruders[0].width;
			break;
		
		case "T1":
			if(DEBUG)
				console.log("Tool 1 selected");
				console.log(extruders[1]);
				extWidth = extruders[1].width;
			break;
			
		case "T2":
			if(DEBUG)
				console.log("Tool 2 selected");
				console.log(extruders[2]);
				extWidth = extruders[2].width;
			break;
		
		case "T3":
			if(DEBUG)
				console.log("Tool 3 selected");
				console.log(extruders[3]);
				extWidth = extruders[3].width;
			break;
			
		case "T4":
			if(DEBUG)
				console.log("Tool 4 selected");
				console.log(extruders[4]);
				extWidth = extruders[4].width;
			break;
		
		case "T5":
			if(DEBUG)
				console.log("Tool 5 selected");
				console.log(extruders[5]);
				extWidth = extruders[5].width;
			break;
			
		default :
			console.log("unknown command: "+args.cmd);
			console.log(args);
			break;
	}
}

function setPoly( start, end)
{
	var vertices = pointCloud[lastPos.t][(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))].vertices;
	var faces = pointCloud[lastPos.t][(curLay!=undefined?curLay:(Math.round(lastPos.z*100)))].faces;
	
	var iv = vertices.length;
	
	var dx = (-(end.x-start.x));
	var dy = (end.z-start.z)
	//console.log("dX = " + dx)
	//console.log("dY = " + dy)
	//console.log("dZ = " +   (end.y-start.y) )
	var a;
	var b;
	if (dx != 0)
	{
		a = ((end.z - start.z)/( start.x - end.x));
		b = (start.z - (a*(-start.x)));
	}else{
		a = ((start.x - end.x)/( end.z - start.z));
		b = (-start.x - (a*(start.z)))
	}
	var alpha = Math.atan(a);
	//console.log("y=" + a +"x+"+ b)
	//console.log("y=" + (-1/a) +"x+"+ b)
	var start_x
	var end_x
	var start_y
	var end_y
	
	if (dx != 0)
	{
		start_x = start.x+(extWidth/2)*Math.sin(alpha);
		end_x = end.x+(extWidth/2)*Math.sin(alpha);
		start_y = start.z+(extWidth/2)*Math.cos(alpha)
		end_y = end.z+(extWidth/2)*Math.cos(alpha)
	} else {
		start_x = start.x+(extWidth/2)*Math.cos(alpha);
		end_x = end.x+(extWidth/2)*Math.cos(alpha);
		start_y = start.z+(extWidth/2)*Math.sin(alpha)
		end_y = end.z+(extWidth/2)*Math.sin(alpha)
	}
	
	var pstr = new THREE.Vector3(start_x, start.y, start_y)
	var petr = new THREE.Vector3(end_x, end.y, end_y)
	var pebr = new THREE.Vector3(end_x, end.y-(layHeight?layHeight:lastPos.z-zPrevLayer), end_y)
	var psbr = new THREE.Vector3(start_x, start.y-(layHeight?layHeight:lastPos.z-zPrevLayer), start_y)
	
	if( dx != 0)
	{
		start_x = start.x-(extWidth/2)*Math.sin(alpha);
		end_x = end.x-(extWidth/2)*Math.sin(alpha);
		start_y = start.z-(extWidth/2)*Math.cos(alpha)
		end_y = end.z-(extWidth/2)*Math.cos(alpha)
	} else {
		start_x = start.x-(extWidth/2)*Math.cos(alpha);
		end_x = end.x-(extWidth/2)*Math.cos(alpha);
		start_y = start.z-(extWidth/2)*Math.sin(alpha);
		end_y = end.z-(extWidth/2)*Math.sin(alpha);
	}
	
	var pstl = new THREE.Vector3(start_x, start.y, start_y)
	var petl = new THREE.Vector3(end_x, end.y, end_y)
	var pebl = new THREE.Vector3(end_x, end.y-(layHeight?layHeight:lastPos.z-zPrevLayer), end_y)
	var psbl = new THREE.Vector3(start_x, start.y-(layHeight?layHeight:lastPos.z-zPrevLayer), start_y)
	var diffPos = Infinity;
	if( iv > 4)
	{
		var diffx = pstr.x - vertices[iv-4].x
		var diffy = pstr.z - vertices[iv-4].z
		diffPos = Math.sqrt(diffx*diffx+diffy*diffy);
	}
	if ((iv < 4) || diffPos > (extWidth/2)) {
		vertices.push( pstr ); // 0
		vertices.push( psbr ); // 1
		vertices.push( pstl ); // 2
		vertices.push( psbl ); // 3
	}
	vertices.push( petr ); // 4
	vertices.push( pebr ); // 5
	vertices.push( petl ); // 6
	vertices.push( pebl ); // 7
	
	if(iv >= 4 && (diffPos < (extWidth/2)))
	{
		iv -= 4
	}
		//console.log(diffPos)
	
	var ftrr;
	var fbrr;
	
	var ftll;
	var fbll;
	
	var fttr;
	var fttl;
	
	var fbbr;
	var fbbl;
	
	if (dx < 0)
	{
		ftrr = new THREE.Face3( iv, iv+5, iv+4);
		fbrr = new THREE.Face3( iv, iv+1, iv+5);
		
		ftll = new THREE.Face3( iv+2, iv+6, iv+7);
		fbll = new THREE.Face3( iv+2, iv+7, iv+3);
		
		fttr = new THREE.Face3( iv, iv+4, iv+6);
		fttl = new THREE.Face3( iv, iv+6, iv+2);
		
		fbbr = new THREE.Face3( iv+5, iv+1, iv+3);
		fbbl = new THREE.Face3( iv+5, iv+3, iv+7);
	} else if (dx > 0) {
		ftrr = new THREE.Face3( iv, iv+4, iv+5);
		fbrr = new THREE.Face3( iv, iv+5, iv+1);
		
		ftll = new THREE.Face3( iv+2, iv+7, iv+6);
		fbll = new THREE.Face3( iv+2, iv+3, iv+7);
		
		fttr = new THREE.Face3( iv, iv+6, iv+4);
		fttl = new THREE.Face3( iv, iv+2, iv+6);
		
		fbbr = new THREE.Face3( iv+5, iv+3, iv+1);
		fbbl = new THREE.Face3( iv+5, iv+7, iv+3);
	} else if (dx == 0){
		 if (dy < 0 ) {
			ftrr = new THREE.Face3( iv, iv+5, iv+4);
			fbrr = new THREE.Face3( iv, iv+1, iv+5);
			
			ftll = new THREE.Face3( iv+2, iv+6, iv+7);
			fbll = new THREE.Face3( iv+2, iv+7, iv+3);
			
			fttr = new THREE.Face3( iv, iv+4, iv+6);
			fttl = new THREE.Face3( iv, iv+6, iv+2);
			
			fbbr = new THREE.Face3( iv+5, iv+1, iv+3);
			fbbl = new THREE.Face3( iv+5, iv+3, iv+7);
		} else if (dy > 0) {
			ftrr = new THREE.Face3( iv, iv+4, iv+5);
			fbrr = new THREE.Face3( iv, iv+5, iv+1);
			
			ftll = new THREE.Face3( iv+2, iv+7, iv+6);
			fbll = new THREE.Face3( iv+2, iv+3, iv+7);
			
			fttr = new THREE.Face3( iv, iv+6, iv+4);
			fttl = new THREE.Face3( iv, iv+2, iv+6);
			
			fbbr = new THREE.Face3( iv+5, iv+3, iv+1);
			fbbl = new THREE.Face3( iv+5, iv+7, iv+3);
		}
	}
	
	if (ftrr && fbrr)
	{
		faces.push ( ftrr ) // (0,1,2)
		faces.push ( fbrr ) // (0,2,3)
	}
	
	if(ftll && fbll)
	{
		faces.push ( ftll ) // (4,5,6)
		faces.push ( fbll ) // (4,6,7)
	}
	
	if(fttr && fttl)
	{
		faces.push ( fttr ) // (0,1,5)
		faces.push ( fttl ) // (0,5,4)
	}
	
	if(fbbr && fbbl) {
		faces.push ( fbbr ) // (2,3,7)
		faces.push ( fbbl ) // (2,7,6)
	}
	
	if (!ftrr || ! fbrr || !ftll || ! fbll || !fttr || !fttl || !fbbr || ! fbbl )
		console.error("C'est possible§")
	//faces.push (new THREE.Face3( iv, iv+3, iv+4))
	//faces.push (new THREE.Face3( iv, iv+4, iv+7)) // (2,7,6)
	
}