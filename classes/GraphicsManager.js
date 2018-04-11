class GraphicsManager {
	constructor() {}

	renderServerGraphics(server) {
		var cables = network.get_cables(server);

		var packets = [];

		for (var i = 0;i < cables.length;++i) {
			if (cables[i].node_1 == server) { packets.concat(cables[i].B1);
			} else {
				packets.concat(cables[i].B2);
			}
		}

		var colors = {};

		for (var i = 0;i < packets.length;++i) {
			var color = Phaser.Color.blendAverage(packets[i].sprite.color, packets[i].sprite.tint);

			if (!(color in colors)) {
				colors[color] = 1;
			} else {
				colors[color]++;
			}
		}

		var fromX = -20;
		var width = 40;
		var y = -19;

		var graphics = game.make.graphics(server.x, server.y);
		
		graphics.beginFill(0x000000);
		graphics.drawRect(-25, -25, 50, 50);
		graphics.beginFill(0xffffff);
		graphics.drawRect(-20, -20, 40, 40);

		for (var key in colors) {
			graphics.beginFill(key);
			graphics.drawRect(fromX, y, width, colors[key]);
			y += colors[key];
		}
		
		return graphics;
	}

	spriteInitNode(node) {
		if (node instanceof Server) {
			node.sprite = gameGroup.create(node.x, node.y, 'server');
		} else if (node instanceof City) {
			node.sprite = gameGroup.create(node.x, node.y, 'city');
		} else if (node instanceof Resource) {
			node.sprite = gameGroup.create(node.x, node.y, 'resource');
			node.sprite.tint = node.color;
		}

		node.sillhouette = gameGroup.create(node.x, node.y, this.createSillhouette(node.sprite.key));
		node.sillhouette.scale.set(1.1);
		node.sillhouette.anchor.set(0.5, 0.5);
		node.sillhouette.tint = 0xfffab0;
		node.sillhouette.visible = false;
		gameGroup.bringToTop(node.sprite);

		node.sprite.anchor.set(0.5, 0.5);
		node.sprite.inputEnabled = true;

		node.clicked = false;

		node.sprite.events.onInputOver.add(function(sprite) {
			if (!sprite.node.clicked) {
				sprite.node.sillhouette.tint = 0xfffab0;
				sprite.node.sillhouette.visible = true;
			}

			nodeInfoOverListener(sprite.node);
		});

		node.sprite.events.onInputOut.add(function(sprite) {
			if (!sprite.node.clicked) {
				sprite.node.sillhouette.visible = false;
			}

			nodeInfoOutListener();
		});

		node.sprite.events.onInputDown.add(function(sprite) {
			if (!sprite.node.clicked) {
				sprite.node.sillhouette.tint = 0x000000;
				sprite.node.sillhouette.visible = true;
				sprite.node.clicked = true;
			} else {
				sprite.node.sillhouette.visible = false
				sprite.node.clicked = false;
			}

			nodeInfoClickListener();
			shopNodeClickListener(sprite.node);
		});

		node.sprite.node = node;
	}

	spriteInitCable(cable) {
		cable.graphics = game.make.graphics();
		cable.graphics.lineStyle(4, 0x780116);
		cable.graphics.moveTo(cable.node_1.x, cable.node_1.y);
		cable.graphics.lineTo(cable.node_2.x, cable.node_2.y);
		cable.graphics.endFill();

		cable.graphics.inputEnabled = true;

		cable.graphics.events.onInputOver.add(function() {
			this.alpha = 0.5;
		}, cable.graphics);

		cable.graphics.events.onInputOut.add(function() {
			this.alpha = 1.0;
		}, cable.graphics);

		gameGroup.add(cable.graphics);
		cable.node_1.sprite.bringToTop();
		cable.node_2.sprite.bringToTop();
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

		gameGroup.add(packet.sprite);
		node_from.sprite.bringToTop();
		node_to.sprite.bringToTop();

		var time = Phaser.Timer.SECOND * cable.total_time();
		var tween = game.add.tween(packet.sprite).to(
			{x : node_to.x, y : node_to.y}, 
			time, 
			Phaser.Easing.Linear.NONE, 
			true
		);
		tween.onComplete.add(function() {
			this.travelling = false;
			this.sprite.destroy();
		}, packet, 1);

		// We add a dummy function to lose the two arguments
		// that onComplete adds.
		tween.onComplete.add(function(d1, d2, node_to, packet) {
			node_to.process_packet(packet);
		}, this, 0, node_to, packet);
	}

	deadPacket(packet) {
		packet.sprite.tint = 0x000000;
	}

	createSillhouette(source) {
		var bmd = game.make.bitmapData()
		bmd.load(source);
		bmd.processPixelRGB(function(pixel) {
			pixel.r = 255;
			pixel.g = 255;
			pixel.b = 255;
			return pixel;
		});
		return bmd;
	}
}
