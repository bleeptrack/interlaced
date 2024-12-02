'use strict';

export class ColorButton extends HTMLElement {
	constructor(color) {
		
		super();
		
		this.shadow = this.attachShadow({ mode: 'open' });

		const container = document.createElement('template');

		// creating the inner HTML of the editable list element
		container.innerHTML = `
			<style>
				
			</style>
			
			<button id="color-button">
				<span id="color-name"></span>
			</button>

				
		`;

	
		this.shadow.appendChild(container.content.cloneNode(true));
        if(color) {
            this.setColor(color); this.setAttribute('color', color);
        }else{
            this.getAttribute('color') ? this.setColor(this.getAttribute('color')) : this.setColor('#000000');
        }
	}
	


	connectedCallback() {
		this.shadow.querySelector('#color-button').addEventListener('click', () => {
			console.log("color button clicked");
			const input = document.createElement('input');
			input.type = 'color';
			input.click();
			input.addEventListener('change', (e) => {
                this.setColor(e.target.value)
			});
            
		});
	}

	setColor(color) {
		this.shadow.querySelector('#color-button').style.backgroundColor = color;
		this.shadow.querySelector('#color-name').textContent = color;
        this.setAttribute('color', color);
        this.dispatchEvent(new CustomEvent('color-change', {detail: color}));
	}

}

customElements.define('color-button', ColorButton);