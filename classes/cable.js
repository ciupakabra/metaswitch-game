class Cable {
	constructor(network, node_1, node_2, lambda, v) {
		this.network = network;
		this.distance = node_1.dist(node_2);
		this.node_1 = node_1;
		this.node_2 = node_2;
		// Fraction of seconds
		this.lambda = lambda;
		// pixels / sec
		this.v = v;
		this.B1 = [];
		this.B2 = [];
		this.can_send_1 = true;
		this.can_send_2 = true;
		graphicsManager.spriteInitCable(this);
	}

	total_time() {
		return this.distance / this.v;
	}

	send_packet(node, packet) {
		if (this.node_1 == node) {
			this.B1.push(packet);
			if (this.can_send_1)
				this.releasePacket(1, false);
		} else if (this.node_2 == node) {
			this.B2.push(packet);
			if (this.can_send_2)
				this.releasePacket(2, false);
		}
		return false;
	}

	releasePacket(bufferNo, fromTimer) {
		if (fromTimer) {
			if (bufferNo == 1)
				this.can_send_1 = true;
			else if (bufferNo == 2)
				this.can_send_2 = true;
		}

		if (bufferNo == 1) {
			if (this.B1.length == 0)
				return;

			this.can_send_1 = false;

			var packet = this.B1.shift();

			packet.travelling = true;
			graphicsManager.spriteInitPacket(packet, this, this.node_1, this.node_2); 

			game.time.events.add(Phaser.Timer.SECOND * this.lambda, this.releasePacket, this, 1, true);
		} else if (bufferNo == 2) {
			if (this.B2.length == 0)
				return;

			this.can_send_2 = false;

			var packet = this.B2.shift();

			packet.travelling = true;
			graphicsManager.spriteInitPacket(packet, this, this.node_2, this.node_1); 

			game.time.events.add(Phaser.Timer.SECOND * this.lambda, this.releasePacket, this, 2, true);
		}
	}
}
