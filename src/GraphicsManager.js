class GraphicsManager {
	constructor() {}

	satisfactionBarInit() {
		this.satBarGraphics = game.make.graphics();
		this.satBarWidth = game.width - (3 * PANEL_MARGIN + STATUS_PANEL_WIDTH) - 4 - 37;

		var graphics = game.add.graphics(2 * PANEL_MARGIN + STATUS_PANEL_WIDTH + 2, PANEL_MARGIN + 2);
		ui.add(graphics);
		graphics.alpha = 0.4;
		graphics.beginFill(0x6C6C6C);
		graphics.lineStyle(3, 0x4C4C4C, 1);
		graphics.drawRect(-1, -1, this.satBarWidth + 2, 32);
	}

	spriteInitServer(node) {
		node.graphicsGroup = game.add.group(nodes);

		node.graphics = game.add.graphics(node.x, node.y);
		nodes.add(node.graphics);

		node.sprite = node.graphicsGroup.create(node.x, node.y, 'server');
		node.sprite.anchor.set(0.5, 0.5);
		node.sprite.inputEnabled = true;
		node.sprite.node = node;
		this.createSillhouette(node);
		node.clicked = false;

		node.sprite.events.onInputOver.add(mouseOverListener);
		node.sprite.events.onInputOut.add(mouseOutListener);
		if (!tutorialOn) {
			node.sprite.events.onInputDown.add(mouseClickListener);
		}
	}

	spriteInitResource(node) {
		node.graphicsGroup = game.add.group(nodes);
		node.graphics = game.add.graphics(node.x, node.y);
		node.graphicsGroup.add(node.graphics);

		node.sprite = node.graphicsGroup.create(node.x, node.y, 'resource');
		node.sprite.tint = node.color;
		node.sprite.anchor.set(0.5, 0.5);
		node.sprite.inputEnabled = true;
		node.sprite.node = node;
		this.createSillhouette(node);
		node.clicked = false;

		node.sprite.events.onInputOver.add(mouseOverListener);
		node.sprite.events.onInputOut.add(mouseOutListener);
		if (!tutorialOn) {
			node.sprite.events.onInputDown.add(mouseClickListener);
		}
	}

	spriteInitCity(node) {
		node.graphicsGroup = game.add.group(nodes);
		node.graphics = game.add.graphics(node.x, node.y);
		node.graphicsGroup.add(node.graphics);

		node.sprite = node.graphicsGroup.create(node.x, node.y, 'city');
		node.sprite.anchor.set(0.5, 0.5);
		node.sprite.inputEnabled = true;
		node.sprite.node = node;
		this.createSillhouette(node);
		node.clicked = false;

		var graphics = game.add.graphics(node.x, node.y);
		var sum = 0;
		for (var i = 0;i < node.p.length;++i) {
			if (node.p[i]["prob"] > 0) {
				graphics.lineStyle(6, node.p[i]["resource_unit"]["color"]);
				var angleFrom = game.math.degToRad(360 * sum + 5);
				var angleTo = game.math.degToRad(360 * (sum + node.p[i]["prob"]) - 5);
				graphics.arc(0, 0, 50, angleFrom, angleTo, false);
				sum += node.p[i]["prob"];
			}
		}



        var tween = game.add.tween(graphics);
        tween.to({rotation: 2*Math.PI}, 20000, 'Linear', true, 0, -1);
		var tween2 = game.add.tween(graphics.scale);
        tween2.to({x: 1.1, y: 1.1}, 5000, Phaser.Easing.Cubic.InOut, true, 0, -1, true);

        node.graphicsGroup.add(graphics);


		node.sprite.events.onInputOver.add(mouseOverListener);
		node.sprite.events.onInputOut.add(mouseOutListener);
		if (!tutorialOn) {
			node.sprite.events.onInputDown.add(mouseClickListener);
		}
	}

	arcUpdate(node) {
		if (tutorialOn && (tutorialScreen != 15)) {node.graphics.destroy(); return false};

		var nodeSpace = node.capacity;

		var angleTo = Math.min(360 * this.network.packetsInNode(node)/nodeSpace, 359.99);
		node.graphicsGroup.remove(node.graphics);
		node.graphics.destroy();
		node.graphics = game.add.graphics(node.x, node.y);
		node.graphicsGroup.add(node.graphics);
		var r = "0" + (Math.ceil(255*angleTo/360)).toString(16)
		var g = "0" + (Math.ceil(255*(360-angleTo)/360)).toString(16)
		node.graphics.lineStyle(6, '0x' + r.slice(-2) + g.slice(-2) + '00');
		node.graphics.arc(0, 0, 40, 0, game.math.degToRad(360 - angleTo), true);
	}

	spriteInitCable(cable) {
		cable.graphics = game.make.graphics();
		cable.graphics.lineStyle(2, 0xffffff);
		cable.graphics.moveTo(cable.node_1.x, cable.node_1.y);
		cable.graphics.lineTo(cable.node_2.x, cable.node_2.y);
		cable.graphics.endFill();
		cable.graphics.tint = CABLE_COLORS[0];

		cable.graphics.inputEnabled = true;

		cable.graphics.events.onInputOver.add(function() {
			this.alpha = 0.5;
		}, cable.graphics);

		cable.graphics.events.onInputOut.add(function() {
			this.alpha = 1.0;
		}, cable.graphics);

		cables.add(cable.graphics);
		game.world.bringToTop(cable.node_1.graphicsGroup);
		game.world.bringToTop(cable.node_2.graphicsGroup);
	}

	spriteInitPacket(packet, cable, node_from, node_to) {
		packet.sprite = game.make.graphics(node_from.x, node_from.y);
		packet.sprite.anchor.set(0.5, 0.5);

		if (packet.content != null)
			packet.color = packet.content.color;
		else
			packet.color = packet.destination.color;

		packet.sprite.beginFill(packet.color);
		packet.sprite.lineStyle(2);
		packet.sprite.drawCircle(0, 0, 15);
		if (packet.content == null) {
			packet.sprite.beginFill(0x000000);
			packet.sprite.drawCircle(0, 0, 2);
			packet.sprite.tint = 0xA9A9A9;
		}

		if (!packet.state)
			this.deadPacket(packet);

		packets.add(packet.sprite);

		var time = Phaser.Timer.SECOND * cable.total_time();
		var tween = game.add.tween(packet.sprite).to(
			{x : node_to.x, y : node_to.y},
			time,
			Phaser.Easing.Linear.NONE,
			true
		);
		packet.sprite.tween = tween;
		tween.onComplete.add(function() {
			this.travelling = false;
			this.sprite.destroy();
		}, packet, 1);

		// We add a dummy function to lose the two arguments
		// that onComplete adds.
		this.arcUpdate(node_from);
		tween.onComplete.add(function(d1, d2, node_to, packet) {
			node_to.process_packet(packet);
			this.arcUpdate(node_to);
		}, this, 0, node_to, packet);

		tween.timeScale = speed;
	}

	deadPacket(packet) {
		packet.sprite.beginFill(0x000000);
		packet.sprite.drawCircle(0, 0, 8);
	}

	satisfactionBarUpdate() {
		this.satBarGraphics.destroy();
		this.satBarGraphics = game.add.graphics(2 * PANEL_MARGIN + STATUS_PANEL_WIDTH + 2, PANEL_MARGIN + 2);

		this.satBarGraphics.lineStyle(3, 0x4C4C4C, 1);
		this.satBarGraphics.drawRect(-1, -1, this.satBarWidth + 2, 32);

		var curCount = 0;
		for (i = 0; i < deadPackets.length; i++) {
			if (deadPackets[i] > 0) {
				this.satBarGraphics.alpha = 0.6;
				this.satBarGraphics.beginFill(RESOURCE_COLORS[i]);
				this.satBarGraphics.lineStyle(0, 0x000000, 1);
				this.satBarGraphics.drawRect((curCount/maxPenalty)*this.satBarWidth, 0, (deadPackets[i])/maxPenalty*this.satBarWidth, 30);
				this.satBarGraphics.endFill();
				curCount += deadPackets[i];
			}
		}
	}

	createSillhouette(node) {
		var bmd = game.make.bitmapData()
		bmd.load(node.sprite.key);
		bmd.processPixelRGB(function(pixel) {
			pixel.r = 255;
			pixel.g = 255;
			pixel.b = 255;
			return pixel;
		});

		node.sillhouette = node.graphicsGroup.create(node.x, node.y, bmd);
		node.sillhouette.scale.set(1.05);
		node.sillhouette.anchor.set(0.5, 0.5);
		node.sillhouette.tint = 0xfffab0;
		node.sillhouette.visible = false;

		node.graphicsGroup.bringToTop(node.sprite);
	}

	newCityTextInit() {
		this.newCityText1 = game.add.text(2 * PANEL_MARGIN + STATUS_PANEL_WIDTH + 2, PANEL_MARGIN + 4 + 32, "A New City Appears!");
		this.newCityText1.font = 'Lato';
		this.newCityText1.fontSize = 60;
		this.newCityText1.stroke = '#404040';
		this.newCityText1.strokeThickness = 4;
		this.newCityText1.fill = '#505050';
		this.newCityText1.alpha = 0;
		this.timer = game.time.create(false);
		foreverTimers.push(this.timer);
		this.timer.start();
		ui.add(this.newCityText1);
	}

	newCityText() {
		var newCityTimer
		newCityTimer = this.timer.loop(50, function(text) {
			if (text.alpha < 1) {text.alpha = Math.min(1, text.alpha + 0.05)}
			else {this.timer.remove(newCityTimer)}
		}, this, this.newCityText1);

		this.timer.add(3000, function(text) {
			newCityTimer = this.timer.loop(100, function(text) {
				if (text.alpha > 0) {text.alpha -= 0.05}
				else {this.timer.remove(newCityTimer);}
			}, this, this.newCityText1);
		}, this);
	}

}


function mouseOverListener(sprite) {
	sprite.node.sillhouette.tint = 0xfffab0;
	sprite.node.sillhouette.visible = true;
	game.nodeCurrentOver = sprite.node;
}

function mouseOutListener(sprite) {
	if (!sprite.node.clicked) {
		sprite.node.sillhouette.visible = false;
	}
	game.nodeCurrentOver = null;
}

function mouseClickListener(sprite) {
	game.nodeclicked = sprite.node;
	game.nodeClicked = true;
	//game.buttonPress = true;

	if (game.cableMode) {
		game.buttonPress = true;
		shopCablePanel.enableButton(sprite.node);
	}
	/*else if (sprite.node.type == "server") {
		nodeInfoServerPanel.setToNode(sprite.node);
	} else if (sprite.node.type == "resource"){
		nodeResourcePanel.setToNode(sprite.node);
  } else {
		nodeCityPanel.setToNode(sprite.node);
	}
	*/
}
