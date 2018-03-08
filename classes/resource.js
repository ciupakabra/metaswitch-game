class ResourceUnit {
	constructor(type, reward, timeout) {
		this.type = type;
		this.reward = reward;
		this.timeout = timeout;
	}
}

class Resource extends Node {
	constructor(network, x, y, resource_unit) {
		super(network, x, y);
		this.resource_unit = resource_unit;
		spriteInit(this);
	}

	process_packet(packet) {
		if (!packet.state) {
			this.network.delete_packet(packet);
			return true;
		}

		if (packet.destination != this.resource_unit)
			return false;

		var new_packet = new Packet(this, packet.origin, this.resource_unit, packet.timeleft);
		var cable = this.network.get_cable(this, new_packet.destination);
		return cable.send_packet(this, new_packet);
	}
}
