class Node {
	constructor(network, x, y, type) {
		this.network = network;
		this.x = x;
		this.y = y;
		this.cables = [];
		this.type = type;
	}

	connect_with(node) {
	}

	dist(node) {
		return (Math.sqrt((this.sprite.x - node.sprite.x)**2 + (this.sprite.y - node.sprite.y)**2));
	}
}
