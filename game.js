var config = {
	renderer: Phaser.AUTO,
	width: window.innerWidth * window.devicePixelRatio,
	height: window.innerHeight * window.devicePixelRatio,
	state: {
		preload: preload,
		create: create,
		update: update,
		render: render,
	}
};

// Colors
var RESOURCE_COLORS = [
	0xED1C24,
	0xFDFFFC,
	0x235789,
]

var BGCOL = 0x111111;

var SHOP_WIDTH = 200;

var game = new Phaser.Game(config);
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
var currentCredit = 500;
var currentPenalty = 0;
var packetCount = 0;
var deadPackets = [];

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

var PANEL_WIDTH = 200;
var PANEL_MARGIN = 8;
var PANEL_PADDING = 5;
var PANEL_LINE_DIST = 10;

var statusPanel;
var nodeInfoPanel;
var shopPanel;

function createPanels() {
	statusPanel = new StatusPanel(PANEL_MARGIN, PANEL_MARGIN, STATUS_PANEL_WIDTH, STATUS_PANEL_HEIGHT);
	var shopPanelY = statusPanel.panel.y + STATUS_PANEL_HEIGHT + PANEL_MARGIN;
	var shopPanelHeight = game.height - shopPanelY - PANEL_PADDING;

	shopPanel = new ShopPanel(PANEL_MARGIN, shopPanelY, SHOP_PANEL_WIDTH, shopPanelHeight);
	nodeInfoPanel = new NodeInfoPanel(0, 0, NODE_INFO_WIDTH, NODE_INFO_HEIGHT);
	nodeInfoPanel.visible = false;
}

function create() {
	worldGenerator = new WorldGenerator();
	graphicsManager = new GraphicsManager();
	gameGroup = game.add.group();

	cables = game.add.group();
	packets = game.add.group();
	nodes = game.add.group();

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

	createPanels();

	network = new Network();

	worldGenerator.initGameWorld();
}

function update() {
	updateCamera();

	// Bug this.edges[destination_idx] is undefined when no cables
	statusPanel.updateCredit(currentCredit);
	statusPanel.updatePenalty(currentPenalty);
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
