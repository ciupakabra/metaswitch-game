var tutorialConfig = {
	preload: preload,
	create: create,
	update: update,
};

var tutorial;
function preload() {
	slickUI.load('assets/ui/kenney/kenney.json');
}

function create() {

	var escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
	escKey.onDown.add(function() {tutorialOn = false; game.state.start('menu')}, this);

	graphicsManager = new GraphicsManager;
	worldGenerator = new WorldGenerator;

  gameGroup = game.add.group();

	cables = game.add.group();
	packets = game.add.group();
	nodes = game.add.group();
	ui = game.add.group();
  arrow = game.add.group();

  game.arrow = game.add.group(arrow);
  game.arrowSprite = game.arrow.create(450, 300, 'arrow');
	game.arrowSprite.anchor.setTo(0.5);
  arrow.add(game.arrowSprite);
	game.arrowSprite.visible = false;
	game.tutorialPanel = new TutorialPanel();

	game.network = new Network();
	graphicsManager.network = game.network;

	paused = false;
}

function changeTutorialStep() {
	if (tutorialScreen == 1) {
		game.types = [];
		for (var i = 0;i < RESOURCE_COLORS.length;++i) {
			game.types.push(new ResourceUnit(i, 10 + Math.max(2 * Math.ceil((i-2)/2),0), 40, RESOURCE_COLORS[i]));
		}
		var dist = worldGenerator.generateCityDistribution(game.types);
		while (dist[0]["prob"] < 0.3) {
			dist = worldGenerator.generateCityDistribution(game.types);
		}
		game.newCity = new City(game.network, 200, 300, 1, dist);
		game.newServer = new Server(game.network, 450, 300, Infinity, 5, 1);
		game.network.add_node(game.newServer);
		var newResource = new Resource(game.network, 700, 260, game.types[5]);
		newResource = new Resource(game.network, 740, 300, game.types[2]);
		newResource = new Resource(game.network, 700, 300, game.types[1]);
		newResource = new Resource(game.network, 720, 340, game.types[4]);
		newResource = new Resource(game.network, 680, 340, game.types[3]);
		game.newResource = new Resource(game.network, 660, 300, game.types[0]);
		game.tutorialPanel.updatePanel(55, 40,
			"This is a city. The arcs around it represent the proportion of packet types it sends out"
		)
		game.arrowSprite.visible = true;
		arrowPosition(game.arrowSprite, 200, 220, Math.PI/2);
	} else if (tutorialScreen == 2) {
		game.tutorialPanel.updatePanel(305, 40,
			"This is a server. The server connects to the cities and resources, and sends packets to where they need to go"
		)
		arrowPosition(game.arrowSprite, 450, 220, Math.PI/2);
	} else if (tutorialScreen == 3) {
		game.tutorialPanel.updatePanel(305, 40,
			"You can buy a server by clicking on an empty space. A button will appear for you to confirm if you want to buy a server"
		)
	} else if (tutorialScreen == 4) {
		game.tutorialPanel.updatePanel(555, 40,
			"These are resources. The different colours represent different types of resource"
		)
		arrowPosition(game.arrowSprite, 700, 220, Math.PI/2);
  } else if (tutorialScreen == 5) {
		var cable = new Cable(game.network,	game.newCity,	game.newServer,	1, 50, 1);
		game.network.add_cable(cable);
		var cable = new Cable(game.network,	game.newServer,	game.newResource,	1,50, 1);
		game.network.add_cable(cable);
		game.tutorialPanel.updatePanel(205, 80,
			"This is a cable. Packets travel along these cables to get to the resource they need and then travel back to the city"
		)
		arrowPosition(game.arrowSprite, 350, 260, Math.PI/2);
		game.newCity.create_request = function() {
				var req_unit = game.types[0];
				var new_packet = new Packet(this, req_unit, null, req_unit.timeout);
				this.network.add_packet(new_packet);
				var res = game.network.get_nearest_resource(this, req_unit);
				var cable = game.network.get_cable(this, res);
				cable.send_packet(this, new_packet);
				game.time.events.add(
				  1500,
					this.create_request,
					this);
		};
		game.newCity.create_request();
	} else if (tutorialScreen == 6) {
		game.tutorialPanel.updatePanel(205, 80,
			"Cables can be bought by clicking on a node, choosing \"Buy\/Add Server\" and then selecting the place you want to connect"
		)
	} else if (tutorialScreen == 7) {
		game.tutorialPanel.updatePanel(205, 80,
			"The colour of packets represent the resource they need. Unfulfilled packets are slightly darker and have a black dot in the middle"
		)
		game.arrowSprite.visible = false;
	} else if (tutorialScreen == 8) {
		game.statusPanel = new StatusPanel(PANEL_MARGIN, PANEL_MARGIN, STATUS_PANEL_WIDTH, STATUS_PANEL_HEIGHT);
		game.arrowSprite.visible = true;
		arrowPosition(game.arrowSprite, 231, 59, Math.PI);
		game.tutorialPanel.updatePanel(258, 8,
			"This is your status. It tells you the amount of money you have, your score, and your total amount of time spent unpaused"
		);
	} else if (tutorialScreen == 9) {
		game.tutorialPanel.updatePanel(258, 8,
			"You start with 2000 credits, and it increases every time you filfill a request"
		);
	} else if (tutorialScreen == 10) {
		var buttonPause = game.add.button(game.width - 40, 8, 'buttonPause', function() {}, this, 1, 0, 1, 0);
		buttonPause.onInputDown.add(function() {pause(); game.buttonPress = true; buttonPause.visible = false; buttonPlay.visible = true;}, this);
		var buttonPlay = game.add.button(game.width - 40, 8, 'buttonPause', function() {}, this, 3, 2, 3, 2);
		game.buttonPlay = buttonPlay;
		game.buttonPause = buttonPause;
		buttonPause.visible = false;
		pause();
		buttonPlay.onInputDown.add(function() {pause(); game.buttonPress = true; buttonPause.visible = true; buttonPlay.visible = false;}, this);
		var buttonReload = game.add.button(game.width - 40, 56, 'buttonReload', function() {}, this, 1,0,1,0);
		buttonReload.onInputDown.add(function() {});
		game.tutorialPanel.updatePanel(520, 8,
			"These are the pause and restart buttons. Pausing the game allows you to build a network without time pressure"
		);
		arrowPosition(game.arrowSprite, 835, 50, 0);
	} else if (tutorialScreen == 11) {
		game.tutorialPanel.updatePanel(520, 8,
			"The game will start paused to allow you to build an initial network"
		);
  } else if (tutorialScreen == 12) {
		if (paused) {
			pause();
			game.buttonPlay.visible = false;
			game.buttonPause.visible = true;
		}
		game.buttonPause.onInputDown.removeAll();
		graphicsManager.satisfactionBarInit();
		arrowPosition(game.arrowSprite, 350, 260, Math.PI/2);
		game.types[0] = new ResourceUnit(0, 10 + Math.max(2 * Math.ceil((0-2)/2),0), 3, RESOURCE_COLORS[0]);
		game.newResource = new Resource(game.network, 660, 300, game.types[0]);
		var cable = new Cable(game.network,	game.newServer,	game.newResource,	1,50, 1);
		game.network.add_cable(cable);
		game.newCity.create_request = function() {
				var req_unit = game.types[0];
				var new_packet = new Packet(this, req_unit, null, req_unit.timeout);
				this.network.add_packet(new_packet);
				var res = game.network.get_nearest_resource(this, req_unit);
				var cable = game.network.get_cable(this, res);
				cable.send_packet(this, new_packet);
				game.time.events.add(
				  1500,
					this.create_request,
					this);
		}
		game.tutorialPanel.updatePanel(210, 80,
		  "After a certain amount of time an unfilled packet will die. This will be represented by a black circle"
		)
	} else if (tutorialScreen == 13) {
		game.tutorialPanel.updatePanel(210, 80,
			"Any dead packets will be removed before they are sent down another cable"
		)
  } else if (tutorialScreen == 14) {
		game.tutorialPanel.updatePanel(210, 80,
			"This is the penalty bar. Every time a packet dies it's colour will be added to this. The game ends when this is filled"
		)
		arrowPosition(game.arrowSprite, 350, 60, -Math.PI/2);
  } else if (tutorialScreen == 15) {
		game.types[0] = new ResourceUnit(0, 10 + Math.max(2 * Math.ceil((0-2)/2),0), Infinity, RESOURCE_COLORS[0]);
		game.newResource = new Resource(game.network, 660, 300, game.types[0]);
		var cable = new Cable(game.network,	game.newServer,	game.newResource,	1,50, 1);
		game.network.add_cable(cable);
		game.newCity.create_request = function() {
				var req_unit = game.types[0];
				var new_packet = new Packet(this, req_unit, null, req_unit.timeout);
				this.network.add_packet(new_packet);
				var res = game.network.get_nearest_resource(this, req_unit);
				var cable = game.network.get_cable(this, res);
				cable.send_packet(this, new_packet);
				game.time.events.add(
				  300,
					this.create_request,
					this);
		}
		arrowPosition(game.arrowSprite, 239, 332, -Math.PI/2);
		game.tutorialPanel.updatePanel(99, 352,
			"The inner bar is how full a node is. When a node is full the reward of all packets sent from that node will be decreased"
		)
	} else if (tutorialScreen == 16) {
		game.tutorialPanel.updatePanel(305, 400,
			"Too many packets in nodes can be solved by upgrading servers or cables"
		)
		game.arrowSprite.visible = false;
  } else if (tutorialScreen == 17) {
		game.tutorialPanel.updatePanel(305, 400,
			"Reselecting a cable gives the option of upgrading it and clicking on a server gives a \"Upgrade Server\" button"
		)
  } else if (tutorialScreen == 18) {
		game.tutorialPanel.updatePanel(305, 400,
			"Upgrading a server gives it a greater capacity and allows more nodes to be connected to it"
		)
  } else if (tutorialScreen == 19) {
		game.tutorialPanel.updatePanel(305, 400,
			"Upgrading a cable allows more packets to be sent in a given time and packets will also travel down the cable faster"
		)
  } else if (tutorialScreen == 20) {
		game.tutorialPanel.updatePanel(305, 400,
			"The level of a cable is given by its colour and the details of a server is given when it is clicked"
		)
  } else if (tutorialScreen == 21) {
		game.tutorialPanel.updatePanel(305, 400,
			"That concludes the tutorial. Press the button below to return to the main menu"
		)
		game.tutorialPanel.nextButtonText.value = "Return to Menu";
		game.tutorialPanel.nextButtonText.center();
  } else {
		tutorialOn = false;
		game.state.start("menu");
	}
}

function update() {
	if (tutorialScreen >= 8) {
		game.statusPanel.updateCredit(currentCredit);
		if (!paused) {
			totalTime += game.time.elapsedMS;
		}
	}
}

function arrowPosition(arrow, x, y, rotation) {
	arrow.x = x;
	arrow.y = y;
	arrow.rotation = rotation;
}
