onmessage = function(e) {
	let data = e.data
    console.log("data tile worker", data)
	
	self.importScripts('node_modules/paper/dist/paper-full.js')
    self.importScripts('paperjs-offset-worker.js')

    paper.install(this)
	paper.setup(new Size(1000, 1000))

    this.triPoints = data.tripoints
    this.weights = data.weights
    this.radius = data.radius

    this.tri = new Path.RegularPolygon(view.bounds.center, 3, this.radius)
    this.tri.strokeColor = 'black'

    let result = buildThreeSide(this.triPoints)
    switch(data.sides){
        case 3:
            result = buildThreeSide(this.triPoints)
            break
        case 2:
            result = buildTwoSide(this.triPoints)
            break
        case 1:
            result = buildOneSide(this.triPoints)
            break
    }


    postMessage({svg: result.exportJSON(), sides: data.sides});
    





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
        
        console.log("buildSide", triPoints)
        let lines = connectPoints(triPoints)
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


    function connectPoints(triPoints){
        console.log("connectPoints", triPoints)
        //let nr = triPoints.length/3
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

    
    

}