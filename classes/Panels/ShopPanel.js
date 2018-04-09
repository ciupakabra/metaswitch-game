var SHOP_BUTTON_HEIGHT = 70;

var selectedNodes = [];

var NEW_CABLE_COST = 100;
var NEW_CABLE_LAMBDA = 0.5;
var NEW_CABLE_V = 60;

var NEW_SERVER_COST = 100;
var NEW_SERVER_MAX_SERVERS = 3;
var NEW_SERVER_MAX_CITIES = 3;
var NEW_SERVER_MAX_RESOURCES = 3;


class ShopPanel extends Panel {
	constructBuyCableButton() {
		var buttonY = this.panel.container.height - SHOP_BUTTON_HEIGHT - PANEL_PADDING;
		var buttonWidth = this.panel.container.width - 2 * PANEL_PADDING;
		this.buyCableButton = new SlickUI.Element.Button(PANEL_PADDING, buttonY, buttonWidth, SHOP_BUTTON_HEIGHT);
		this.panel.add(this.buyCableButton);
		this.buyCableButton.add(new SlickUI.Element.Text(0, 0, "Buy Cable")).center();
		this.buyCableButton.visible = false;

		this.buyCableButton.events.onInputUp.add(function() {
			var cable = new Cable(
				network, 
				selectedNodes[0],
				selectedNodes[1],
				NEW_CABLE_LAMBDA,
				NEW_CABLE_V,
			);

			network.add_cable(cable);

			selectedNodes[1].sprite.events.onInputDown.dispatch(selectedNodes[1].sprite);
			selectedNodes[0].sprite.events.onInputDown.dispatch(selectedNodes[0].sprite);

			currentCredit -= NEW_CABLE_COST;
		});
	}

	constructBuyServerButton() {
		var buttonY = this.header.y + this.header.text.textHeight + PANEL_PADDING;
		var buttonWidth = this.panel.container.width - 2 * PANEL_PADDING;
		this.buyServerButton = new SlickUI.Element.Button(PANEL_PADDING, buttonY, buttonWidth, SHOP_BUTTON_HEIGHT);
		this.panel.add(this.buyServerButton);
		this.buyServerButtonText = new SlickUI.Element.Text(0, 0, "Buy a server");
		this.buyServerButton.add(this.buyServerButtonText).center();

		this.buyServerButton.events.onInputDown.add(function() {
			if (currentCredit < NEW_SERVER_COST) {
				this.buyServerButtonText.value = "Not enough credit";
				this.buyServerButtonText.center();
				game.time.events.add(
					Phaser.Timer.SECOND * 1.3, 
					function() {
						this.buyServerButtonText.value = "Buy a server";
						this.buyServerButtonText.center();
					},
					this
				);
			} else {
				this.buyServerButtonText.value = "Select a spot";
				game.input.onDown.addOnce(function(point) {
					var x = (point.x - gameGroup.worldPosition.x) / gameGroup.worldScale.x;
					var y = (point.y - gameGroup.worldPosition.y) / gameGroup.worldScale.y;

					var server = new Server(
						network, 
						x,
						y, 
						NEW_SERVER_MAX_SERVERS,
						NEW_SERVER_MAX_CITIES,
						NEW_SERVER_MAX_RESOURCES,
					);

					network.add_node(server);
					currentCredit -= NEW_SERVER_COST;
					this.buyServerButtonText.value = "Buy a server";
				}, this);
			}
		}, this);
	}

	constructor(x, y, width, height) {
		super(x, y, width, height, "Shop");
		this.constructBuyServerButton();
		this.constructBuyCableButton();
	}

	toggleBuyCableButton() {
		this.buyCableButton.visible = !this.buyCableButton.visible;
	}

	enableBuyCableButton() {
		this.buyCableButton.visible = true;
	}

	disableBuyCableButton() {
		this.buyCableButton.visible = false;
	}
}

function shopNodeClickListener(node) {
	if (node.clicked) {
		selectedNodes.push(node);
	} else {
		var idx = selectedNodes.indexOf(node);
		if (idx != -1)
			selectedNodes.splice(idx, 1);
	}

	if (selectedNodes.length == 2 
		&& currentCredit >= NEW_CABLE_COST
		&& network.can_connect(selectedNodes[0], selectedNodes[1]))
		shopPanel.enableBuyCableButton();
	else
		shopPanel.disableBuyCableButton();
}
