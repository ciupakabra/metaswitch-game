class City extends Node {
	construct(network, x, y, lambda, p) {
		super(network, x, y);
		this.p = p;
		this.poisson_distro = Prob.poisson(lambda);
	}

	process_packet(packet) {
		if (packet.destination != this)
			return false;
		
		if (packet.state) {
			// award packet.resource_unit.reward coins
			return true;
		}
		return false;
	}

	update() {

	}
}
