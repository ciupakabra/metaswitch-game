class Packet {
	construct(origin, destination, content, time) {
		this.origin = origin;
		this.destination = destination;
		this.content = content;
		this.timeleft = time;
		this.state = true; // true for alive, i.e. timeleft >= 0, false for dead
	}

	update() {
		this.timeleft -= 1;
		if (this.timeleft < 0)
			this.state = false;
		else
			this.state = true;
	}
}
