var NEW_SERVER_COST = 100;
var NEW_SERVER_MAX_NODES = 4;

class ShopServerPanel extends Panel {
	constructor(x, y, width, height) {
		super(x, y, width, height, "Buy Server");
		var contentY = this.header.y + this.header.size + PANEL_LINE_DIST;
		this.content = new SlickUI.Element.Text(0, contentY, "content");
		this.panel.add(this.content);
    this.constructBuyServerButton();
    this.nowUp = false;
    this.width = width;
    this.height = height;
	}

  setToNode(node) {
    this.node = node;
    game.currentActivePanel = this;
    this.visible = true;
    if (node == null) {
      if ((game.nodeclicked != null) || !this.nowUp) {
        this.visible = false;
        game.currentActivePanel = null;
        this.nowUp = false;
      }
      this.setHeader("Buy Server");
      this.x = game.input.activePointer.position.x;
      this.y = game.input.activePointer.position.y;
      this.moveTo(this.x, this.y);
      this.content.value = "Max Cables: \n    4\n Capacity: \n    50";
    } else {
      var a = node.max_nodes;
      var b = node.capacity;
      this.setHeader("Upgrade Server");
      this.content.value = "Max Cables: \n    " +
      String(a) + " -> "+ String(a+3) +
      "\n Capacity: \n    " + String(b) + " -> " + String(b+50);

      this.x = gameGroup.worldPosition.x
        + node.sprite.x * gameGroup.worldScale.x
        - this.panel.width / 2;
      this.y = gameGroup.worldPosition.y
        + (node.sprite.y - node.sprite.offsetY + node.sprite.height + 10) * gameGroup.worldScale.y;

      this.moveTo(this.x, this.y);
    }
	}

  constructBuyServerButton() {
		var buttonY = this.panel.container.height - 35;
		var buttonWidth = this.panel.container.width;
		this.buyServerButton = new SlickUI.Element.Button(0, buttonY, buttonWidth, 30);
		this.panel.add(this.buyServerButton);
		this.buyServerButtonText = new SlickUI.Element.Text(0, 0, "Buy for 100");
		this.buyServerButton.add(this.buyServerButtonText).center();

		this.buyServerButton.events.onInputDown.add(function() {
      game.nodeclicked = true;
      game.buttonPress = true;
			if (currentCredit < NEW_SERVER_COST) {
				this.buyServerButtonText.value = "Insufficient Funds";
				this.buyServerButtonText.center();
				game.time.events.add(
					Phaser.Timer.SECOND * 1.3,
					function() {
						this.buyServerButtonText.value = "Buy for 100";
						this.buyServerButtonText.center();
					},
					this
				);
			} else if (this.node == null) {
					var server = new Server(
						network,
						(this.x - gameGroup.worldPosition.x) / gameGroup.worldScale.x,
  					(this.y - gameGroup.worldPosition.y) / gameGroup.worldScale.y,
            50,
						NEW_SERVER_MAX_NODES,
            1
					);

					network.add_node(server);
          game.currentActivePanel = null;
          this.visible = false;
          this.nowUp = false;
					currentCredit -= NEW_SERVER_COST;
			} else {
        this.node.max_nodes += 3;
        this.node.capacity += 50;
        this.node.level += 1;
        currentCredit -= NEW_SERVER_COST;
        this.setToNode(this.node);
      };
		}, this);
	}
}
