class NodeInfoPanel extends Panel {
	constructor(x, y, width, height) {
		super(x, y, width, height, "Node information");
		var contentY = this.header.y + this.header.size + PANEL_LINE_DIST;
		this.content = new SlickUI.Element.Text(0, contentY, "content");
		this.panel.add(this.content);
	}

	changeInfo(info) {
		this.content.value = info;
		//console.log(this.content.y);
		//console.log(this.content.text.textHeight);
		//console.log(PANEL_LINE_DIST);
		//this.panel.height = this.content.y + this.content.text.textHeight + PANEL_LINE_DIST;
	}

	setToNode(node) {
		this.changeInfo(node.info());

		var x = gameGroup.worldPosition.x
			+ node.sprite.x * gameGroup.worldScale.x
			- this.panel.width / 2;
		var y = gameGroup.worldPosition.y
			+ (node.sprite.y - node.sprite.offsetY + node.sprite.height + 10) * gameGroup.worldScale.y;

		//Correct panels that go off screen
		var xpos = x; var ypos = y;
		if (xpos + this.panel.width > game.width) {
			xpos = game.width - this.panel.width;
		} else if (xpos < 0) {
			xpos = 0;
		}
		if (y + this.panel.height > game.height) {
			ypos = game.height - this.panel.height;
		}

		this.moveTo(xpos, ypos);
	}
}

function nodeInfoClickListener() {
	nodeInfoPanel.visible = false;
}

function nodeInfoOverListener(node) {
	if (node.type == "server") {
	} else {
		nodeInfoPanel.setToNode(node);
		nodeInfoPanel.visible = true;
	}
}

function nodeInfoOutListener() {
	nodeInfoPanel.visible = false;
}
