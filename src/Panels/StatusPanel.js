class StatusPanel extends Panel {
	constructor(x, y, width, height) {
		super(x, y, width, height, "");
		var creditTextY = PANEL_LINE_DIST;
		this.creditText = new SlickUI.Element.Text(0, creditTextY, "Credit: 0\nScore: 0\nElapsed: 0:00.000", 18, "#ffffff");
		this.panel.add(this.creditText);
		/*
		var penaltyTextY = creditTextY + this.creditText.text.height + PANEL_LINE_DIST;
		this.penaltyText = new SlickUI.Element.Text(0, penaltyTextY, "Penalty: 0", 18, "#ffffff");
		this.panel.add(this.penaltyText);
		*/
	}

	updateCredit(credit) {
		this.creditText.value = "Credit: " + String(credit) + "\nScore: " + String(lifetimeCredit) + "\nElapsed: " + formatTime(totalTime);
	}
	/*
	updatePenalty(penalty) {
		this.penaltyText.value = "Penalty: " + String(penalty);
	}
	*/
}
