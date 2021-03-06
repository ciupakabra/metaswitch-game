class Packet {
	constructor(origin, destination, content, time) {
		this.origin = origin;
		this.destination = destination;
		this.content = content;
		this.state = true; // true for alive, i.e. timeleft >= 0, false for dead
		this.delivered = false;
		this.travelling = false;
		this.cable = null;
		this.cableSide = 0;
		this.id = packetCount;
		this.penalty = 0;
		packetCount++;

		new MyTimer(
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

		if (!this.travelling) {
			if (this.cable == null) {
				this.origin.removefromWaiting(this);
				graphicsManager.arcUpdate(this.origin);
			} else {
				this.cable.removePacket(this.cableSide, this);
			}
		}
		if (!tutorialOn) {
		  network.delete_packet(this);
	  }

		if (this.content == null) {
			deadPackets[this.destination.type] += 1;
		} else {
			deadPackets[this.content.type] += 1;
		}
		graphicsManager.satisfactionBarUpdate();

		if (this.travelling)
			graphicsManager.deadPacket(this);
	}

	rewardPenalty() {
		this.penalty = Math.min(5, this.penalty + 2);
	}
}
