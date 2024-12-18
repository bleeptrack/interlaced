self.importScripts('plugends.js')
self.importScripts('leafends.js')

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
    //this.tri.strokeColor = 'black'

    let result
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

    let infos = []
    for(let e of result.children){
        infos.push(e.connectionInfo)
    }
    infos.shift(); // Remove unavailable infro from outer triangle
    
    console.log("infos", infos)
    postMessage({svg: result.exportJSON(), sides: data.sides, infos: infos});
    





    function sweep(line){

        if(line.closed){
            return line
        }
        
        let finalLine = new Path({ fillColor: 'black'})
        
        for(let j = 0; j<=200; j+=1){
            
            let i = j/200
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
        
        return buildSide(points, true)
    }

    function buildConnectionInfo(lines){
        let info = {
            0: {},
            1: {},
            2: {}
        }
        for(let i = 0; i<lines.length; i++){
            let line = lines[i]
            console.log(line)
            if(line.connectionInfo){ //without info it's a deco-end
                if(line.connectionInfo.endCurve !== undefined){ //without endCurve it's a line going to a deco-end
                    info[line.connectionInfo.startCurve][line.connectionInfo.startNr] = {
                        targetCurve: line.connectionInfo.endCurve,
                        targetNr: line.connectionInfo.endNr
                    }
                
                    info[line.connectionInfo.endCurve][line.connectionInfo.endNr] = {
                        targetCurve: line.connectionInfo.startCurve,
                        targetNr: line.connectionInfo.startNr
                    }
                }else{
                    info[line.connectionInfo.startCurve][line.connectionInfo.startNr] = {
                        targetCurve: undefined,
                        targetNr: undefined
                    }
                }
            }
        }
        console.log("connectionInfo", info)
        return info
    }

    function buildSide(triPoints, hasDecoEnds=false){
        console.log("buildSide", triPoints.length)
        let lines = connectPoints(triPoints, hasDecoEnds)
        let connectionInfo = buildConnectionInfo(lines)
        let allLines = []
        
        let g = new Group(tri.clone())
        g.connectionInfo = connectionInfo
        
        for(let i = 0; i<lines.length; i++){
            //combinedShape.addChild(sweep(line)) 
            if(lines[i].closed){
                let l = sweep(lines[i+1])
                l.fillColor = Color.random()
                
                let fin = lines[i].unite(l, {insert: false})
                fin.connectionInfo = lines[i+1].connectionInfo

                allLines.push(fin)
                i+=1
            }else{
                let l = sweep(lines[i])
                l.connectionInfo = lines[i].connectionInfo
                allLines.push(l)
            }
            
        }

        //find intersections between all lines


        let intersectionCheckPath = new Path()

        for(let i = 0; i<allLines.length; i++){
            for(let j = i+1; j<allLines.length; j++){
                if(allLines[i].intersects(allLines[j])){
                    let inters = allLines[i].intersect(allLines[j], {insert: false})
                    if(inters._class == "CompoundPath"){
                        inters = inters.children
                    }else{
                        inters = [inters]
                    }
                    
                    for(let k = 0; k<inters.length; k++){
                        let inter = inters[k]
                        if(inter.area > 3){
                            try{
                                let bigCrossing = PaperOffset.offset(inter, 3)
                                bigCrossing.remove()
                                if(Math.random()<0 && !inter.intersects(intersectionCheckPath)){
                                    let info = allLines[j].connectionInfo
                                    allLines[j] = allLines[j].subtract(bigCrossing, {insert: false})
                                    allLines[j].connectionInfo = info
                                }else{
                                    info = allLines[i].connectionInfo
                                    allLines[i] = allLines[i].subtract(bigCrossing, {insert: false})
                                    allLines[i].connectionInfo = info
                                }
                                intersectionCheckPath = intersectionCheckPath.unite(bigCrossing, {insert: false})
                            }catch(e){
                                console.log("error", e)
                            }
                            
                        }
                    }
                }else{
                    //console.log("no intersection")
                }
            }
        }
        
        //add all lines to the final group
        
        allLines.forEach( line => {
            console.log("adding line", line.connectionInfo)
            g.addChild(line)
        })
        //intersectionCheckPath.fillColor = 'red'
        //g.addChild(intersectionCheckPath)
        
        g.pivot = new Point(g.bounds.topCenter.add( [0,radius] ))
        return g
    }


    function connectPoints(triPoints, hasDecoEnds=false){
        
        //let nr = triPoints.length/3
        let available = []
        let lines = []

        
        
        
        for(let i = 0; i<triPoints.length; i++){
            available.push(triPoints[i])
        }

        if(hasDecoEnds){
            let deco = createEnd()
            let deco2 = createEnd(false)
            
            shuffle(available);

            console.log("decoend incoming")
            let line = connectPoint(available[0], deco.position, tri.getNormalAt(tri.getOffsetOf(available[0])), deco.norm, available[0].sweepWidth, deco.weight)
            let line2 = connectPoint(available[1], deco2.position, tri.getNormalAt(tri.getOffsetOf(available[1])), deco2.norm, available[1].sweepWidth, deco2.weight)
            available.splice(0,2)
            line.remove()
            line2.remove()
            lines.push(deco)
            lines.push(line)
            lines.push(deco2)
            lines.push(line2)
            
            
        }

        while(available.length > 0){
            shuffle(available);
            
            let line = connectPoint(available[0], available[1], tri.getNormalAt(tri.getOffsetOf(available[0])), tri.getNormalAt(tri.getOffsetOf(available[1])), available[0].sweepWidth, available[1].sweepWidth)
            available.splice(0,2)
            line.remove()
            lines.push(line)
        }
        return lines
    }

    function connectPoint(start, end, norm1, norm2, startWidth, endWidth){
        let handleLength1 = Math.random()*100+30
        let handleLength2 = Math.random()*100+30
        
        let line = new Path()
        //line.add(new Segment(available[0], null, view.bounds.center - available[0]))
        line.add(new Segment(start, null, norm1.multiply(-handleLength1)))
        //line.add(new Segment(available[1], view.bounds.center - available[1], null))
        line.add(new Segment(end, norm2.multiply(-handleLength2), null))
        line.strokeColor = 'blue'
        line.strokeWidth = 2
        line.startWidth = startWidth
        line.endWidth = endWidth
        line.connectionInfo = {
            startNr: start.connectNr,
            endNr: end.connectNr,
            startCurve: start.curveNr,
            endCurve: end.curveNr
        }
        console.log(`connecting ${start.connectNr} to ${end.connectNr} from curve ${start.curveNr} to curve ${end.curveNr}`)
        return line
    }

    function createEnd(isTech=true){
        let rect 
        if(isTech){
            rect = createPlug()
        }else{
            rect = createLeaf()
        }
        
        let addRot = Math.random()*180-90
        let addPosMax = this.tri.bounds.height*0.2
        let addPos = new Point(0, 1).rotate(addRot).multiply(10)
        
        rect.rotate(120+addRot)
        while(!rect.intersects(this.tri)){
            rect.translate(addPos)
        }
        rect.translate(addPos.multiply(-1))
        rect.fillColor = 'red'
        //rect.strokeColor = 'black'
        let norm = new Point(0,1).rotate(-60+addRot)
        rect.norm = norm

        return rect
    }

    function createPlug(){
        let maxLength = this.tri.bounds.height*0.3

        let plugwidth = this.tri.bounds.height*0.05 / 2
        let plug = plugends[Math.floor(Math.random()*plugends.length)]
        //let plug = plugends[0]
        return plug(plugwidth, maxLength)
    }

    function createLeaf(){
        let leaf = leafend()
        return leaf
    }
    

}