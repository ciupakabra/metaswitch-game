class City extends Node {
	constructor(network, x, y, lambda, p) {
		super(network, x, y, "city");
		this.seed = Random.engines.mt19937().autoSeed();
		this.p = p;
		this.exp_distro = Prob.exponential(lambda);
		//this.next_packet_cd = this.poisson_distro.apply(this.seed);
		this.newTimer();
		this.waitingPool = [];
		this.capacity = 50;
		graphicsManager.spriteInitCity(this);
	}

	info() { // Gotta change this
		var ret = "";

		for (var i = 0;i < this.p.length;++i) {
			ret += String(100 * this.p[i]["prob"]) + "% of " + this.p[i]["resource_unit"].color.toString(16) + "\n";
		}

		return ret;
	}

	process_packet(packet) {
		this.network.delete_packet(packet);
		if (packet.destination != this)
			return false;

		if (packet.state) {
			packet.delivered = true;
			var reward = packet.content.reward - packet.penalty;
			currentCredit += reward;
			lifetimeCredit += reward;
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

	newTimer() {
		this.nextTime = Phaser.Timer.SECOND * this.exp_distro.apply(this.seed);
		game.time.events.add(
			this.nextTime,
			this.create_request,
			this
		);
	}

	releaseWaitingPool() {
		var tmp = [];
		while (this.waitingPool.length > 0) {
			var packet = this.waitingPool.shift();
			if (packet.state) {
				var res = this.network.get_nearest_resource(this, packet.destination);
				if (res == null)
					tmp.push(packet);
				else {
					var cable = this.network.get_cable(this, res);
					cable.send_packet(this, packet);
			  }
		  }
		}

		this.waitingPool = tmp;
	}

	removefromWaiting(packet) {
		var pos = this.waitingPool.indexOf(packet);
		if (pos >= 0) {
			this.waitingPool = this.waitingPool.splice(i,1);
		}
		graphicsManager.arcUpdate(this);
	}

	create_request() {
		var req_unit = this.draw_request();
		var new_packet = new Packet(this, req_unit, null, req_unit.timeout);
		this.network.add_packet(new_packet);
		var res = this.network.get_nearest_resource(this, req_unit);
		if (res == null) {
			this.waitingPool.push(new_packet);
		} else {
			var cable = this.network.get_cable(this, res);
			cable.send_packet(this, new_packet);
		}
		graphicsManager.arcUpdate(this);
		this.newTimer();
	}
}
