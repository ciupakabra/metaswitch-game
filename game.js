var config = {
	renderer: Phaser.AUTO,
	width: 900,
	height: 600,
}

var bootConfig = {
	preload: function() {
		game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
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

var BGCOL = 0x111111;

var SHOP_WIDTH = 200;

var game = new Phaser.Game(config);
game.state.add('boot', bootConfig);
game.state.add('game', playConfig);

game.state.start('boot');
var cursors;
var mode = 'cable';
var scale = 40; // Global scale for how far apart the textures are
var speed = 30; // How long before network update (60/speed updates per second)
var time = 0;
var worldScale = 1;
var gameGroup;

var nodes;
var packets;
var cables;

var slickUI;
var graphicsManager;
var worldGenerator;

var fontsReady = false;

// Game vars
var currentCredit = 2000;
var currentPenalty = 0;
var packetCount = 0;
var deadPackets = [];
for (var i = 0;i < RESOURCE_COLORS.length;++i) {
	deadPackets[i] = 0;
}


WebFontConfig = {
	active: function() {game.state.start('game');},
	inactive: function() {game.state.start('game');},
	google: {
		families: ['Lato'],
	}
};


function preload() {
	this.load.image('server', 'assets/server.png');
	this.load.image('resource', 'assets/resource.png');
	this.load.image('city', 'assets/city.png');
	cursors = game.input.keyboard.createCursorKeys();

	// Leave this at the bottom of the method
	slickUI = game.plugins.add(Phaser.Plugin.SlickUI);
	slickUI.load('assets/ui/kenney/kenney.json');
}

// Panel constants
var STATUS_PANEL_WIDTH = 200;
var STATUS_PANEL_HEIGHT = 100;

var SHOP_PANEL_WIDTH = STATUS_PANEL_WIDTH;

var NODE_INFO_WIDTH = 200;
var NODE_INFO_HEIGHT = 165;

var BUY_SERVER_WIDTH = 200;
var BUY_SERVER_HEIGHT = 185;

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

	nodeCityPanel = new NodeCityPanel(0, 0, NODE_INFO_WIDTH, NODE_INFO_HEIGHT);
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
	worldGenerator = new WorldGenerator();
	graphicsManager = new GraphicsManager();
	gameGroup = game.add.group();

	cables = game.add.group();
	packets = game.add.group();
	nodes = game.add.group();
	satisfactionBar = game.add.group();

	gameGroup.add(cables);
	gameGroup.add(packets);
	gameGroup.add(nodes);

	gameGroup.position.setTo(game.world.centerX, game.world.centerY);
	game.input.mouse.capture = true;

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
			if (worldScale != 2) {
				gameGroup.x += cursorx * 0.05;
				gameGroup.y += cursory * 0.05;
			}
			worldScale += 0.05;

		}
		worldScale = Phaser.Math.clamp(worldScale, 0.25, 2);
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

	createPanels();
	graphicsManager.satisfactionBarInit();
}

function update() {
	updateCamera();

	generalClickCheck();

	if (game.currentActivePanel != null && game.currentActivePanel != shopServerPanel) {
		game.currentActivePanel.setToNode(game.currentActivePanel.node);
	}
	// Bug this.edges[destination_idx] is undefined when no cables
	statusPanel.updateCredit(currentCredit);
	// statusPanel.updatePenalty(currentPenalty);
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

function render() {
	//game.debug.pointer(game.input.activePointer);
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
