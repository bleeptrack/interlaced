onmessage = function() {
    
    self.importScripts('node_modules/paper/dist/paper-full.js')
    self.importScripts('paperjs-offset-worker.js')
    paper.install(this)
	paper.setup(new Size(1000, 1000))

    this.radius = 150
    this.minWeight = 2
    this.maxWeight = 10
    this.minPoints = 2
    this.maxPoints = 4

    this.weights = []
    this.tri
    this.len
    this.points
    this.triPoints = []

    this.tri = new Path.RegularPolygon(view.bounds.center, 3, this.radius)
    this.tri.strokeColor = 'black'

    this.len = tri.length/6
    this.points = generatePointList()
    
    this.points.forEach( function(p,idx){
        if(idx == 0)
            this.weights.push(this.minWeight)
        if(idx == 1)
            this.weights.push(this.maxWeight)
        if(idx > 1)
            this.weights.push(Math.random()*(this.maxWeight-this.minWeight)+this.minWeight)
    })

    console.log("points", this.points)
    console.log("weights", this.weights)

    drawPoints()
    console.log(this.triPoints)

    postMessage({weights: this.weights, tripoints: this.triPoints, radius: this.radius, sideLength: tri.firstCurve.length, height: tri.bounds.height});


    function generatePointList(){
        let points = []
        let nrPoints = Math.floor(Math.random()*(this.maxPoints-this.minPoints))+this.minPoints
        console.log("generating points", nrPoints)
        let outerBorder = this.len*0.2
        let innerBorder = this.len*0.1
        let buffer = this.maxWeight
        let availableLength = this.len - outerBorder - innerBorder - (nrPoints-1)*2*buffer
        for(let i = 0; i<nrPoints; i++){
            points.push(Math.random()*availableLength)
        }
        points.sort((a, b) => a - b)
        console.log("points", points)
        for(let i = 0; i<points.length; i++){
            points[i] = points[i] + outerBorder + buffer*i*2
        }
        return points
    }

    function drawPoints(){
        this.tri.curves.forEach(function(curve, idx){   
            let row = []
            this.points.forEach(function(p, idx){
                    let sweepWidth = this.weights[idx]
                    let p1 = curve.getPointAt(p)
                    p1.sweepWidth = sweepWidth
                    row.unshift(p1)
                    
                    let p2 = curve.getPointAt(curve.length-p)
                    p2.sweepWidth = sweepWidth
                    row.push(p2)     
            })
            this.triPoints.push(...row)
        })
    }
}