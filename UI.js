'use strict';

import { PatternGenerator } from './PatternGenerator.js';
import { ColorButton } from './ColorButton.js';

export class UI extends HTMLElement {
	constructor(n) {
		
		super();
		
		this.shadow = this.attachShadow({ mode: 'open' });

		const container = document.createElement('template');
        let colors = ['#0F000A', '#6A5FDB', '#B2AAFF', '#FEF2FF', '#FF5053'];
        document.body.style.backgroundColor = colors[0]

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<style>
                :host {
                    --bg-color: grey;
                }
				pattern-generator {
					width: 100%;
					height: 100%;
				}
                .side {
                    max-width: 100%;
                    min-width: 30vh;
                    padding-left: 2vw;
                    height: 100%;
                    margin-bottom: 1vh;
                    background: linear-gradient(to right, var(--bg-color) 20vh, rgba(0,0,0,0) 30vh);
                    display: inline-flex;
                    justify-content: flex-start;
                    flex-direction: row;
                }
                .side:hover {
                    background: linear-gradient(to right, var(--bg-color) 20vh, rgba(0,0,0,0) 100%);
                }
                #colors {
                    align-items: center;
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
                .side color-button {
                    transform: scale(1);
                    transition: all 0.4s ease-in-out;
                }
                .side color-button:hover {
                    transform: scale(1.2);
                    transition: all 0.4s ease-in-out;
                }

                /* fold in and out */
                .side:hover svg:not(:first-of-type) {
                    margin-left: 1vh;
                    opacity: 1;
                    transition: all 0.4s ease-in-out;
                }
                .side svg:not(:first-of-type) {
                    margin-left: -19vh;
                    transition: all 0.4s ease-in-out;
                }
                .side:hover color-button:not(:first-of-type) {
                    margin-left: 1vh;
                    opacity: 1;
                    transition: all 0.4s ease-in-out;
                }
                color-button:not(:first-of-type) {
                    margin-left: -7vh;
                    transition: all 0.4s ease-in-out;
                }

                /* opacity cascade */
                .side svg:nth-of-type(1), {
                    opacity: 1;
                    z-index: 10;
                }
                .side svg:nth-of-type(2) {
                    opacity: 0.8;
                    z-index: 9;
                }
                .side svg:nth-of-type(3) {
                    opacity: 0.6;
                    z-index: 8;
                }
                .side svg:nth-of-type(4) {
                    opacity: 0.4;
                    z-index: 7;
                }
                .side svg:nth-of-type(n+5) {
                    opacity: 0.2;
                    z-index: 6;
                }

                .side color-button:nth-of-type(1) {
                    z-index: 10;
                }
                .side color-button:nth-of-type(2) {
                    z-index: 9;
                }
                .side color-button:nth-of-type(3) {
                    z-index: 8;
                }
                .side color-button:nth-of-type(4) {
                    z-index: 7;
                }
                .side color-button:nth-of-type(n+5) {
                    z-index: 6;
                }

                .side-container {
                    width: 100%;
                    height: 20vh;
                }
                svg {
                    width: 20vh;
                    height: 20vh;
                    transform: scale(1);
                    transition: transform 0.3s ease-in-out;
                }
                
                .add-button {
                    order: 999999;
                    margin: auto 2vh;
                    height: 9vh;
                    background: none;
                    border: none;
                }
                
                .extended{
                    background-color: blue;
                    margin-left: 0 !important;
                }
                .buttonicon {
                    width: 7vh !important;
                    height: 7vh !important;
                }
                #action-buttons .side{
                    align-items: center;
                }
                #action-buttons button {
                    width: 10vh;
                    height: 10vh;
                    background: none;
                    border: none;
                }
                #action-buttons button svg {
                    width: 10vh;
                    height: 10vh;
                    
                    transform: scale(1);
                    transition: transform 0.3s ease-in-out;
                }
                #action-buttons button svg:hover {
                    transform: scale(1.2);
                    transition: transform 0.3s ease-in-out;
                }
                nav {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
			</style>
			
			<nav id="nav">
                <div class="side-container">
                    <div id="3-side" class="side">
                        <button id="3-side-button" class="add-button">
                            <svg class="buttonicon" xmlns="http://www.w3.org/2000/svg" height="2vh" viewBox="0 -960 960 960" width="2vh" fill="red"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="side-container">
                    <div id="2-side" class="side">
                        <button id="2-side-button" class="add-button">
                            <svg class="buttonicon" xmlns="http://www.w3.org/2000/svg" height="2vh" viewBox="0 -960 960 960" width="2vh" fill="red"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="side-container">
                    <div id="1-side" class="side">
                        <button id="1-side-button" class="add-button">
                            <svg class="buttonicon" xmlns="http://www.w3.org/2000/svg" height="2vh" viewBox="0 -960 960 960" width="2vh" fill="red"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="side-container">
                    <div id="colors" class="side">
                        
                    </div>
                </div>
                <div class="side-container" id="action-buttons">
                    <div class="side">
                        <button id="generate">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-280q-73 0-127.5-45.5T284-440h62q13 44 49.5 72t84.5 28q58 0 99-41t41-99q0-58-41-99t-99-41q-29 0-54 10.5T382-580h58v60H280v-160h60v57q27-26 63-41.5t77-15.5q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-120q-33 0-56.5-23.5T120-200v-160h80v160h160v80H200Zm400 0v-80h160v-160h80v160q0 33-23.5 56.5T760-120H600ZM120-600v-160q0-33 23.5-56.5T200-840h160v80H200v160h-80Zm640 0v-160H600v-80h160q33 0 56.5 23.5T840-760v160h-80Z"/></svg>
                        </button>
                        <button id="download"> 
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
                        </button>
                    </div>
                </div>
			</nav>

				
		`;

	
		this.shadow.appendChild(container.content.cloneNode(true));
		this.patternGenerator = new PatternGenerator(colors);

        colors.forEach((color, idx) => {
            const colorButton = new ColorButton(color);
            colorButton.id = `color-button-${idx}`
            this.shadow.getElementById('colors').appendChild(colorButton);
            colorButton.addEventListener('color-change', (e) => {
                //this.patternGenerator.setColors(colors.map(color => e.detail));
               
                let colorButtons = this.shadow.querySelectorAll('color-button')
                let colors = Array.from(colorButtons).map(colorButton => colorButton.getAttribute('color'))
                console.log("color changed", e.detail, colors)
                
                if(e.target.id == `color-button-0`){
                    document.body.style.backgroundColor = e.detail
                }
                this.patternGenerator.setColors(colors)
                
                this.updateUIColors()
            });
        });

        this.patternGenerator.addEventListener('pattern:new-tile', (e) => {
            console.log("new tile event", e.detail.sides);
            //this.shadow.getElementById(`${e.detail.sides}-side`).appendChild(e.detail.tile);
            console.log("bounds", e.detail.bounds)
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.setAttribute("viewBox", `${e.detail.bounds.x} ${e.detail.bounds.y} ${e.detail.bounds.width} ${e.detail.bounds.height}`);
            svg.appendChild(e.detail.tile);
            svg.querySelectorAll('path').forEach( (path, idx) => {
                if(idx == 0){
                    path.style.fill = this.patternGenerator.colors[this.patternGenerator.colors.length-2]
                    path.style.stroke = this.patternGenerator.colors[this.patternGenerator.colors.length-1]
                    path.style.strokeWidth = "3"
                }else{
                    path.style.fill = this.patternGenerator.colors[0]
                }
            })
            svg.addEventListener('click', (elem) => {
                let targetSVG = elem.target.closest('svg');
                let sides = targetSVG.parentElement.id.split('-')[0];
                let nr = Array.from(targetSVG.parentElement.children).indexOf(targetSVG) - 1;
                console.log("delete", targetSVG, sides, nr);
                targetSVG.remove();
                this.patternGenerator.deleteTile(sides, nr);
            });
            this.shadow.getElementById(`${e.detail.sides}-side`).appendChild(svg);

        });

        this.shadow.getElementById('3-side-button').addEventListener('click', () => {
            this.patternGenerator.requestTile(3)
        })

        this.shadow.getElementById('2-side-button').addEventListener('click', () => {
            this.patternGenerator.requestTile(2)
        })

        this.shadow.getElementById('1-side-button').addEventListener('click', () => {
            this.patternGenerator.requestTile(1)
        })

        this.shadow.getElementById('generate').addEventListener('click', () => {
            this.patternGenerator.generatePattern()
        })

        this.shadow.getElementById('download').addEventListener('click', () => {
            this.patternGenerator.saveSVG()
        })
		

        this.shadow.getElementById('nav').after(this.patternGenerator);
	}
	
    updateUIColors(){
        let triangleSVGs = this.shadow.querySelectorAll('.side > svg')
        triangleSVGs.forEach( (triangleSVG, idx) => {
            triangleSVG.querySelectorAll('path').forEach( (path, idx) => {
                if(idx == 0){
                    path.style.fill = this.patternGenerator.colors[this.patternGenerator.colors.length-2]
                    path.style.stroke = this.patternGenerator.colors[this.patternGenerator.colors.length-1]
                    path.style.strokeWidth = "3"
                }else{
                    path.style.fill = this.patternGenerator.colors[0]
                }
            })
        })

        let sides = this.shadow.querySelectorAll('.side')
        sides.forEach( (side, idx) => {
            side.style.setProperty('--bg-color', this.patternGenerator.backgroundColor)
        })

        

        let buttonSVGs = this.shadow.querySelectorAll('.buttonicon')
        buttonSVGs.forEach( (buttonSVG, idx) => {
            buttonSVG.querySelectorAll('path').forEach( (path, idx) => {
                
                    path.style.fill = this.patternGenerator.colors[2]
                    path.style.stroke = this.patternGenerator.backgroundColor
                    path.style.strokeWidth = "30"
                    
                
            })
        
        })

        let actionButtons = this.shadow.querySelectorAll('#action-buttons button')
        actionButtons.forEach( (actionButton, idx) => {
            actionButton.style.fill = this.patternGenerator.colors[2]
            actionButton.style.stroke = this.patternGenerator.backgroundColor
            actionButton.style.strokeWidth = "30"
        })

        let colorButtons = this.shadow.querySelectorAll('color-button')
        colorButtons.forEach( (colorButton, idx) => {
            let allColors = [this.patternGenerator.backgroundColor, ...this.patternGenerator.colors]
            console.log("allColors", idx+1 % allColors.length)
            colorButton.setBorderColor(allColors[(idx+1) % allColors.length])
        })
    }


	connectedCallback() {
		this.updateUIColors()
	}

	

}

customElements.define('interlaced-ui', UI);
