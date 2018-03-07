class Packet {
	constructor(origin, destination, content, time) {
		this.origin = origin;
		this.destination = destination;
		this.content = content;
		this.timeleft = time;
		this.state = true; // true for alive, i.e. timeleft >= 0, false for dead
	}

	update() {
		if (this.timeleft == 0) {
			this.timeleft = -1;
			this.state = false;
			return -1;
		} else {
			this.timeleft--;
		}
		return 0;
	}
}
