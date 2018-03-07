goog.require("goog.structs.PriorityQueue")
class Network {
	constructor() {
		this.nodes = [];
		this.cables = [];
		this.packets = [];
		// distances[a][b] gives shortest time to get a packet from a to b
		// (assumes that there are no queues in cables and ignores their rate lambda)
		this.distances = [];
		// edges[a][b] gives the cable which the node a should send a packet through
		// in order for the packet to reach b in the shortest time
		this.edges = [];
		// adjacency_list[a] gives a list of pairs [u, c] where u is an adjacent
		// node and c is the cable connecting a to u.
		this.adjacency_lists = [];
	}

	delete_packet(packet) {
		var idx = this.packets.indexOf(packet);
		if (idx == -1)
			return false;
		this.packet.splice(idx, 1);
		return true;
	}
	
	update() {
		var coins = 0;

		for (var i = 0;i < this.nodes.length;++i) {
			coins += this.nodes[i].update();
		}

		for (var i = 0;i < this.cables.length;++i) {
			this.cables[i].update();
		}

		var died = 0;

		for (var i = 0;i < this.packets.length;++i) {
			died += this.packets[i].update();
		}

		return [died, coins];
	}

	update_distances() {
		for (var i = 0;i < this.nodes.length;++i) {
			this.dijkstra(i);
		}
	}
	
	dijkstra(source) {
		var visited = [];
		for (var i = 0;i < this.nodes.length;++i) {
			this.distances[source][i] = Infinity;
			this.edges[source][i] = null;
			visited.push(false);
		}

		this.distances[source][source] = 0;
		var queue = new goog.structs.PriorityQueue();
		queue.enqueue(0, source);
		while (!queue.isEmpty()) {
			var v = queue.dequeue();
			
			if (visited[v])
				continue;
			visited[v] = true;
			for (var i = 0;i < this.adjacency_lists[v].length;++i) {
				var u = this.adjacency_lists[v][i][0];
				var edge = this.adjacency_lists[v][i][1];
				var weight = edge.total_time(); // depends on the function name in class Cable
				if (visited[u])
					continue;

				if (this.distances[source][v] + weight < this.distances[source][u]) {
					this.distances[source][u] = this.distances[source][v] + weight;
					this.edges[source][u] = edge;
					queue.enqueue(this.distances[source][u], u);
				}
			}
		}
	}

	add_node(node) {
		var node_idx = this.nodes.length;
		this.nodes.push(node);
		this.adjacency_lists.push([]);
		this.distances.push([]);
		this.edges.push([]);

		for (var i = 0;i < this.nodes.length;++i) {
			this.distances[node_idx][i] = Infinity;
			this.distances[i][node_idx] = Infinity;
			this.edges[node_idx][i] = null;
			this.edges[i][node_idx] = null;
		}
		this.distances[node_idx][node_idx] = 0;
		return true;
	}

	// Logic for connecting nodes
	can_connect(node1, node2) {
		var idx1 = this.nodes.indexOf(node1);
		var idx2 = this.nodes.indexOf(node2);

		if (node1 == node2)
			return false;
		if (this.adjacency_lists[idx1].includes(idx2))
			return false;
		if (!(node1 instanceof Server) && !(node2 instanceof Server))
			return false;

		var can1 = true;
		var can2 = true;

		if (node1 instanceof Server) {
			if (node2 instanceof Server) {
				can1 = node1.connected_servers < node1.max_servers;
			}

			if (node2 instanceof Resource) {
				can1 = node1.connected_resources < node1.max_resources;
			}

			if (node2 instanceof City) {
				can1 = node1.connected_cities < node1.max_cities;
			}
		}
		
		if (node2 instanceof Server) {
			if (node1 instanceof Server) {
				can2 = node2.connected_servers < node2.max_servers;
			}

			if (node1 instanceof Resource) {
				can2 = node2.connected_resources < node2.max_resources;
			}

			if (node1 instanceof City) {
				can2 = node2.connected_cities < node2.max_cities;
			}
		}

		return can1 && can2;
	}

	add_cable(cable) {
		if (this.can_connect(cable.node_1, cable.node_2)) {
			this.cables.push(cable);
			var idx_1 = this.nodes.indexOf(cable.node_1);
			var idx_2 = this.nodes.indexOf(cable.node_2);
			this.adjacency_lists[idx_1].push([idx_2, cable]);
			this.adjacency_lists[idx_2].push([idx_1, cable]);
			this.update_distances();
			return true;
		}
		return false;
	}

	add_packet(packet) {
		this.packets.push(packet);
	}

	get_cable(origin, destination) {
		var origin_idx = this.nodes.indexOf(origin);
		var destination_idx = this.nodes.indexOf(destination);
		return this.edges[destination_idx][origin_idx];
	}

	get_nearest_resource(origin, resource_unit) {
		var origin_idx = this.nodes.indexOf(origin);
		var nearest = null;
		var distance = Infinity;

		for (var i = 0;i < this.nodes.length;++i) {
			var node = this.nodes[i];
			if (node instanceof Resource) {
				if (node.resource_unit == resource_unit && this.distances[origin_idx][i] < distance) {
					nearest = node;
					distance = this.distances[origin_idx][i];
				}
			}
		}
		return nearest;
	}
}
