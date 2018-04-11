class Server extends Node {
	constructor(network, x, y, max_servers, max_cities, max_resources) {
		super(network, x, y);
		this.max_servers = max_servers;
		this.max_cities = max_cities;
		this.max_resources = max_resources;
		this.connected_servers = 0;
		this.connected_cities = 0;
		this.connected_resources = 0;
		graphicsManager.spriteInitServer(this);
	}

	info() {
		return "Type: server\n" + 
			"Can connect to:\n" + 
			String(this.max_servers - this.connected_servers) + " servers\n" + 
			String(this.max_cities - this.connected_cities) + " cities\n" + 
			String(this.max_resources - this.connected_resources) + " resources\n";
	}

	connect_with(node) {
		if (node instanceof Server)
			this.connected_servers++;
		else if (node instanceof City)
			this.connected_cities++;
		else if (node instanceof Resource)
			this.connected_resources++;
	}

	process_packet(packet) {
		if (!packet.state) {
			this.network.delete_packet(packet);
			return true;
		}

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
