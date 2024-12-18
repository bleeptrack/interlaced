function audioPlug(plugwidth, maxLength){
    let path = new Path()
    path.add([-plugwidth*1.6, 0])
    path.add([-plugwidth*1.6, maxLength*0.3])
    path.add([-plugwidth, maxLength*0.3])
    path.add([-plugwidth, maxLength*0.75])
    path.add([-plugwidth/2, maxLength*0.75])
    path.add([-plugwidth, maxLength*0.9])
    path.add([0, maxLength])
    path = mirror(path)

    path = addCut(path, 0.3, plugwidth, maxLength)
    path.rotate(180)
    path.position = this.tri.position
    path.pivot = path.bounds.bottomCenter.subtract([0,1])
    path.fillColor = 'red'
    path.closed = true
    path.weight = plugwidth
    return path
}

function cinchPlug(plugwidth, maxLength){
    let path = new Path()
    path.add([-plugwidth*1, -maxLength*0.3])
    path.add([-plugwidth*4, maxLength*0.1])
    path.add([-plugwidth*4, maxLength*0.6])
    path.add([-plugwidth*3, maxLength*0.6])
    path.add([-plugwidth*3, maxLength*0.8])
    path.add([-plugwidth*0.7, maxLength*0.8])
    path.add([-plugwidth*0.7, maxLength*0.9])
    path.add([0, maxLength*0.95])
    path = mirror(path)
    let mid = Math.floor(path.segments.length/2)
    path.smooth({ from: mid-1, to: mid+2 })

    path = addCut(path, 0.8, plugwidth, maxLength)
    path = addCut(path, 0.6, plugwidth, maxLength)
    
    path.rotate(180)
    path.position = this.tri.position
    path.pivot = path.bounds.bottomCenter.subtract([0,1])
    path.fillColor = 'red'
    path.closed = true
    path.weight = plugwidth
    return path
}

function usbAPlug(plugwidth, maxLength){
    let path = new Path()
    path.add([-plugwidth*1, 0])
    path.add([-plugwidth*2, maxLength*0.1])
    path.add([-plugwidth*2, maxLength*0.2])
    path.add([-plugwidth*4, maxLength*0.2])
    path.add([-plugwidth*4, maxLength*0.7])
    path.add([-plugwidth*3.2, maxLength*0.7])
    path.add([-plugwidth*3.2, maxLength*1.2])
    path = mirror(path)
    
    let hole = new Path()
    hole.add([-plugwidth*2.2, maxLength*0.9])
    hole.add([-plugwidth*2.2, maxLength*1])
    hole.add([-plugwidth*1, maxLength*1])
    hole.add([-plugwidth*1, maxLength*0.9])
    hole.closed = true
    let tmp = path.subtract(hole)
    hole.remove()
    path.remove()
    path = tmp

    hole = new Path()
    hole.add([plugwidth*2.2, maxLength*0.9])
    hole.add([plugwidth*2.2, maxLength*1])
    hole.add([plugwidth*1, maxLength*1])
    hole.add([plugwidth*1, maxLength*0.9])
    hole.closed = true
    tmp = path.subtract(hole)
    hole.remove()
    path.remove()
    path = tmp
    
    path = addCut(path, 0.7, plugwidth, maxLength)
    
    path.rotate(180)
    path.position = this.tri.position
    path.pivot = path.bounds.bottomCenter.subtract([0,1])
    path.fillColor = 'red'
    path.closed = true
    path.weight = plugwidth
    return path
}

function vgaPlug(plugwidth, maxLength){
    let path = new Path()
   
    path.add([-plugwidth, 0])
    path.add([-plugwidth*1.5, 0])
    path.add([-plugwidth*1.5, maxLength*0.2])
    path.add([-plugwidth*2.5, maxLength*0.2])
    path.add([-plugwidth*4.3, maxLength*0.4])

    path.add([-plugwidth*4.3, maxLength*0.4])
    path.add([-plugwidth*4.3, maxLength*0.1])
    path.add([-plugwidth*5.8, maxLength*0.1])
    path.add([-plugwidth*5.8, maxLength*0.4])

    path.add([-plugwidth*6.5, maxLength*0.4])
    path.add([-plugwidth*6.5, maxLength*1])
    path.add([-plugwidth*4.5, maxLength*1])
    path.add([-plugwidth*4.5, maxLength*1.15])
    path = mirror(path)

    path = addCut(path, 1, plugwidth, maxLength)
    //path = addCut(path, 0.4, plugwidth, maxLength)

    path.rotate(180)
    path.position = this.tri.position
    path.pivot = path.bounds.bottomCenter.subtract([0,1])
    path.fillColor = 'red'
    path.closed = true
    path.weight = plugwidth
    return path
}

function euroPlug(plugwidth, maxLength){
    let path = new Path()
    path.add([-plugwidth, 0])
    path.add([-plugwidth*1.5, 0])
    path.add([-plugwidth*1.5, maxLength*0.2])
    path.add([-plugwidth*4, maxLength*0.7])
    path.add([-plugwidth*5, maxLength*0.7])
    path.add([-plugwidth*5, maxLength*0.8])
    path.add([-plugwidth*3, maxLength*0.8])
    path.add([-plugwidth*3, maxLength*1.1])
    path.add([-plugwidth*2.25, maxLength*1.17])
    path.add([-plugwidth*1.5, maxLength*1.1])
    path.add([-plugwidth*1.5, maxLength*0.8])
    path = mirror(path)

    path.smooth({ from: 7, to: 10 })

    path.smooth({ from: 12, to: 15 })
    path = addCut(path, 0.8, plugwidth, maxLength)


    
    path.rotate(180)
    path.position = this.tri.position
    path.pivot = path.bounds.bottomCenter.subtract([0,1])
    path.fillColor = 'red'
    path.closed = true
    path.weight = plugwidth
    return path
}

function addCut(path, pos, plugwidth, maxLength){
    let cut = new Path()
    cut.add([-plugwidth*10, maxLength*pos])
    cut.add([-plugwidth*10, maxLength*(pos+0.03)])
    cut.add([plugwidth*10, maxLength*(pos+0.03)])
    cut.add([plugwidth*10, maxLength*pos])
    cut.closed = true
    tmp = path.subtract(cut)
    cut.remove()
    path.remove()
    path = tmp
    return path
}

function mirror(path){
    let oddAdd = path.segments.length%2 ? 0 : 1
    for(let i = path.segments.length-1-oddAdd; i >= 0; i--){
        path.add(path.segments[i].point.multiply([-1, 1]))
    }
    
    return path
}

let plugends = [euroPlug, vgaPlug, audioPlug, usbAPlug]

