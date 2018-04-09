class Packet {
	constructor(origin, destination, content, time) {
		this.origin = origin;
		this.destination = destination;
		this.content = content;
		this.state = true; // true for alive, i.e. timeleft >= 0, false for dead
		this.delivered = false;

		game.time.events.add(
			Phaser.Timer.SECOND * time,
			this.die,
			this
		);
	}

	die() {
		this.state = false;
		currentPenalty++;

		graphicsManager.deadPacket(this);
	}
}
