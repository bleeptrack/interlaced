function leafend(){
    let randWidth = Math.random() + 0.3
    let maxLength = this.tri.bounds.height*0.3
    let leaf = new Path()
    leaf.add(new Segment([0, 0], null, [-maxLength*randWidth,0]))
    leaf.add([0,-maxLength])
    leaf.add(new Segment([0, 0], [maxLength*randWidth,0], null))
    
    leaf.closed = true
   
    //leaf = decoLeaf(leaf)
    leaf = extendShapes(leaf)
    //leaf.add([2,0])
    //leaf.add([0,-maxLength])
    //leaf.add([-2,0])

    leaf.pivot = new Point(0,-1)
    leaf.position = this.tri.position
    leaf.fillColor = 'green'
    leaf.weight = 2
    return leaf
}

function extendShapes(leaf){
    let angle = 30
    let scaleDown = Math.random()*0.2 + 0.6
    let maxLength = leaf.bounds.height
    console.log("scaleDown", scaleDown)
    let nr = Math.floor(Math.random()*4) + 1

    let cutout = new Path()
    cutout.add([2,0])
    cutout.add([0,-maxLength])
    cutout.add([-2,0])


    for(let i = 1; i < nr; i++){
        let newLeaf = leaf.clone()
        newLeaf.scale(scaleDown**i, [0,0])
        //newLeaf.bounds.bottomCenter = leaf.bounds.bottomCenter
        newLeaf.rotate(angle*i, [0,0])
        leaf.remove()
        leaf = newLeaf.unite(leaf)
        newLeaf.remove()

        let cutout2 = new Path()
        cutout2.add([2,0])
        cutout2.add([0,-maxLength * scaleDown**i])
        cutout2.add([-2,0])
        cutout2.rotate(angle*i, [0,0])
        cutout = cutout2.unite(cutout)
        cutout2.remove()
        cutout.remove()

        let cutout3 = new Path()
        cutout3.add([2,0])
        cutout3.add([0,-maxLength * scaleDown**i])
        cutout3.add([-2,0])
        cutout3.rotate(angle*-i, [0,0])
        cutout = cutout3.unite(cutout)
        cutout3.remove()
        cutout.remove()
    }

    


    let half = leaf.clone()
    half.scale(-1,1, [0,0])
    leaf.remove()
    leaf = half.unite(leaf)
    leaf.remove()

    leaf = leaf.subtract(cutout)
    
    

    half.remove()

    return leaf
}

function decoLeaf(leaf){
    let dist = leaf.length/2 / Math.round(Math.random()*20+20)
    //let dist = 10
    console.log("dist", dist)
    let tang = Math.random()*3 
    //let tang = 10
    let newLeaf = new Path()
    console.log("leaf length", leaf.length)
    for (let i = 0; i < leaf.length; i+=dist*2){
        console.log("check at", i, i+dist)
        let point = leaf.getPointAt(i)
        let norm = leaf.getNormalAt(i)
        newLeaf.add(point.add(norm.multiply(tang)))
        if(i+dist < leaf.length){   
            let point2 = leaf.getPointAt(i+dist)
            let norm2 = leaf.getNormalAt(i+dist)
            newLeaf.add(point2.add(norm2.multiply(-tang)))
        }
    }
    newLeaf.closed = true
    return newLeaf
}

