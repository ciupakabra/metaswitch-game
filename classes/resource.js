class ResourceUnit {
	construct(type, reward) {
		this.type = type;
		this.reward = reward;
	}
}

class Resource extends Node {
	construct(network, x, y, resource_unit) {
		super(network, x, y);
		this.resource_unit = resource_unit;
	}

	process_packet(packet) {
		if (packet.destination != this || packet.destination != this.resource_unit)
			return false;

		if (packet.content == "request") {
			new_packet = new Packet(this, packet.origin, this.resource_unit, packet.timeleft);
			cable = this.network.get_cable(this, new_packet.destination);
			return cable.send_packet(this, new_packet);
		}

		return false;
	}

	update() {
	}
}
