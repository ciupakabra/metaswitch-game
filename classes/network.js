goog.require("goog.structs.PriorityQueue")
class Network {
	constructor() {
		this.nodes = []
		this.cables = []
		this.packets = []
		// distances[a][b] gives shortest time to get a packet from a to b
		// (assumes that there are no queues in cables and ignores their rate lambda)
		this.distances = {} 
		// edges[a][b] gives the cable which the node a should send a packet through
		// in order for the packet to reach b in the shortest time
		this.edges = {}
		// adjacency_list[a] gives a list of pairs [u, c] where u is an adjacent
		// node and c is the cable connecting a to u.
		this.adjacency_list = {}
	}

	update() {
		for (node in this.nodes) {
			node.update();
		}

		for (cable in this.cables) {
			cable.update();
		}

		for (packet in this.packets) {
			packet.update();
		}
	}

	update_distances() {
		for (node in this.nodes)
			dijkstra(node);
	}
	
	dijkstra(source) {
		var visited = {};
		for (node in this.nodes) {
			this.distances[source][node] = Infinity;
			this.edges[source][node] = null;
			visited[node] = false;
		}

		this.distances[source][source] = 0;
		var queue = new goog.structs.PriorityQueue();
		q.enqueue(0, source);
		while (!queue.isEmpty()) {
			var v = q.dequeue();

			if (visited[v])
				continue;
			visited[v] = true;

			for (adj in this.adjacency_list[v]) {
				var u = adj[0];
				var edge = adj[1];
				var weight = e.total_time(); // depends on the function name in class Cable

				if (visited[u])
					continue;

				if (this.distances[source][v] + weight < this.distances[source][u]) {
					this.distances[source][u] = this.distances[source][v] + weight;
					edges[u] = edge;
					queue.enqueue(this.distances[source][u], u);
				}
			}
		}
	}

	add_node(node) {
		this.nodes.push(node);
		this.adjacency_lists[node] = [];
		for (u in this.nodes) {
			this.distances[node][u] = Infinity;
			this.distances[u][node] = Infinity;
			this.edges[node][u] = null;
			this.edges[u][node] = null;
		}
		this.distances[node][node] = 0;
		return true;
	}

	add_cable(cable) {
		if (cable.node1 == cable.node2)
			return false;

		// Checks if we can connect in case of servers
		if (cable.node1 instanceof Server && !cable.node1.can_connect(cable.node2))
			return false;
		if (cable.node2 instanceof Server && !cable.node2.can_connect(cable.node1))
			return false;

		if (this.adjacency_list[cable.node1].includes(cable.node2))
			return false;
		this.cables.push(cable);
		return true;
	}

	get_cable(origin, destination) {
		return this.edges[origin][destination];
	}

	get_nearest_resource(origin, resource_type) {
		var closest = null;
		var distance = Infinity;

		for (node in this.nodes) {
			if (node instanceof Resource) {
				if (node.type == resource_type && this.distances[origin][node] < distance) {
					closest = node;
					distance = this.distances[origin][node];
				}
			}
		}
		return closest;
	}
}
