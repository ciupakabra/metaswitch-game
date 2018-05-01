class TutorialPanel extends Panel {
	constructor() {
		super(305, 225, 290, 150, "");
		this.mainText = new SlickUI.Element.Text(0, 0, "Welcome to the tutorial of Net-a-Switch. To leave the tutorial at any time press the ESCAPE key.", 18, "#ffffff");
    this.panel.add(this.mainText);
    this.constructNextButton();
	}

  constructNextButton() {
		var buttonY = this.panel.height - 35;
		var buttonWidth = this.panel.width;
		this.nextButton = new SlickUI.Element.Button(0, buttonY, buttonWidth, 30);
		this.panel.add(this.nextButton);
		this.nextButtonText = new SlickUI.Element.Text(0, 0, "Next");
		this.nextButton.add(this.nextButtonText).center();

		this.nextButton.events.onInputDown.add(function() {
      tutorialScreen += 1;
      changeTutorialStep();
		}, this);
	}

  updatePanel(x, y, text) {
    this.panel.x = x;
    this.panel.y = y;
    this.mainText.value = text;
  }
}
