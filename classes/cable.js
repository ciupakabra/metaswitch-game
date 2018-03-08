class Cable {
	constructor(network, node_1, node_2, lambda, v) {
		this.network = network;
		this.distance = node_1.dist(node_2);
		this.node_1 = node_1;
		this.node_2 = node_2;
		this.lambda = lambda;
		this.v = v;
		this.B1 = [];
		this.B2 = [];
		this.Q1 = [];
		this.Q2 = [];
		// Number of time steps after which we can put a packet from a buffer
		// to the cable.
		this.delay_1 = 0;
		this.delay_2 = 0;
    spriteInit(this);
	}

	total_time() {
		return this.distance / this.v;
	}

	send_packet(node, packet) {
		if (this.node_1 == node) {
			this.B1.push(packet);
			return true;
		} else if (this.node_2 == node) {
			this.B2.push(packet);
			return true;
		}
		return false;
	}

	update() {
		// Reduce the delays by 1
		if (this.delay_1 > 0)
			this.delay_1 -= 1;
		if (this.delay_2 > 0)
			this.delay_2 -= 1;

		// Update the distances along the cables
		for (var i = 0;i < this.Q1.length;++i) {
			this.Q1[i][1] += this.v;
		}

		for (var i = 0;i < this.Q2.length;++i) {
			this.Q2[i][1] += this.v;
		}

		// Transfer the packets which travelled through the cable
		while (this.Q1.length != 0 && this.Q1[0][1] >= this.distance) {
			var packet = this.Q1.shift()[0]
			this.node_2.process_packet(packet);
			packet.sprite.destroy();
		}
		while (this.Q2.length != 0 && this.Q2[0][1] >= this.distance) {
			var packet = this.Q2.shift()[0]
			this.node_1.process_packet(packet);
			packet.sprite.destroy();
		}

		// Add packets from buffers to cables if possible
		if (this.B1.length != 0 && this.delay_1 == 0) {
			var packet = this.B1.shift();
			this.delay_1 = this.lambda;
			this.Q1.push([packet, 0]);
			spriteInit(packet, this, 1);
		}

		if (this.B2.length != 0 && this.delay_2 == 0) {
			var packet = this.B2.shift();
			this.delay_2 = this.lambda;
			this.Q2.push([packet, 0]);
			spriteInit(packet, this, 2);
		}
	}
}
