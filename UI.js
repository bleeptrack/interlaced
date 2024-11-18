'use strict';

import { PatternGenerator } from './PatternGenerator.js';

export class UI extends HTMLElement {
	constructor(n) {
		
		super();
		
		this.shadow = this.attachShadow({ mode: 'open' });

		const container = document.createElement('template');

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<style>
				pattern-generator {
					width: 100%;
					height: 100%;
				}
                .side {
                    width: 10vh;
                    height: 10vh;
                    background-color: #f0f0f0;
                }
			</style>
			
			<nav id="nav">
				<div id="3-side" class="side"></div>
                <div id="2-side" class="side"></div>
                <div id="1-side" class="side"></div>
                <div id="colors" class="side"></div>
                <button id="generate">Generate</button>
			</nav>

				
		`;

	
		this.shadow.appendChild(container.content.cloneNode(true));
		this.patternGenerator = new PatternGenerator();

        this.patternGenerator.addEventListener('pattern:new-tile', (e) => {
            console.log("new tile event", e.detail.sides);
            //this.shadow.getElementById(`${e.detail.sides}-side`).appendChild(e.detail.tile);
            console.log("bounds", e.detail.bounds)
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.setAttribute("viewBox", `${e.detail.bounds.x} ${e.detail.bounds.y} ${e.detail.bounds.width} ${e.detail.bounds.height}`);
            svg.appendChild(e.detail.tile);
            this.shadow.getElementById(`${e.detail.sides}-side`).appendChild(svg);

        });
		

        this.shadow.getElementById('nav').after(this.patternGenerator);
	}
	


	connectedCallback() {
		
	}

	

}

customElements.define('interlaced-ui', UI);
