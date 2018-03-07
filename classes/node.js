class Node {
	constructor(network, x, y) {
		this.network = network;
		this.x = x;
		this.y = y;
		this.cables = [];
	}

	dist(node) {
		return Math.sqrt((this.x - node.x)**2 + (this.y - node.y)**2);
	}

	update() {
		return 0;
	}
}
