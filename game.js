var config = {
	renderer: Phaser.AUTO,
	width: 900,
	height: 600,
}

var bootConfig = {
	preload: function() {
		game.load.spritesheet('button', 'assets/ui/menu/buttons.png', 600, 150);
		game.load.spritesheet('buttonSmall', 'assets/ui/menu/buttonsSmall.png', 250, 125);
		game.load.spritesheet('buttonPause', 'assets/ui/menu/buttonsPause.png', 35, 35);
		game.load.image('tutorial1', 'assets/ui/menu/tutorial1.png');
		game.load.image('aboutUs', 'assets/ui/menu/aboutUs.png');

		game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
		slickUI = game.plugins.add(Phaser.Plugin.SlickUI);
	}
}

var menuConfig = {
	create: function() {
		game.stage.backgroundColor = 0x111111;

		function createButton(x, y, text, funct) {
			button = game.add.button(x, y, 'button', function() {}, this, 1, 0, 1, 0);
			button.onInputDown.add(funct, this);
			text = game.add.text(x + 300, y + 75, text);
			text.font = 'Lato';
			text.anchor.setTo(0.5);
			text.fontSize = 80;
		}

		createButton(150, 34, "Play Game", function() {game.state.start('game')});
		createButton(150, 218, "Tutorial", function() {game.state.start('tutorial')});
		createButton(150, 402, "About Us", function() {game.state.start('about')});

	}
}

var tutorialConfig = {
	create: function() {
		game.stage.backgroundColor = 0x111111;
		background = game.add.tileSprite(0, 0, 900, 600, 'tutorial1');

		button = game.add.button(325, 450, 'buttonSmall', function() {}, this, 1, 0, 1, 0);
		button.onInputDown.add(function() {game.state.start('menu')}, this);
		text = game.add.text(450, 512, "Menu");
		text.font = 'Lato';
		text.anchor.setTo(0.5);
		text.fontSize = 60;
	}
}

var aboutConfig = {
	create: function() {
		game.stage.backgroundColor = 0x111111;
		background = game.add.tileSprite(0, 0, 900, 600, 'aboutUs');

		button = game.add.button(166, 450, 'buttonSmall', function() {}, this, 1, 0, 1, 0);
		button.onInputDown.add(function() {window.open('https://www.metaswitch.com/careers')}, this);
		text = game.add.text(291, 512, "Careers");
		text.font = 'Lato';
		text.anchor.setTo(0.5);
		text.fontSize = 60;

		button = game.add.button(517, 450, 'buttonSmall', function() {}, this, 1, 0, 1, 0);
		button.onInputDown.add(function() {game.state.start('menu')}, this);
		text = game.add.text(642, 512, "Menu");
		text.font = 'Lato';
		text.anchor.setTo(0.5);
		text.fontSize = 60;
	}
}

var playConfig = {
	preload: preload,
	create: create,
	update: update,
	render: render,
};

// Colors
var RESOURCE_COLORS = [
	0xED1C24,
	0xFDFFFC,
	0x8cb369,
	0xf4e285,
	0x368f8b,
	0x235789,
]

var CABLE_COLORS = [
	0x808080,
	0xffffff,
	0x63c93a,
	0x1b36ff,
	0x961496,
	0xffab12
]

var BGCOL = 0x111111;

var SHOP_WIDTH = 200;

// Redefining Phaser functions to avoid glitch where a packet travels in pause mode after re-focusing
Phaser.Game.prototype.gameResumed = function (event) {
	if (this._paused && !this._codePaused)
	{
		this._paused = false;
		if (!paused) {
			this.time.gameResumed();
		} else {
			foreverTimers.forEach(function(item) {console.log(item); item.resume();})
		}
		this.input.reset();
		this.sound.unsetMute();
		this.onResume.dispatch(event);
	}
}

var game = new Phaser.Game(config);
game.state.add('boot', bootConfig);
game.state.add('menu', menuConfig);
game.state.add('tutorial', tutorialConfig);
game.state.add('about', aboutConfig);
game.state.add('game', playConfig);

game.state.start('boot');
var worldScale = 0.8;
var gameGroup;

var nodes;
var packets;
var cables;

var slickUI;
var graphicsManager;
var worldGenerator;

// Game vars

var currentCredit = 2000;
var lifetimeCredit = 0;
var currentPenalty = 0;
var packetCount = 0;
var deadPackets = [];
var paused = false;
var release = [];
var totalTime = 0;
var currentCity = null;
for (var i = 0;i < RESOURCE_COLORS.length;++i) {
	deadPackets[i] = 0;
}
var foreverTimers = [];
var cursors;

function initialisation() {
	currentCredit = 2000;
	currentPenalty = 0;
	packetCount = 0;
	lifetimeCredit = 0;
	deadPackets = [];
	release = [];
	totalTime = 0;
	paused = false;
	foreverTimers = [];
	currentCity = null;
	for (var i = 0;i < RESOURCE_COLORS.length;++i) {
		deadPackets[i] = 0;
	}
	worldScale = 0.5;
}
WebFontConfig = {
	active: function() {game.state.start('menu', menuConfig);},
	inactive: function() {game.state.start('menu', menuConfig);},
	google: {
		families: ['Lato'],
	}
};


function preload() {
	this.load.image('server', 'assets/server.png');
	this.load.image('resource', 'assets/resource.png');
	this.load.image('city', 'assets/city.png');

	// Leave this at the bottom of the method
	slickUI.load('assets/ui/kenney/kenney.json');
}

// Panel constants
var STATUS_PANEL_WIDTH = 200;
var STATUS_PANEL_HEIGHT = 100;

var SHOP_PANEL_WIDTH = STATUS_PANEL_WIDTH;

var NODE_INFO_WIDTH = 200;
var NODE_INFO_HEIGHT = 165;

var CITY_INFO_HEIGHT = 75;

var BUY_SERVER_WIDTH = 200;
var BUY_SERVER_HEIGHT = 50;

var BUY_CABLE_WIDTH = 200;
var BUY_CABLE_HEIGHT = 75;

var PANEL_WIDTH = 200;
var PANEL_MARGIN = 8;
var PANEL_LINE_DIST = 10;

var statusPanel;
var nodeInfoPanel;
var shopPanel;

function createPanels() {
	statusPanel = new StatusPanel(PANEL_MARGIN, PANEL_MARGIN, STATUS_PANEL_WIDTH, STATUS_PANEL_HEIGHT);
	var shopPanelY = statusPanel.panel.y + STATUS_PANEL_HEIGHT + PANEL_MARGIN;
	var shopPanelHeight = game.height - shopPanelY - PANEL_MARGIN;

	nodeCityPanel = new NodeCityPanel(0, 0, NODE_INFO_WIDTH, CITY_INFO_HEIGHT);
	nodeCityPanel.visible = false;
	nodeInfoServerPanel = new NodeInfoServerPanel(0, 0, NODE_INFO_WIDTH, NODE_INFO_HEIGHT + 30);
	nodeInfoServerPanel.visible = false;
	nodeResourcePanel = new NodeResourcePanel(0, 0, BUY_CABLE_WIDTH, BUY_CABLE_HEIGHT);
	nodeResourcePanel.visible = false;
	shopServerPanel = new ShopServerPanel(0, 0, BUY_SERVER_WIDTH, BUY_SERVER_HEIGHT);
	shopServerPanel.visible = false;
	shopCablePanel = new ShopCablePanel(0, 0, BUY_CABLE_WIDTH, BUY_CABLE_HEIGHT);
	shopCablePanel.visible = false;
}

function create() {
	initialisation();
  cursors = game.input.keyboard.createCursorKeys();
	buttonPause = game.add.button(game.width - 40, 8, 'buttonPause', function() {}, this, 1, 0, 1, 0);
	buttonPause.onInputDown.add(function() {pause(); game.buttonPress = true; buttonPause.visible = false; buttonPlay.visible = true;}, this);
	buttonPlay = game.add.button(game.width - 40, 8, 'buttonPause', function() {}, this, 3, 2, 3, 2);
	buttonPlay.onInputDown.add(function() {pause(); game.buttonPress = true; buttonPause.visible = true; buttonPlay.visible = false;}, this);
	buttonPlay.visible = false;
	graphicsManager = new GraphicsManager();
	worldGenerator = new WorldGenerator();
	gameGroup = game.add.group();

	cables = game.add.group();
	packets = game.add.group();
	nodes = game.add.group();
	ui = game.add.group();

	ui.add(buttonPause);
	ui.add(buttonPlay);

	gameGroup.add(cables);
	gameGroup.add(packets);
	gameGroup.add(nodes);

	gameGroup.position.setTo(game.world.centerX, game.world.centerY);
	game.input.mouse.capture = true;

	this.iKey = game.input.keyboard.addKey(Phaser.Keyboard.I);
	this.iKey.onDown.add(function() {worldGenerator.generateResources(1, worldGenerator.types)}, this);

	this.oKey = game.input.keyboard.addKey(Phaser.Keyboard.O);
	this.oKey.onDown.add(graphicsManager.newCityText, graphicsManager);

	this.tabKey = game.input.keyboard.addKey(Phaser.Keyboard.TAB);
	this.tabKey.onDown.add(moveToCity, this);

	function mouseWheel(event) {
		var cursorx = (gameGroup.x - game.input.activePointer.position.x)/worldScale;
		var cursory = (gameGroup.y - game.input.activePointer.position.y)/worldScale;
		if (game.input.mouse.wheelDelta == -1) {
			if (worldScale != 0.25) {
				gameGroup.x -= cursorx * 0.05;
				gameGroup.y -= cursory * 0.05;
			}
			worldScale -= 0.05;
		} else {
			if (worldScale != 1) {
				gameGroup.x += cursorx * 0.05;
				gameGroup.y += cursory * 0.05;
			}
			worldScale += 0.05;

		}
		worldScale = Phaser.Math.clamp(worldScale, 0.25, 1);
		gameGroup.scale.set(worldScale);
	}

	game.input.mouse.mouseWheelCallback = mouseWheel;
	game.stage.backgroundColor = 0x111111;

	game.clicked = false;
	game.nodeclicked = false;
	game.currentActivePanel = null;
	game.buttonPress = false;
	game.cableMode = false;


	network = new Network();
	worldGenerator.initGameWorld();
	for (i = 0; currentCity == null; i++) {
		if (network.nodes[i] instanceof City) {
			currentCity = network.nodes[i];
		}
	}

	createPanels();
	graphicsManager.satisfactionBarInit();
	graphicsManager.newCityTextInit();

	gameGroup.scale.set(worldScale);
}

function update() {
	updateCamera();

	if (cursors.up.isDown) {
    gameGroup.y += 4;
  }
  else if (cursors.down.isDown) {
    gameGroup.y -= 4;
  }

	if (cursors.left.isDown) {
    gameGroup.x += 4;
  } else if (cursors.right.isDown) {
    gameGroup.x -= 4;
  }

	generalClickCheck();
	if (!paused) {
		totalTime += game.time.elapsedMS;
	}

	if (game.currentActivePanel != null && game.currentActivePanel != shopServerPanel) {
		game.currentActivePanel.setToNode(game.currentActivePanel.node);
	}

	statusPanel.updateCredit(currentCredit);
}

function pause() {
	if (!paused) {
		paused = true;
		game.time.gamePaused();
		packets.forEach(function(item) {item.tween.pause();})
		foreverTimers.forEach(function(item) {item.resume();})
	} else {
		paused = false;
		game.time.gameResumed();
		packets.forEach(function(item) {item.tween.resume();})
		release.forEach(function(item) {item.releaseWaitingPool();})
		release = [];
	}
}
function updateCamera() {
	if (game.input.activePointer.isDown) {
		if (game.origDragPoint) {
			gameGroup.x -= game.origDragPoint.x - game.input.activePointer.position.x;
			gameGroup.y -= game.origDragPoint.y - game.input.activePointer.position.y;
		}
		game.origDragPoint = game.input.activePointer.position.clone();
	} else {
		game.origDragPoint = null;
	}
}

function moveToCity() {
	var i = network.nodes.indexOf(currentCity);
	while (!(network.nodes[(i+1)%(network.nodes.length)] instanceof City)) {
		i = (i+1)%(network.nodes.length)
	}
	currentCity = network.nodes[(i+1)%(network.nodes.length)];

	gameGroup.x -= gameGroup.worldPosition.x + currentCity.sprite.x * gameGroup.worldScale.x - game.width / 2;
	gameGroup.y -= gameGroup.worldPosition.y + currentCity.sprite.y * gameGroup.worldScale.y - game.height/2;
}

function render() {
	game.debug.pointer(game.input.activePointer);
}

function generalClickCheck() {
	if (game.input.activePointer.isDown) {
		if (game.currentActivePanel == null) {
			game.clicked = true;
		} else if (!game.buttonPress && !game.nodeClicked && !game.cableMode) {
			game.currentActivePanel.visible = false;
			game.currentActivePanel = null;
			shopServerPanel.nowUp = true;
			game.cableMode = false;
		}
		if (game.cableMode) {game.clicked = true;};
		if (game.input.activePointer.duration > 200) {
			game.clicked = false;
			shopServerPanel.nowUp = false;
		}
	}

	if (game.input.activePointer.isUp) {
		if (game.clicked && !game.buttonPress) {
			if (!game.cableMode) {
				shopServerPanel.nowUp = !shopServerPanel.nowUp;
				shopServerPanel.setToNode(null);
			} else {
				game.cableMode = false;
				game.currentActivePanel.visible = false;
				game.currentActivePanel = null;
			}
			shopCablePanel.visible = false;
		}
		game.buttonPress = false;
		game.clicked = false;
		game.nodeclicked = null;
	}
}
