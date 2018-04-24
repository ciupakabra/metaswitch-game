var NEW_CABLE_LAMBDA = 0.6;
var NEW_CABLE_V = 50;

class ShopCablePanel extends Panel {
	constructor(x, y, width, height) {
		super(x, y, width, height, "Choose Destination");
		var contentY = this.header.y + this.header.size + PANEL_LINE_DIST;
		this.content = new SlickUI.Element.Text(0, contentY, "");
		this.panel.add(this.content);
    this.constructAddCableButton();
    this.node = null;
    this.nodeDest = null;
    this.existingCable = false;
	}

	changeInfo(info) {
		this.content.value = info;
	}

	setToNode(node) {
    this.node = node;
    this.visible = true;
    game.currentActivePanel = this;
    game.cableMode = true;

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
		this.buyCableButtonText = new SlickUI.Element.Text(0, 0, "Buy Cable for " + String(this.cableCost(this.node, this.nodeDest)));
		this.buyCableButton.add(this.buyCableButtonText).center();
    this.buyCableButton.visible = false;

		this.buyCableButton.events.onInputDown.add(function() {
      game.buttonPress = true;
      game.nodeclicked = this.node;
      this.visible = false;
      if (currentCredit < this.cableCost(this.node, this.nodeDest)) {
				this.buyCableButtonText.value = "Insufficient Funds";
				this.buyCableButtonText.center();
				game.time.events.add(
					Phaser.Timer.SECOND * 1.3,
					function() {
            if (this.existingCable) {
              this.buyCableButtonText.value = "Upgrade for " + String(this.cableCost(this.node, this.nodeDest));
            } else {
						  this.buyCableButtonText.value = "Buy Cable for " + String(this.cableCost(this.node, this.nodeDest));
            }
						this.buyCableButton.center();
					},
					this
				);
			} else if (this.existingCable) {
        var cable = network.get_adjacent_cable(this.node,this.nodeDest);
        cable.v += 10;
        cable.lambda -= 0.03;

        this.visible = false;
        this.buyCableButton.visible = false;
        game.currentActivePanel = null;
        game.cableMode = false;
      } else {
        var cable = new Cable(
  				network,
  				this.node,
  				this.nodeDest,
  				NEW_CABLE_LAMBDA,
  				NEW_CABLE_V,
  			);

        network.add_cable(cable);
  			currentCredit -= this.cableCost();
        this.visible = false;
        this.buyCableButton.visible = false;
        game.currentActivePanel = null;
        game.cableMode = false;
      }
		}, this);
	}

  cableCheck(node) {
    this.nodeDest = node;
    this.buyCableButton.visible = false;
    if (network.get_adjacent_cable(this.node,this.nodeDest) != null) {
      this.existingCable = true;
      this.setHeader("Upgrade or Reselect");
      this.buyCableButtonText.value = "Upgrade for " + String(this.cableCost(this.node, this.nodeDest));
      return true;
    } else {
      this.existingCable = false;
      if (!network.can_connect(this.node,this.nodeDest)) {
        if ((this.node.type == "server") && (this.node.connected_nodes == this.node.max_nodes)) {
          this.setHeader("Source Server Full");
          game.time.events.add(
  					Phaser.Timer.SECOND * 1.3,
  					function() {
  						this.setHeader("Choose Destination")
  					},
  					this
  				);
          return false;
        } else if ((this.nodeDest.type == "server") && (this.nodeDest.connected_nodes == this.nodeDest.max_nodes)) {
          this.setHeader("Destination Full");
          game.time.events.add(
  					Phaser.Timer.SECOND * 1.3,
  					function() {
  						this.setHeader("Choose Destination")
  					},
  					this
  				);
          return false;
        } else {
        this.setHeader("Cannot connect");
        game.time.events.add(
					Phaser.Timer.SECOND * 1.3,
					function() {
						this.setHeader("Choose Destination")
					},
					this
				);
        }
        return false;
      }
      this.setHeader("Buy or Reselect");
      this.buyCableButtonText.value = "Buy Cable for " + String(this.cableCost(this.node, this.nodeDest));
      return true;
    }
  }

  cableCost() {
    if (this.node == null) {
      return 0;
    } else {
      return (Math.floor(this.node.dist(this.nodeDest)/6));
    }
  }

  enableButton(node) {
    if (this.cableCheck(node)) {
      this.buyCableButtonText.center();
      this.buyCableButton.visible = true;
    }
  };

}
