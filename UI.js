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
                    max-width: 100%;
                    height: 100%;
                    margin-bottom: 1vh;
                    background-color: #f0f0f0;
                    display: inline-flex;
                    justify-content: flex-start;
                    flex-direction: row;
                }
                
                /*highlight tile on hover*/
                .side svg:hover {
                    transform: scale(1.2);
                    transition: all 0.4s ease-in-out;
                }
                .side svg {
                    transform: scale(1);
                    transition: all 0.4s ease-in-out;
                }

                /* fold in and out */
                .side:hover svg:not(:first-of-type) {
                    margin-left: 1vh;
                    transition: all 0.4s ease-in-out;
                }
                .side svg:not(:first-of-type) {
                    margin-left: -19vh;
                    transition: all 0.4s ease-in-out;
                }

                .side-container {
                    width: 100%;
                    height: 20vh;
                    background-color: orange;
                }
                svg {
                    width: 20vh;
                    height: 20vh;
                    transform: scale(1);
                    transition: transform 0.3s ease-in-out;
                }
                
                .extended{
                    background-color: blue;
                    margin-left: 0 !important;
                }
			</style>
			
			<nav id="nav">
                <div class="side-container">
                    <div id="3-side" class="side">
                        <button id="3-side-button">+</button>
                    </div>
                </div>
                <div class="side-container">
                    <div id="2-side" class="side"></div>
                </div>
                <div class="side-container">
                    <div id="1-side" class="side"></div>
                </div>
                <div class="side-container">
                    <div id="colors" class="side"></div>
                </div>
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

        this.shadow.getElementById('3-side-button').addEventListener('click', () => {
            this.patternGenerator.requestTile(3)
        })

        this.shadow.getElementById('generate').addEventListener('click', () => {
            this.patternGenerator.generatePattern()
        })
		

        this.shadow.getElementById('nav').after(this.patternGenerator);
	}
	


	connectedCallback() {
		
	}

	

}

customElements.define('interlaced-ui', UI);
