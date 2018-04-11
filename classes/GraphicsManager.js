class GraphicsManager {
	constructor() {}

	spriteInitServer(node) {
		node.graphicsGroup = game.add.group(gameGroup);
		
		node.sprite = node.graphicsGroup.create(node.x, node.y, 'server');
		node.sprite.anchor.set(0.5, 0.5);
		node.sprite.inputEnabled = true;
		node.sprite.node = node;
		this.createSillhouette(node);
		node.clicked = false;

		node.sprite.events.onInputOver.add(mouseOverListener);
		node.sprite.events.onInputOut.add(mouseOutListener);
		node.sprite.events.onInputDown.add(mouseClickListener);
	}

	spriteInitResource(node) {
		node.graphicsGroup = game.add.group(gameGroup);

		node.sprite = node.graphicsGroup.create(node.x, node.y, 'resource');
		node.sprite.tint = node.color;
		node.sprite.anchor.set(0.5, 0.5);
		node.sprite.inputEnabled = true;
		node.sprite.node = node;
		this.createSillhouette(node);
		node.clicked = false;

		node.sprite.events.onInputOver.add(mouseOverListener);
		node.sprite.events.onInputOut.add(mouseOutListener);
		node.sprite.events.onInputDown.add(mouseClickListener);
	}

	spriteInitCity(node) {
		node.graphicsGroup = game.add.group(gameGroup);

		node.sprite = node.graphicsGroup.create(node.x, node.y, 'city');
		node.sprite.anchor.set(0.5, 0.5);
		node.sprite.inputEnabled = true;
		node.sprite.node = node;
		this.createSillhouette(node);
		node.clicked = false;

		node.graphics = game.add.graphics(node.x, node.y);
		var sum = 0;
		for (var i = 0;i < node.p.length;++i) {
			if (node.p[i]["prob"] > 0) {
				node.graphics.lineStyle(6, node.p[i]["resource_unit"]["color"]);
				var angleFrom = game.math.degToRad(360 * sum + 5);
				var angleTo = game.math.degToRad(360 * (sum + node.p[i]["prob"]) - 5);
				node.graphics.arc(0, 0, 50, angleFrom, angleTo, false);
				sum += node.p[i]["prob"];
			}
		}
		node.graphicsGroup.add(node.graphics);

		node.sprite.events.onInputOver.add(mouseOverListener);
		node.sprite.events.onInputOut.add(mouseOutListener);
		node.sprite.events.onInputDown.add(mouseClickListener);
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
}

function mouseOverListener(sprite) {
	if (!sprite.node.clicked) {
		sprite.node.sillhouette.tint = 0xfffab0;
		sprite.node.sillhouette.visible = true;
	}

	nodeInfoOverListener(sprite.node);
}

function mouseOutListener(sprite) {
	if (!sprite.node.clicked) {
		sprite.node.sillhouette.visible = false;
	}

	nodeInfoOutListener();
}

function mouseClickListener(sprite) {
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
}
