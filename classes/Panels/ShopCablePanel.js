var NEW_CABLE_LAMBDA = 1;
var NEW_CABLE_V = 50;
var CABLE_PENALTY = 50;

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
		this.xpos = x; this.ypos = y;
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
    //Correct panels that go off screen
		var xpos = x; var ypos = y;
		if (xpos + this.panel.width > game.width) {
			xpos = game.width - this.panel.width;
		} else if (xpos < 0) {
			xpos = 0;
		}
		if (y + this.panel.height > game.height) {
			ypos = game.height - this.panel.height;
		} else if (ypos < 0) {
			ypos = 0;
		}

		this.moveTo(xpos, ypos);
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
      if (currentCredit < this.cableCost()) {
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
						this.buyCableButtonText.center();
					},
					this
				);
			} else if (this.existingCable) {
        currentCredit -= this.cableCost();

        this.cable.lambda -= 0.15;
        this.cable.level += 1;
        var level = this.cable.level;
        this.cable.v += 50 + (4 * Math.pow(Math.floor(level/2),2));
        network.update_distances();

        if (level <= 6) {
          this.cable.graphics.tint = CABLE_COLORS[level - 1];
        } else if (level == 7) {
          var timer = game.time.create(false);
          foreverTimers.push(timer);
          this.cable.timer = timer.loop(100, updateCable, this.cable, this.cable);
          this.cable.version = 2;
          function updateCable(cable) {
            cable.version += 1;
            if (cable.version == CABLE_COLORS.length) {
              cable.version = 2;
            }
            cable.graphics.tint = CABLE_COLORS[cable.version];
          }
          timer.start();
        } else {
          this.cable.timer.delay = (100/(level - 6));
        }

        this.enableButton(this.nodeDest);
      } else {
        currentCredit -= this.cableCost();

        var cable = new Cable(
  				network,
  				this.node,
  				this.nodeDest,
  				NEW_CABLE_LAMBDA,
  				NEW_CABLE_V,
          1
  			);

        network.add_cable(cable);
        this.enableButton(this.nodeDest);
      }
		}, this);
	}

  cableCheck(node) {
    this.nodeDest = node;
    this.buyCableButton.visible = false;
    this.getCable();
    if (this.cable != null) {
      this.setHeader("Upgrade or Reselect");
      this.buyCableButtonText.value = "Upgrade for " + String(this.cableCost(this.node, this.nodeDest));
      return true;
    } else {
      if (!network.can_connect(this.node,this.nodeDest)) {
        if ((this.node.type == "server") && (this.node.connected_nodes == this.node.max_nodes)) {
          this.setHeader("Source Server Full");
          var timer = game.time.create(true);
          timer.add(
  					Phaser.Timer.SECOND * 1.3,
  					function() {
  						this.setHeader("Choose Destination")
  					},
  					this
  				);
          return false;
        } else if ((this.nodeDest.type == "server") && (this.nodeDest.connected_nodes == this.nodeDest.max_nodes)) {
          this.setHeader("Destination Full");
          var timer = game.time.create(true);
          timer.add(
  					Phaser.Timer.SECOND * 1.3,
  					function() {
  						this.setHeader("Choose Destination")
  					},
  					this
  				);
          return false;
        } else {
        this.setHeader("Cannot connect");
        var timer = game.time.create(true);
        timer.add(
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
    }
    this.getCable();
    var dist = this.node.dist(this.nodeDest);
    var baseCost = Math.floor((dist/4 + (dist*dist)/5000)/1.5) + CABLE_PENALTY;
    if (!this.existingCable) {
      return baseCost;
    } else {
      return (Math.floor(baseCost * (this.cable.level)*(1 + this.cable.level/3)));
    }
  }

  getCable() {
    this.cable = network.get_adjacent_cable(this.node,this.nodeDest);
    if (this.cable == null) {
      this.existingCable = false
    } else {
      this.existingCable = true
    }
  }

  enableButton(node) {
    if (this.cableCheck(node)) {
      this.buyCableButtonText.center();
      this.buyCableButton.visible = true;
    }
  };
}
