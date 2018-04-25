class Server extends Node {
	constructor(network, x, y, capacity, max_nodes, level) {
		super(network, x, y, "server");
		this.max_nodes = max_nodes;
		this.connected_nodes = 0;
		this.level = 1;
		this.capacity = capacity;
		graphicsManager.spriteInitServer(this);
	}

	info() {
		return "Level " + String(this.level) + " Server\n" +
			"Capacity: " + String(this.capacity) + "\n" +
			"Remaining Cables: " + String(this.max_nodes - this.connected_nodes) + "\n";
	}

	connect_with(node) {
		this.connected_nodes++;
	}

	process_packet(packet) {
		if (!packet.state) {
			this.network.delete_packet(packet);
			return true;
		}
		graphicsManager.arcUpdate(this);

		// Packet destination is a specific node
		if (packet.destination instanceof Node) {
			var cable = this.network.get_cable(this, packet.destination);
			return cable.send_packet(this, packet);
		}

		// Packet destination is a type of resource
		if (packet.destination instanceof ResourceUnit) {
			var resource = this.network.get_nearest_resource(this, packet.destination);
			var cable = this.network.get_cable(this, resource);
			return cable.send_packet(this, packet);
		}

		return false;
	}
}
