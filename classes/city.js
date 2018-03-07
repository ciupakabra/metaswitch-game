class City extends Node {
	constructor(network, x, y, lambda, p) {
		super(network, x, y);
		this.seed = Random.engines.mt19937().autoSeed();
		this.p = p;
		this.poisson_distro = Prob.poisson(lambda);
		this.next_packet_cd = this.poisson_distro.apply(this.seed);
		this.coins = 0;
	}

	process_packet(packet) {
		if (!packet.state) {
			this.network.delete_packet(packet);
		}
		if (packet.destination != this)
			return false;
		
		if (packet.state) {
			this.coins += packet.content.reward;
			return true;
		}
		
		return false;
	}

	draw_request() {
		var t = Math.random();
		var s = 0;
		var idx = 0;

		while (s <= t) {
			s += this.p[idx]["prob"];
			idx++;
		}

		idx--;
		s -= this.p[idx]["prob"];

		return this.p[idx]["resource_unit"];
	}

	update() {
		this.next_packet_cd--;

		if (this.next_packet_cd == 0) {
			var req_unit = this.draw_request();
			var new_packet = new Packet(this, req_unit, null, req_unit.timeout);
			this.network.add_packet(new_packet);
			var res = this.network.get_nearest_resource(this, req_unit);
			var cable = this.network.get_cable(this, res);
			cable.send_packet(this, new_packet);
			this.next_packet_cd = this.poisson_distro.apply(this.seed);
		}
		var ret = this.coins;
		this.coins = 0;
		return ret;
	}
}
