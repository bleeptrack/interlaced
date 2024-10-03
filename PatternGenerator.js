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
			</div>
				
		`;

	
		this.shadow.appendChild(container.content.cloneNode(true));
		
	
		

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
			
			workerTile.postMessage({sides: 1, tripoints: e.data.tripoints, weights: e.data.weights, radius: e.data.radius})
			workerTile.postMessage({sides: 2, tripoints: e.data.tripoints, weights: e.data.weights, radius: e.data.radius})
			workerTile.postMessage({sides: 3, tripoints: e.data.tripoints, weights: e.data.weights, radius: e.data.radius})
			
		};
		worker.postMessage({ sides: 1 });

		workerTile.onmessage = (e) => {
			console.log("answer tile", e.data.svg)
			
			let elem = paper.project.importJSON(e.data.svg)
			console.log(elem)
			
			elem.position = paper.view.center
			elem.insertBelow(c)

			this.addTile(e.data.sides, elem)

			
			
		}
		
	}

	addTile(sides, tile){
		this.tiles[sides].push(tile)
		if(this.tiles[3].length > 0 && this.tiles[2].length > 0 && this.tiles[1].length > 0){
			let baseGrid = this.createGrid(8,10)
			console.log(baseGrid)
			this.fillGrid(baseGrid, false)
			this.spread(baseGrid)
		}
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
				console.log("fillGrid",x, y, lastLeft, lastTop, this.hasLeftLine(lastLeft), this.hasTopLine(lastTop))   
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
	
		
		let lastPos = [100,100]
		let l = this.sideLength
		let h = this.height
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