'use strict';

export class PatternGenerator extends HTMLElement {
	constructor(n) {
		
		super();
		this.tiles = {
			1: [],
			2: [],
			3: []
		}
	
		this.shadow = this.attachShadow({ mode: 'open' });

		const container = document.createElement('template');

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<style>
				#content {
					height: 100%;
					width: 100%;
				}

				canvas {
					height: 100%;
					width: 100%;
				}
			</style>
			
			<div id="content">
				<canvas id="canvas"></canvas>
				<button id="save">Save</button>
			</div>
				
		`;

	
		this.shadow.appendChild(container.content.cloneNode(true));
		
		this.shadow.getElementById('save').onclick = () => {
			let svg = paper.project.exportSVG({asString: true})
			// Create a Blob with the SVG content
			const blob = new Blob([svg], {type: 'image/svg+xml'});
			
			// Create a temporary URL for the Blob
			const url = URL.createObjectURL(blob);
			
			// Create a temporary anchor element
			const link = document.createElement('a');
			link.href = url;
			link.download = 'pattern.svg';
			
			// Append the link to the body, click it, and remove it
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			
			// Revoke the temporary URL
			URL.revokeObjectURL(url);
		}
	
		

	}
	


	connectedCallback() {
		paper.install(window)
		let canvas = this.shadow.getElementById('canvas');
		paper.setup(canvas);

		let c = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Size(100,100))
		c.strokeColor = 'black'

		const worker = new Worker('worker-tripoints.js');
		const workerTile = new Worker('worker-tile.js');
		worker.onmessage = (e) => {
			console.log("answer", e.data)

			this.sideLength = e.data.sideLength
			this.height = e.data.height
			this.connectionAmount = e.data.tripoints.length /3
			
			workerTile.postMessage({sides: 1, tripoints: e.data.tripoints, weights: e.data.weights, radius: e.data.radius})
			workerTile.postMessage({sides: 2, tripoints: e.data.tripoints, weights: e.data.weights, radius: e.data.radius})
			workerTile.postMessage({sides: 3, tripoints: e.data.tripoints, weights: e.data.weights, radius: e.data.radius})
		};
		worker.postMessage({ sides: 1 });

		workerTile.onmessage = (e) => {
			//console.log("answer tile", e.data.svg)
			
			let elem = paper.project.importJSON(e.data.svg)
			console.log(elem)
			for(let e of elem.children){
				e.fillColor = Color.random()
			}
			
			//elem.position = paper.view.center
			//elem.insertBelow(c)

			this.addTile(e.data.sides, elem, e.data.infos)

			
			
		}
		
	}

	drawRandom(array) {
		if (array.length === 0) {
			return undefined;
		}
		const randomIndex = Math.floor(Math.random() * array.length);
		return array[randomIndex];
	}

	addTile(sides, tile, connectionInfo){
		tile.connectionInfo = connectionInfo
		this.tiles[sides].push(tile)
		if(this.tiles[3].length > 0 && this.tiles[2].length > 0 && this.tiles[1].length > 0){
			let baseGrid = this.createGrid(8,10)
			console.log(baseGrid)
			this.fillGrid(baseGrid, false)
			this.spread(baseGrid)
			this.startColorString(0,0, ["red", "blue"])

		}
	}

	startColorString(x, y, colors){
		let thread = this.drawRandom(this.tileGrid[x][y].children)
		thread.fillColor = this.drawRandom(colors)
		thread.isColored = true
		console.log("colored connection", thread.parent.connectionInfo[thread.index])
		this.findNextThread(thread)
		return thread
	}

	findNextThread(thread){
		console.log("thread find next", thread.parent.connectionInfo, thread.index)
		let correctInfo = thread.parent.connectionInfo[thread.index]
		if(!correctInfo){
			console.log("no correct info", thread.parent)
			return
		}
		let endCurve = correctInfo.endCurve
		let endPoint = correctInfo.endNr
		if(isNaN(endCurve) || isNaN(endPoint)){
			console.log("no endCurve - deco end reached", correctInfo)
			return
		}

		let x = thread.parent.gridPos[0]
		let y = thread.parent.gridPos[1]

		let nextTile
		try{
			switch(endCurve){
				case 0:
				console.log("x-1")
				nextTile = this.tileGrid[x-1][y]
				break
			case 1:
				console.log("x+1")
				nextTile = this.tileGrid[x+1][y]
				break
			case 2:
				console.log("y+1")
				nextTile = this.tileGrid[x][y+1]
					break
			}
		}catch(e){
			console.log("no next tile")
			return
		}

		if(nextTile){
			console.log("nextTile", nextTile)
			let nextThread = nextTile.children.find( (e, index) => e.parent.connectionInfo[index].startCurve == endCurve && e.parent.connectionInfo[index].startNr == this.connectionAmount -1 - endPoint || e.parent.connectionInfo[index].endCurve == endCurve && e.parent.connectionInfo[index].endNr == this.connectionAmount -1 - endPoint)
			//if(nextThread){
			//	this.findNextThread(nextThread)
			//}
			nextThread.fillColor = "green"
			nextThread.strokeColor = "red"
		}

		//let nextTile = this.tileGrid[x+info.x][y+info.y]
		//return this.drawRandom(nextTile.children)
	}

	correctConnectionPoints(tile){
		console.log("tile to correct", tile.connectionInfo)
		let info = tile.connectionInfo

		let correctedInfo = []
		for(let i = 0; i<info.length; i++){
			if(!info[i]){
				correctedInfo.push(undefined)
			}else{
				correctedInfo.push({
					startNr: this.correctPoint(tile, info[i].startNr),
					endNr: this.correctPoint(tile, info[i].endNr),
					startCurve: this.correctCurve(tile, info[i].startCurve),
					endCurve: this.correctCurve(tile, info[i].endCurve)
				})
			}
		}
		console.log("correctedInfo", correctedInfo)
		return correctedInfo
	}

	correctPoint(tile, point){
		if(tile.tileMirror){
			return this.connectionAmount-1 - point
		}
		
		return point
	}

	correctCurve(tile, curve){
		let c = curve
		
		if(tile.tileMirror && tile.tileType > 1){
			switch(c){
				case 0:
					c = 1
					break
				case 1:
					c = 0
					break
			}
		}

		c = (c + tile.tileOrientation)%3
		return c
	}

	createGrid(x,y){
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
	
	fillGrid(grid, hasEmpty=true){
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
				
				//let foundTile = this.getTile(this.hasLeftLine(lastLeft), this.hasTopLine(lastTop), hasEmpty)
				//console.log(foundTile)
				grid[x][y] = this.getTile(this.hasLeftLine(lastLeft), this.hasTopLine(lastTop), hasEmpty)
				//console.log(grid[0])
				//console.log(lastLeft, hasLeftLine(lastLeft), lastTop, hasTopLine(lastTop), grid[x][y])
			}
		}
	}

	spread(grid){
		
		
		let threeSide = this.tiles[3][0]
		let twoSide = this.tiles[2][0]
		let oneSide = this.tiles[1][0]	
		let mirrorPercentage = 0.5

		this.tileGrid = []
		console.log("threeside info", threeSide)
	
		
		let lastPos = [100,100]
		let l = this.sideLength
		let h = this.height
		for(let x = 0; x<grid.length; x++){
			let row = []
			for(let y = 0; y<grid[0].length; y++){
				let shape
				if(grid[x][y].type == 0){
					//shape = tri.clone()
					continue
				}
				if(grid[x][y].type == 1){
					shape = oneSide.clone()
					shape.connectionInfo = oneSide.connectionInfo
					paper.project.activeLayer.addChild(shape)
					if(Math.random() < mirrorPercentage){
						shape.rotate(-120)
						shape.scale(-1,1)
						shape.rotate(120)
						shape.tileMirror = true
					}
				}
				if(grid[x][y].type == 2){
					shape = twoSide.clone()
					shape.connectionInfo = twoSide.connectionInfo
					paper.project.activeLayer.addChild(shape)
					if(Math.random() < mirrorPercentage){
						shape.scale(-1,1)
						shape.tileMirror = true
					}
				}
				if(grid[x][y].type == 3){
					shape = threeSide.clone()
					shape.connectionInfo = threeSide.connectionInfo
					paper.project.activeLayer.addChild(shape)
					if(Math.random() < mirrorPercentage){
						shape.scale(-1,1)
						shape.tileMirror = true
					}
				}
				
				shape.position = [200 + l/2*x,200+ h*y]
				shape.rotate(grid[x][y].orientation * 120)
				shape.rotate(grid[x][y].rotation, shape.bounds.center)
				shape.gridPos = [x,y]
				shape.tileOrientation = grid[x][y].orientation
				shape.tileRotation = grid[x][y].rotation
				shape.tileType = grid[x][y].type
				shape.children[0].remove() //remove outer triangle
				shape.connectionInfo = this.correctConnectionPoints(shape)

				row.push(shape)
			}
			this.tileGrid.push(row)
		}
	}

	getTile(leftLine, topLine, hasEmpty=true){
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

		let t = tile[Math.floor(Math.random()*tile.length)];
		// if(t.type == 1){
		// 	t = tile[Math.floor(Math.random()*tile.length)];
		// 	if(t.type == 1){
		// 		t = tile[Math.floor(Math.random()*tile.length)];
		// 		if(t.type == 1){
		// 			t = tile[Math.floor(Math.random()*tile.length)];
		// 		}
		// 	}
		// }
		return t
	}

	hasLeftLine(tile){
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
	
	hasTopLine(tile){
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
	

}

customElements.define('pattern-generator', PatternGenerator);