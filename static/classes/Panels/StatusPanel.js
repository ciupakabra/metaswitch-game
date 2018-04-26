class StatusPanel extends Panel {
	constructor(x, y, width, height) {
		super(x, y, width, height, "Status");
		var creditTextY = this.header.y + this.header.text.height + PANEL_LINE_DIST;
		this.creditText = new SlickUI.Element.Text(0, creditTextY, "Credit: 0", 18, "#ffffff");
		this.panel.add(this.creditText);
		var penaltyTextY = creditTextY + this.creditText.text.height + PANEL_LINE_DIST;
		this.penaltyText = new SlickUI.Element.Text(0, penaltyTextY, "Penalty: 0", 18, "#ffffff");
		this.panel.add(this.penaltyText);
	}

	updateCredit(credit) {
		this.creditText.value = "Credit: " + String(credit);
	}

	updatePenalty(penalty) {
		this.penaltyText.value = "Penalty: " + String(penalty);
	}
}
