let radius = 150
let maxWeight = 10
let minWeight = 2
let minPoints = 2
let maxPoints = 4

let weights = []
let tri
let len
let points
let triPoints = []

//in der nähe einer kreuzung sollte sich nichts anderes kreuzen dürfen
// linie darf nicht raus gehen
//punkte nicht so nah zusammen
//super kleine intersection flächen ignorieren

//idee: statt leerer stelle ein zweites muster einführen?


paper.install(window);
window.onload = function () {
  paper.setup("paperCanvas");

    //paper.view.zoom = 0.5
    //paper.view.center = paper.view.center.add([600,600]) 

    tri = new Path.RegularPolygon(view.bounds.center, 3, radius)
    tri.strokeColor = 'black'

    len = tri.length/6
    points = generatePointList()
    
    points.forEach( function(p,idx){
        if(idx == 0)
            weights.push(minWeight)
        if(idx == 1)
            weights.push(maxWeight)
        if(idx > 1)
            weights.push(Math.random()*(maxWeight-minWeight)+minWeight)
    })

    

    drawPoints()

    /*triPoints.forEach(p => {
        let c = new Path.Circle(p, 5)
        c.fillColor = 'red'
    })*/

    //triPoints = triPoints.slice(triPoints.length*2/3)
    //console.log(triPoints)
    //let lines = connectPoints(triPoints)
    //lines.forEach( line => {
    //    sweep(line)    
    //})

    //buildTwoSide(triPoints)

    let grid = createGrid(8,10)
    fillGrid(grid, false)
    spread(buildThreeSide(triPoints), buildTwoSide(triPoints), buildOneSide(triPoints), grid, 0.5)
    
  
}





function sweep(line){
    
    let finalLine = new Path({ fillColor: 'black'})
    
    for(let j = 0; j<=100; j+=1){
        
        let i = j/100
        let w = (line.endWidth - line.startWidth)*i + line.startWidth
        
        finalLine.segments.unshift(new Segment(line.getPointAt(line.length*i).add(line.getNormalAt(line.length*i).multiply(w) )))
        finalLine.segments.push(new Segment(line.getPointAt(line.length*i).subtract(line.getNormalAt(line.length*i).multiply(w) )))
    }
    finalLine.closed = true
    return finalLine
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function generatePointList(){
    let points = []
    for(let i = 0; i<Math.floor(Math.random()*(maxPoints-minPoints))+minPoints; i++){
        let newPoint = Math.random()*len*0.7 + len*0.2
        let minDist = Math.min(...points.map( p => newPoint-p ) )
        let rescueCount = 0
        while(points.length > 0 && minDist < 15 && rescueCount < 10){
            newPoint = Math.random()*len*0.7 + len*0.2
            minDist = Math.min(...points.map( p => newPoint-p ) )
            rescueCount++
        }
        console.log(rescueCount)
        if(rescueCount < 10){
            points.push(newPoint)
        }
    }
    points.sort((a, b) => a - b)
    return points
}

function connectPoints(triPoints){
    
    let nr = triPoints.length/3
    let available = []
    let lines = []
    
    for(let i = 0; i<triPoints.length; i++){
        available.push(triPoints[i])
    }
 
    while(available.length > 0){
        shuffle(available);
        
        let handleLength1 = Math.random()*100+30
        let handleLength2 = Math.random()*100+30
        
        let line = new Path()
        //line.add(new Segment(available[0], null, view.bounds.center - available[0]))
        line.add(new Segment(available[0], null, tri.getNormalAt(tri.getOffsetOf(available[0])).multiply(-handleLength1)))
        //line.add(new Segment(available[1], view.bounds.center - available[1], null))
        line.add(new Segment(available[1], tri.getNormalAt(tri.getOffsetOf(available[1])).multiply(-handleLength2), null))
        line.strokeColor = 'blue'
        line.strokeWidth = 2
        line.startWidth = available[0].sweepWidth
        line.endWidth = available[1].sweepWidth
        available.splice(0,2)
        line.remove()
        lines.push(line)
    }
    return lines
}

function drawPoints(){
    tri.curves.forEach(function(curve, idx){   
        let row = []
        points.forEach(function(p, idx){
                let sweepWidth = weights[idx]
                let p1 = curve.getPointAt(p)
                p1.sweepWidth = sweepWidth
                row.unshift(p1)
                
                let p2 = curve.getPointAt(curve.length-p)
                p2.sweepWidth = sweepWidth
                row.push(p2)     
        })
        triPoints.push(...row)
    })
}

function buildThreeSide(triPoints){
    //let points = triPoints.slice(triPoints.length*2/3)
    return buildSide(triPoints)
}

function buildTwoSide(triPoints){
    //let points = triPoints.slice(triPoints.length/3)
    let points = triPoints.slice(0,triPoints.length/3)
    points.push(...triPoints.slice(triPoints.length/3, triPoints.length*2/3))
    return buildSide(points)
}

function buildOneSide(triPoints){
    let points = triPoints.slice(0,triPoints.length/3)
    return buildSide(points)
}

function buildSide(triPoints){
    let c = new Path.Circle(tri.bounds.topCenter.add( [0,radius] ), 5)
    //c.fillColor = 'red'
    
    
    let lines = connectPoints(triPoints)
    let combinedShape = new CompoundPath()
    let allLines = []
    
    let g = new Group(tri.clone())
    
    lines.forEach( line => {
        //combinedShape.addChild(sweep(line)) 
        allLines.push(sweep(line))
    })
    for(let i = 0; i<allLines.length; i++){
        let line1 = allLines[i]
        for(let j = i+1; j<allLines.length; j++){
            if(i != j){
                let line2 = allLines[j]
              
                let crossing = line1.intersect(line2)
                //crossing.remove()
                crossing.fillColor = 'blue'
                //g.addChild(crossing)
                
               
                let crossingArr 
                if(crossing._class=="CompoundPath"){
                    let tmp = crossing.children
                    //crossing.remove()
                    crossingArr = tmp
                    console.log("combo!", crossingArr.length, crossingArr)
                }else{
                    crossingArr = [crossing]
                }
                crossingArr.forEach(function(cross, idx){
                    console.log("IDX", idx)
                    let col = Color.random()
                    if(cross.segments.length > 0){
                        cross.fillColor = 'yellow'
                        
                        //crossing.scale(2)
                    
                        let bigCrossing = PaperOffset.offset(cross, 4)
                        bigCrossing.strokeColor = 'black'
                       
                        if(Math.random()<0.5){
                            let tmp = line1.subtract(bigCrossing)
                            line1.remove()
                            allLines[i] = tmp
                            line1 = tmp
                        }else{
                            let tmp = line2.subtract(bigCrossing)
                            line2.remove()
                            allLines[j] = tmp
                            line2 = tmp
                        }
                        //cross.remove()
                        //bigCrossing.fillColor = col
                        //bigCrossing.opacity = 1
                        bigCrossing.remove()
                       
                        
                        //g.addChild(bigCrossing)
                        //cross.opacity = 1
                        //g.addChild(cross.clone())
                        
                    }
                })
                crossing.remove()
                
            }
        }
        g.addChild(line1)
    }
    
    /*allLines.forEach( line => {
        combinedShape.addChild(line) 
    })
    combinedShape.fillColor = 'blue'
    g.addChild(combinedShape.clone())
    */
    
    g.pivot = new Point(g.bounds.topCenter.add( [0,radius] ))
    return g
}

/*function buildThreeSide(){
    let shape = new Path(triPoints)
    shape.fillColor = 'black'
    let c = new Path.Circle(tri.bounds.topCenter + [0,radius], 5)
    c.fillColor = 'red'
    let g = new Group(tri.clone(), shape, c)
    g.pivot = new Point(g.bounds.topCenter + [0,radius])
    return g
}

function buildTwoSide(){
    let shape = new Path(triPoints.slice(0,4))
    shape.fillColor = 'black'
    let c = new Path.Circle(tri.bounds.topCenter + [0,radius], 5)
    c.fillColor = 'red'
    let g = new Group(tri.clone(), shape, c)
    g.pivot = new Point(g.bounds.topCenter + [0,radius])
    return g
}

function buildOneSide(){
    let shape = new Path(triPoints.slice(0,2))
    shape.add(tri.position)
    shape.fillColor = 'black'
    let c = new Path.Circle(tri.bounds.topCenter + [0,radius], 5)
    c.fillColor = 'red'
    let g = new Group(tri.clone(), shape, c)
    g.pivot = new Point(g.bounds.topCenter + [0,radius])
    return g
}
*/

function createGrid(x,y){
    let grid = []
    for(let i = 0; i<x; i++){
        let row = []
        for(let j = 0; j<y; j++){
            row.push({
                type:0, 
                rotation: 180 * ((i+j)%2),
                orientation:0
            })
        }
        grid.push(row)
    }
    return grid
}

function fillGrid(grid, hasEmpty=true){
    for(let x = 0; x<grid.length; x++){
        let lastLeft = {
            type: hasEmpty ? Math.floor(Math.random()*4) : Math.floor(Math.random()*3)+1,
            rotation: 180 * ((x)%2),
            orientation: Math.floor(Math.random()*3)
        }
        
        for(let y = 0; y<grid[0].length; y++){
            let lastTop = {
                type: hasEmpty ? Math.floor(Math.random()*4) : Math.floor(Math.random()*3)+1,
                rotation: 180 * Math.abs(((x-1+y)%2)),
                orientation: Math.floor(Math.random()*3)
            }
            if(x>0){
                lastLeft = grid[x-1][y]
            }
            if(y>0){
                lastTop = grid[x][y-1]
            }    
            grid[x][y] = getTile(hasLeftLine(lastLeft), hasTopLine(lastTop), hasEmpty)
            console.log(grid[0])
            //console.log(lastLeft, hasLeftLine(lastLeft), lastTop, hasTopLine(lastTop), grid[x][y])
        }
    }
}

function hasLeftLine(tile){
    if(tile.type==3){
        return true;
    }
    if(tile.rotation==0){
        if(tile.type==2 && tile.orientation<2){
            return true
        }
        if(tile.type==1 && tile.orientation==1){
            return true
        }
    }else{
        if(tile.type==2 && tile.orientation!=1){
            return true
        }
        if(tile.type==1 && tile.orientation==0){
            return true
        }
    }
    return false
}

function hasTopLine(tile){
    if(tile.rotation==180){
        return undefined
    }
    if(tile.type==3){
        return true;
    }
    if(tile.type==2 && tile.orientation!=0){
        return true
    }
    if(tile.type==1 && tile.orientation==2){
        return true
    }
    return false
}

function getTile(leftLine, topLine, hasEmpty=true){
    let tile = []
    if(leftLine){
        if(topLine){
            tile = [{
                type: 3,
                rotation: 180,
                orientation: 0
            },
            {
                type: 3,
                rotation: 180,
                orientation: 1
            },
            {
                type: 3,
                rotation: 180,
                orientation: 2
            },
            {
                type: 2,
                rotation: 180,
                orientation: 1
            }]
        }else{
            if(topLine===undefined){
                tile = [{
                    type: 3,
                    rotation: 0,
                    orientation: 0
                },
                {
                    type: 3,
                    rotation: 0,
                    orientation: 1
                },
                {
                    type: 3,
                    rotation: 0,
                    orientation: 2
                },
                {
                    type: 2,
                    rotation: 0,
                    orientation: 0
                },
                {
                    type: 2,
                    rotation: 0,
                    orientation: 2
                },
                {
                    type: 1,
                    rotation: 0,
                    orientation: 0
                }]
            }else{
                tile = [{
                    type: 2,
                    rotation: 180,
                    orientation: 0
                },
                {
                    type: 1,
                    rotation: 180,
                    orientation: 1
                }]
            }
        }
    }else{
        if(topLine){
            tile = [{
                type: 2,
                rotation: 180,
                orientation: 2
            },
            {
                type: 1,
                rotation: 180,
                orientation: 2
            }]
        }else{
            if(topLine===undefined){
                tile = [{
                    type: 1,
                    rotation: 0,
                    orientation: 1
                },
                {
                    type: 1,
                    rotation: 0,
                    orientation: 2
                },
                {
                    type: 2,
                    rotation: 0,
                    orientation: 1
                },
                {
                    type: 0,
                    rotation: 0,
                    orientation: 0
                }]
            }else{
                tile = [{
                    type: 1,
                    rotation: 180,
                    orientation: 0
                },
                {
                    type: 0,
                    rotation: 180,
                    orientation: 0
                }]
            }
            if(!hasEmpty){
                tile.pop()
            }
            
        }
    }

    t = tile[Math.floor(Math.random()*tile.length)];
    if(t.type == 1){
        t = tile[Math.floor(Math.random()*tile.length)];
        if(t.type == 1){
            t = tile[Math.floor(Math.random()*tile.length)];
            if(t.type == 1){
                t = tile[Math.floor(Math.random()*tile.length)];
            }
        }
    }
    return t
}

function spread(threeSide, twoSide, oneSide, grid, mirrorPercentage=0){
    /*threeSide.position = [100,1200]
    twoSide.position = [500,1200]
    oneSide.position = [900,1200]
    */
    

    
    let lastPos = [100,100]
    let l = tri.firstCurve.length
    let h = tri.bounds.height
    for(let x = 0; x<grid.length; x++){
        for(let y = 0; y<grid[0].length; y++){
            let shape
            if(grid[x][y].type == 0){
                //shape = tri.clone()
                continue
            }
            if(grid[x][y].type == 1){
                shape = oneSide.clone()
                if(Math.random() < mirrorPercentage){
                    shape.rotate(-120)
                    shape.scale(-1,1)
                    shape.rotate(120)
                }
            }
            if(grid[x][y].type == 2){
                shape = twoSide.clone()
                if(Math.random() < mirrorPercentage){
                    shape.scale(-1,1)
                }
            }
            if(grid[x][y].type == 3){
                shape = threeSide.clone()
                if(Math.random() < mirrorPercentage){
                    shape.scale(-1,1)
                }
            }
            
            shape.position = [200 + l/2*x,200+ h*y]
            shape.rotate(grid[x][y].orientation * 120)
            shape.rotate(grid[x][y].rotation, shape.bounds.center)
            shape.children[0].remove() //remove outer triangle
            
            //shape.rotate(grid[x][y].orientation * 60)
        }
    }
    threeSide.remove()
    twoSide.remove()
    oneSide.remove()
    tri.remove()
    
    //paper.view.zoom = 0.7
    //paper.view.center = paper.view.center.add([600,600]) 
    
    //twoSide.rotate(-120)
    //twoSide.scale(-1,1)
    //twoSide.rotate(120)
    
    
    //stamp
    /*
    createStamps(threeSide.clone(), twoSide.clone(), oneSide.clone())
    //threeSide.remove()
    threeSide.position = threeSide.position.add([141,250])
    makeToStampCover(threeSide.clone())
    twoSide.position = twoSide.position.add([0,250])
    let twoclone = twoSide.clone().rotate(180)
    twoclone.bounds.bottomCenter.y = threeSide.bounds.bottomCenter.y + 10
    makeToStampCover(twoclone)
    oneSide.position = oneSide.position.add([-141,250])
    makeToStampCover(oneSide.clone())
    threeSide.remove()
    twoSide.remove()
    oneSide.remove()
    tri.remove()
    */
}

function createStamps(threeSide, twoSide, oneSide){
    let three = createStamp(threeSide)
    three.position.x += 141
    three.scale(-1,1)
    let one = createStamp(oneSide)
    one.position.x -= 141
    one.scale(-1,1)
    let two = createStamp(twoSide)
    two.scale(-1,1)
    two.rotate(180)
}

function createStamp(shape){
    shape.position = view.bounds.center
    let triangle = shape.removeChildren(0,1)[0]
    triangle.fillColor = 'black'
    triangle.strokeColor = null
    triangle = roundCorners(triangle, 20)
    let rim = triangle.clone()
    rim.strokeColor = 'red'
    rim.fillColor = null
    rim.insertAbove(shape)

    for(let line of shape.children){
        let tmp = triangle.subtract(line, {insert: false})
        triangle.remove()
        triangle = tmp
        //triangle.fillColor = Color.random()
    }
    triangle.insertAbove(shape)
    shape.remove()
    return new Group([triangle, rim])
}

function makeToStampCover(shape){
    //let triangle = shape.removeChildren(0,1)[0]
    let triangle = shape.removeChildren(0,1)[0]
    triangle.strokeColor = 'green'
    triangle.insertAbove(shape)
    triangle = roundCorners(triangle, 20)
    shape.fillColor = 'blue'
    shape.strokeColor = null
    shape.opacity = 1
}

function roundCorners(path,radius) {
	var segments = path.segments.slice(0);
	path.removeSegments();

	for(var i = 0, l = segments.length; i < l; i++) {
		var curPoint = segments[i].point;
		var nextPoint = segments[i + 1 == l ? 0 : i + 1].point;
		var prevPoint = segments[i - 1 < 0 ? segments.length - 1 : i - 1].point;
		var nextDelta = curPoint.subtract(nextPoint);
		var prevDelta = curPoint.subtract(prevPoint);

		nextDelta.length = radius;
		prevDelta.length = radius;

		path.add(
			new paper.Segment(
				curPoint.subtract(prevDelta),
				null,
				prevDelta.divide(2)
			)
		);

		path.add(
			new paper.Segment(
				curPoint.subtract(nextDelta),
				nextDelta.divide(2),
				null
			)
		);
	}
	path.closed = true;
	return path;
}

//let user download canvas content as SVG
function downloadSVG(){
    var svg = project.exportSVG({ asString: true, bounds: 'content' });
    var svgBlob = new Blob([svg], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "stamp.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
//scale to 70%
