class NodeCityPanel extends Panel {
	constructor(x, y, width, height) {
		super(x, y, width, height, "City Information");
		var contentY = this.header.y + this.header.size + PANEL_LINE_DIST;
		this.content = new SlickUI.Element.Text(0, contentY, "");
		this.panel.add(this.content);
    this.constructAddCableButton();
    this.width = width;
    this.height = height;
	}

  changeInfo(info) {
		this.content.value = info;
	}

  setToNode(node) {
    if (game.currentActivePanel != null) {
      game.currentActivePanel.visible = false;
      game.currentActivePanel = null;
      shopServerPanel.nowUp = true;
    }

    this.changeInfo(node.info());
    this.node = node;
    this.visible = true;
    game.currentActivePanel = this;

		var x = gameGroup.worldPosition.x
			+ node.sprite.x * gameGroup.worldScale.x
			- this.panel.width / 2;
		var y = gameGroup.worldPosition.y
			+ (node.sprite.y - node.sprite.offsetY + node.sprite.height + 10) * gameGroup.worldScale.y;
		this.moveTo(x, y);
	}

  constructAddCableButton() {
		var buttonY = this.panel.container.height - 35;
		var buttonWidth = this.panel.container.width;
		this.buyCableButton = new SlickUI.Element.Button(0, buttonY, buttonWidth, 30);
		this.panel.add(this.buyCableButton);
		this.buyCableButtonText = new SlickUI.Element.Text(0, 0, "Add/Upgrade Cable");
		this.buyCableButton.add(this.buyCableButtonText).center();

		this.buyCableButton.events.onInputDown.add(function() {
      game.buttonPress = true;
      game.nodeclicked = this.node;
      this.visible = false;
      shopCablePanel.setHeader("Choose Destination");
      shopCablePanel.buyCableButton.visible = false;
      shopCablePanel.setToNode(this.node);
		}, this);
	}
}
