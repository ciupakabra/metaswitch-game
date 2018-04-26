class Packet {
	constructor(origin, destination, content, time) {
		this.origin = origin;
		this.destination = destination;
		this.content = content;
		this.state = true; // true for alive, i.e. timeleft >= 0, false for dead
		this.delivered = false;
		this.travelling = false;
		this.id = packetCount;
		packetCount++;

		game.time.events.add(
			Phaser.Timer.SECOND * time,
			this.die,
			this
		);
	}

	die() {
		if (this.delivered)
			return;

		this.state = false;
		currentPenalty++;

		if (this.content == null) {
			deadPackets[this.destination.type - 1] += 1;
		} else {
			deadPackets[this.content.type - 1] += 1;
		}
		graphicsManager.satisfactionBarUpdate();

		if (this.travelling)
			graphicsManager.deadPacket(this);
	}
}
