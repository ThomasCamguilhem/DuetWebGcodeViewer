var offset = {
	XAxis:{
		X: 200.0, 
		Y: 640.0
		},
	YAxis: {
		X: 1000.0,
		Y: 640.0
		},
	ZAxis: {
		X: 600.0,
		Y: 440.0
		}
	}
	
var rot_angle = 90;
var offset_buildPlate = 175;

function setup(){
	createCanvas(1200,650, WEBGL);
  fov = 60 / 180 * PI;
  cameraZ = height / 2.0 / tan(fov / 2.0);
	resetDisplay();
	//frameRate(10);
	//noLoop();
}
var rot = 0
var last_rot = 0;
var rot_angle = 90;
var last_rot_angle = 0;
var max_pts = 1024;
var nb_pts = 32;
var pos = 150;
var lastMousX = 0;
var lastMousY = 0;
function draw(FORCE_REDRAW) {
	var start = new Date() - 0;
	if (mouseIsPressed && mouseButton === LEFT)
	{
		if (lastMousY > mouseY+10)
			rot_angle += 10;
		else if (lastMousY < mouseY-10)
			rot_angle -= 10;
		
		
		if (lastMousX > mouseX + 10)
			rot += 20;
		else if (lastMousX < mouseX - 10)
			rot -= 20;
		lastMousX = mouseX;
		lastMousY = mouseY;
	}
	if ((Math.abs(rot_angle - last_rot_angle) > 1) || (Math.abs(rot - last_rot) > 10) || FORCE_REDRAW)
	{
		resetDisplay();
		stroke(0);
		strokeWeight(1);
		noFill();
		//translate(-width/2,-height/2);
		//rect((offset.XAxis.X + boundingBox.min.x ), (offset.XAxis.Y - boundingBox.max.z), (boundingBox.max.x - boundingBox.min.x), (boundingBox.max.z-boundingBox.min.z));
		//rect((boundingBox.min.y + offset.YAxis.X), (offset.YAxis.Y - boundingBox.max.z), (boundingBox.max.y - boundingBox.min.y), (boundingBox.max.z-boundingBox.min.z));
		translate( 0, 125, 0);
		translate (0,0,-pos);
		rotateX(radians(rot_angle));
		// bounding box minX
		translate(0,0, -offset_buildPlate);
		rotateZ(radians(rot));
		translate(boundingBox.min.x, boundingBox.min.y,0);
		rotateY(radians(90))
		rect(0 , 0, -(boundingBox.max.z - boundingBox.min.z), (boundingBox.max.y-boundingBox.min.y));
		rotateY(radians(-90));
		translate(-boundingBox.min.x, -boundingBox.min.y, 0);
		rotateZ(radians(-rot));
		translate( 0, 0, offset_buildPlate)
		// bounding box maxX
		translate(0,0, -offset_buildPlate);
		rotateZ(radians(rot));
		translate(boundingBox.max.x, boundingBox.min.y,0);
		rotateY(radians(90))
		rect(0 , 0, -(boundingBox.max.z - boundingBox.min.z), (boundingBox.max.y-boundingBox.min.y));
		rotateY(radians(-90));
		translate(-boundingBox.max.x, -boundingBox.min.y, 0);
		rotateZ(radians(-rot));
		translate( 0, 0, offset_buildPlate)
		// boundingBox minZ
		translate(0,0, -offset_buildPlate + boundingBox.min.z);
		rotateZ(radians(rot));
		rect(boundingBox.min.x , boundingBox.min.y, boundingBox.max.x - boundingBox.min.x, boundingBox.max.y-boundingBox.min.y);
		rotateZ(radians(-rot));
		translate(0,0, offset_buildPlate - boundingBox.min.z);
		//bounding box maxZ
		translate(0,0, -offset_buildPlate + boundingBox.max.z)
		rotateZ(radians(rot));
		rect(boundingBox.min.x , boundingBox.min.y, boundingBox.max.x - boundingBox.min.x, boundingBox.max.y-boundingBox.min.y);
		rotateZ(radians(-rot));
		translate(0,0, offset_buildPlate - boundingBox.max.z);
		rotateX(radians(-rot_angle))
		translate(-offset.ZAxis.X, -offset.ZAxis.Y,0);	
		translate (0,0,pos);
		var layStep = Math.ceil(layers.length / nb_pts);
		for (var layer = 0; layer < layers.length; layer += layStep)
		{
			var couche = layers[layer].layer;
			//console.log(couche.lBBox.min.z);
			stroke(255,0,0);
			strokeWeight(1);
			fill(color(255,0,0));
			//translate(offset.XAxis.X, offset.XAxis.Y);
			//line(couche.lBBox.min.x , -couche.lBBox.min.z, couche.lBBox.max.x, -couche.lBBox.min.z);
			//translate(-offset.XAxis.X, -offset.XAxis.Y);
			//line((couche.lBBox.min.y + offset.YAxis.X), (offset.YAxis.Y - couche.lBBox.min.z), (couche.lBBox.max.y + offset.YAxis.X), (offset.YAxis.Y - couche.lBBox.min.z));
			translate(0,0,-pos)
			translate(offset.ZAxis.X, offset.ZAxis.Y);
			rotateX(radians(rot_angle));
			translate(0,0, -offset_buildPlate)
			rotateZ(radians(rot));
			beginShape();
			var jmp = Math.ceil(couche.points.length / nb_pts);
			//ambientMaterial(250,0,0);
			for (var pt = 1; pt < couche.points.length; pt += jmp)
			{
				if (couche.points[pt].e < couche.points[pt-1].e)
				{
					endShape();
					beginShape();
				}
				if (couche.points[pt].e > couche.points[pt-1].e)
				{
					translate(0,0, couche.points[pt].z);
					//strokeWeight(2);
					point(couche.points[pt].x, couche.points[pt].y, couche.points[pt].z);//couche.points[pt].x, couche.points[pt].y);
					translate(0,0,-couche.points[pt].z);
				}
			}
			endShape();
			rotateZ(radians(-rot));
			translate(0,0,offset_buildPlate);
			rotateX(radians(-rot_angle));
			translate(0,0,pos);
			translate( -offset.ZAxis.X, - offset.ZAxis.Y);
		}
		if (!mouseIsPressed)
		{
			if (nb_pts < max_pts)
				nb_pts *= 2;
			else
			{
				last_rot = rot;
				last_rot_angle = rot_angle;
				nb_pts = 32;
			}
		} else {
			nb_pts = 32;
		}
	}
	var dur = (new Date() - start)/100;
	//console.log(dur);
	if (dur > 10)
	{
		console.log("moins de points");
	}
	//rot+= dur;
}

function resetDisplay(FORCE_2D)
{
	clear();
	//resetMatrix();
	perspective(60 / 180 * PI, width / height, cameraZ * 0.1, cameraZ * 10);
	pointLight(250, 250, 250, 0, 0, 50);
	ambientMaterial(250);
	stroke(0);
	strokeWeight(1);
	fill(color(250,250,250));
	if (!FORCE_2D)
	{
		translate(-width/2, -height/2);
	}
	if (FORCE_2D)
	{
		rect(10, 40, 380, 600);
		rect(810, 40, 380, 600);
		translate(0,0,100);
	}
	translate(width/2,450, -pos);
	if (!FORCE_2D)
	{
		rotateX(radians(rot_angle));
		translate(0,0,-offset_buildPlate+0.1);
		rotateZ(radians(rot));
		line(-190,0,190,0);
		line(-(Math.sqrt(3)/2)*190, 100,(Math.sqrt(3)/2)*190, 100);
		line(-(Math.sqrt(3)/2)*190,-100,(Math.sqrt(3)/2)*190,-100);
		line(0,-190,0,190);
		line(100,-(Math.sqrt(3)/2)*190, 100,(Math.sqrt(3)/2)*190);
		line(-100, -(Math.sqrt(3)/2)*190,-100,(Math.sqrt(3)/2)*190);
		rotateZ(radians(-rot));
		translate(0,0,-0.1)
		rotateX(radians(90));
		stroke(125);
		line(-190,0,-190,600);
		line(190,0,190,600);
		stroke(0);
		rotateX(radians(-90));
		rotateZ(radians(rot));
	} else {
		line(-190,0,190,0);
		line(-(Math.sqrt(3)/2)*190, 100,(Math.sqrt(3)/2)*190, 100);
		line(-(Math.sqrt(3)/2)*190,-100,(Math.sqrt(3)/2)*190,-100);
		line(0,-190,0,190);
		line(100,-(Math.sqrt(3)/2)*190, 100,(Math.sqrt(3)/2)*190);
		line(-100, -(Math.sqrt(3)/2)*190,-100,(Math.sqrt(3)/2)*190);
	}
	ellipse(0,0,380,380);
	if (!FORCE_2D)
	{
		translate(0,0,600);	
		noFill();
		ellipse(0,0,380,380);
		translate(0,0,-600)
		rotateZ(radians(-rot));
		translate(0,0,offset_buildPlate);
		rotateX(radians(-rot_angle));
		translate(width/2, height/2);
	} else {
		translate(0,0, -100);
	}
	translate(-width/2,-450,pos);
		
}

function mouseWheel(event) {
  //print(event.delta);
  //move the square according to the vertical scroll amount
  //pos += event.delta*10;
  //draw(true)
  //uncomment to block page scrolling
  //return false;
}
	