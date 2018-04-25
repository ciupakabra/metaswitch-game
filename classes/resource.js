class ResourceUnit {
	constructor(type, reward, timeout, color) {
		this.type = type;
		this.reward = reward;
		this.timeout = timeout;
		this.color = color;
	}
}

class Resource extends Node {
	constructor(network, x, y, resource_unit) {
		super(network, x, y, "resource");
		this.resource_unit = resource_unit;
		this.color = this.resource_unit.color;
		graphicsManager.spriteInitResource(this);
		this.capacity = NaN;
	}

	info() {
		return "Type: resource\n";
	}

	process_packet(packet) {
		if (!packet.state) {
			this.network.delete_packet(packet);
			return true;
		}

		if (packet.destination != this.resource_unit)
			return false;

		packet.destination = packet.origin;
		packet.origin = this;
		packet.content = this.resource_unit;

		var cable = this.network.get_cable(this, packet.destination);
		return cable.send_packet(this, packet);
	}
}
