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
		this.packets.splice(idx, 1);
		return true;
	}

	get_cables(node) {
		var ret = [];

		for (var i = 0;i < this.cables.length;++i)
			if (this.cables[i].node_1 == node || this.cables[i].node_2 == node)
				ret.push(this.cables[i]);

		return ret;
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

		var queue = new PriorityQueue({
			comparator: function(a, b) {
				return a[0] - b[0];
			}
		});

		queue.queue([0, source]);
		while (queue.length != 0) {
			var v = queue.dequeue()[1];

			if (visited[v])
				continue;

			if (!(this.nodes[v] instanceof Server) && v != source)
				continue;

			visited[v] = true;

			for (var i = 0;i < this.adjacency_lists[v].length;++i) {
				var u = this.adjacency_lists[v][i][0];
				var edge = this.adjacency_lists[v][i][1];
				var weight = edge.total_time(this.nodes[v]);

                // depends on the function name in class Cable
				if (visited[u])
					continue;

				if (this.distances[source][v] + weight < this.distances[source][u]) {
					this.distances[source][u] = this.distances[source][v] + weight;
					this.edges[source][u] = edge;
					queue.queue([this.distances[source][u], u]);
				}
			}
		}
	}

	add_node(node) {
		if (this.nodes.indexOf(node) != -1)
			return false;

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

	packetsInNode(node) {
		var ret = 0;

		if (node instanceof City)
			ret += node.waitingPool.length;

		for (var i = 0;i < this.cables.length;++i) {
			if (this.cables[i].node_1 == node) {
				ret += this.cables[i].B1.length;
			} else if (this.cables[i].node_2 == node) {
				ret += this.cables[i].B2.length;
			}
		}

		return ret;
	}
	// Logic for connecting nodes
	can_connect(node1, node2) {
		var idx1 = this.nodes.indexOf(node1);
		var idx2 = this.nodes.indexOf(node2);

		if (node1 == node2) {
			return false;
		}

		for (var i = 0;i < this.adjacency_lists[idx1].length;++i) {
			if (this.adjacency_lists[idx1][i][0] == idx2) {
				return false;
			}
		}
		if (!(node1 instanceof Server) && !(node2 instanceof Server)) {
			return false;
		}

		var can1 = true;
		var can2 = true;

		if (node1 instanceof Server) {
			can1 = node1.connected_nodes < node1.max_nodes;
		}

		if (node2 instanceof Server) {
			can2 = node2.connected_nodes < node2.max_nodes;
		}
		return can1 && can2;
	}

	add_cable(cable) {
		if (this.can_connect(cable.node_1, cable.node_2)) {
			cable.node_1.connect_with(cable.node_2);
			cable.node_2.connect_with(cable.node_1);
			this.cables.push(cable);
			var idx_1 = this.nodes.indexOf(cable.node_1);
			var idx_2 = this.nodes.indexOf(cable.node_2);
			this.adjacency_lists[idx_1].push([idx_2, cable]);
			this.adjacency_lists[idx_2].push([idx_1, cable]);
			this.update_distances();

			for (var i = 0;i < this.nodes.length;++i) {
				if (this.nodes[i] instanceof City) {
						if (!paused) {
							this.nodes[i].releaseWaitingPool();
						} else {
							release.push(this.nodes[i]);
						}
				}
			}
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

	get_adjacent_cable(origin, destination) {
		var idx1 = this.nodes.indexOf(origin);
		var idx2 = this.nodes.indexOf(destination);

		for (var i = 0;i < this.adjacency_lists[idx1].length;++i) {
			if (this.adjacency_lists[idx1][i][0] == idx2) {
				return this.adjacency_lists[idx1][i][1];
			}
		}
		return null;
	}

	get_nearest_resource(origin, resource_unit) {
		var origin_idx = this.nodes.indexOf(origin);
        var maxDistance = 30;
        var available = [];
		for (var i = 0;i < this.nodes.length;++i) {
			var node = this.nodes[i];
			if (node instanceof Resource) {
				if (node.resource_unit == resource_unit && this.distances[origin_idx][i] < maxDistance) {
					available.push({'node': node, 'distance': this.distances[origin_idx][i]});
				}
			}
		}

        if (available.length==0) { return null; }
        available=available.map(function(x){ return {'node': x.node, 'distance': 1/((x.distance)**3)}});
        var sum = available.map(function(x){return x.distance}).reduce(function(a,b){return a+b},0);
        available = available.map(function(x){ return {'node': x.node, 'distance': x.distance/sum}});
        var numChoice = Math.random();
        var i = 0;
        var cumulative = available[i].distance
        while (cumulative < numChoice){
            i+=1
            cumulative += available[i].distance
        }
		return available[i].node;
	}
}
