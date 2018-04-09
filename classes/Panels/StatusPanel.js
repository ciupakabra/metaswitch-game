class StatusPanel extends Panel {
	constructor(x, y, width, height) {
		super(x, y, width, height, "Status");
		var creditTextY = this.header.y + this.header.size + PANEL_LINE_DIST;
		this.creditText = new SlickUI.Element.Text(PANEL_PADDING, creditTextY, "Credit: 0");
		this.panel.add(this.creditText);
		var penaltyTextY = creditTextY + this.creditText.text.height + PANEL_LINE_DIST;
		this.penaltyText = new SlickUI.Element.Text(PANEL_PADDING, penaltyTextY, "Penalty: 0");
		this.panel.add(this.penaltyText);
	}

	updateCredit(credit) {
		this.creditText.value = "Credit: " + String(credit);
	}

	updatePenalty(penalty) {
		this.penaltyText.value = "Penalty: " + String(penalty);
	}
}
