class Panel {
	constructor(x, y, width, height, name) {
		this.panel = new SlickUI.Element.Panel(x, y, width, height);
		this.header = new SlickUI.Element.Text(0, 0, name, 20, "#ffffff");
		slickUI.add(this.panel);
		this.panel.add(this.header).centerHorizontally().alpha = 0.8;
	}

	setHeader(newHeader) {
		this.header.value = newHeader;
	}

	moveTo(x, y) {
		this.panel.x = x;
		this.panel.y = y;
	}

	get visible() {
		return this.panel.visible;
	}

	set visible(val) {
		this.panel.visible = val;
	}
}
