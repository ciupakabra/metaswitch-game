class Panel {
	constructor(x, y, width, height, name) {
		this.panel = new SlickUI.Element.Panel(x, y, width, height);
		this.header = new SlickUI.Element.Text(PANEL_PADDING, PANEL_PADDING, name);
		slickUI.add(this.panel);
		this.panel.add(this.header).centerHorizontally().text.alpha = 0.5;
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
