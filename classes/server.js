class Server extends Node {
	constructor(network, x, y, max_servers, max_cities, max_resources) {
		super(network, x, y);
		this.max_servers = max_servers;
		this.max_cities = max_cities;
		this.max_resources = max_resources;
		this.connected_servers = 0;
		this.connected_cities = 0;
		this.connected_resources = 0;
	}

	// Checks if adding a cable between this server and a node doesn't
	// exceed the limitations.
	can_connect(node) {
		if (node instanceof Server) {
			return this.connected_servers < this.max_servers;
		}

		if (node instanceof Resource) {
			return this.connected_resources < this.max_resources;
		}

		if (node instanceof Cities) {
			return this.connected_cities < this.max_cities;
		}
	}

	process_packet(packet) {
		// Packet destination is a specific node
		if (packet.destination instanceof Node) {
			cable = this.network.get_cable(this, packet.destination);
			return cable.send_packet(this, packet);
		}

		// Packet destination is a type of resource
		if (packet.destination instanceof ResourceUnit) {
			resource = this.network.get_nearest_resource(this, packet.destination);
			cable = this.network.get_cable(this, resource);
			return cable.send_packet(this, packet);
		}

		return false;
	}
}
