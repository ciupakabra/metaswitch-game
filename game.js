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

var SHOP_WIDTH = 200;

var game = new Phaser.Game(config);
var cursors;
var mode = 'cable';
var scale = 40; // Global scale for how far apart the textures are
var speed = 30; // How long before network update (60/speed updates per second)
var time = 0;
var worldScale = 1;
var gameGroup;
var slickUI;
var graphicsManager;

// Game vars
var currentCredit = 500;
var currentPenalty = 0;

function preload() {
	this.load.image('server', 'assets/server_new.png');
	this.load.image('resource', 'assets/resource_new.png');
	this.load.image('city', 'assets/city_new.png');
	this.load.image('packet', 'assets/packet.png');
	cursors = game.input.keyboard.createCursorKeys();
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
	graphicsManager = new GraphicsManager();
	// Element groups
	uiGroup = game.add.group();
	gameGroup = game.add.group();

	function mouseWheel(event) {
		if (game.input.mouse.wheelDelta == -1) {
			worldScale -= 0.05;
		} else {
			worldScale += 0.05;
		}
		worldScale = Phaser.Math.clamp(worldScale, 0.25, 2);
		gameGroup.scale.set(worldScale);
	}

	game.input.mouse.mouseWheelCallback = mouseWheel;
	game.stage.backgroundColor = '#9BC53D';

	createPanels();

	game.world.setBounds(-1000,-1000,2000,2000);
	game.camera.x = -400;
	game.camera.y = -300;

	game.input.mouse.capture = true;

	network = new Network();

	resource_unit1 = new ResourceUnit(1, 10, 15, RESOURCE_COLORS[0]);
	resource_unit2 = new ResourceUnit(2, 10, 15, RESOURCE_COLORS[1]);
	resource_unit3 = new ResourceUnit(3, 10, 15, RESOURCE_COLORS[2]);

	resource1 = new Resource(network, 0 * scale, 0 * scale, resource_unit1);
	resource2 = new Resource(network, 5 * scale, 5 * scale, resource_unit2);
	resource3 = new Resource(network, 2 * scale, 3 * scale, resource_unit3);

	network.add_node(resource1);
	network.add_node(resource2);
	network.add_node(resource3);

	function make_probs(ps) {
		var ret = [];
		for (var i = 0;i < ps.length;++i) {
			ret.push({
				"prob": ps[i][0],
				"resource_unit": ps[i][1],
			});
		}
		return ret;
	}

	distro_1 = make_probs([
		[0.2, resource_unit1],
		[0.3, resource_unit2],
		[0.5, resource_unit3],
	]);

	distro_2 = make_probs([
		[0.3, resource_unit1],
		[0.3, resource_unit2],
		[0.4, resource_unit3],
	]);

	distro_3 = make_probs([
		[0.3, resource_unit2],
		[0.7, resource_unit3],
	]);

	city1 = new City(network, 5 * scale, -7 * scale, 0.5, distro_1);
	city2 = new City(network, -4 * scale, 0 * scale, 0.25, distro_2);
	city3 = new City(network, 0 * scale, 10 * scale, 0.6, distro_3);

	network.add_node(city1);
	network.add_node(city2);
	network.add_node(city3);

	server1 = new Server(network, 0 * scale, 5 * scale, 3, 3, 3, game);
	server2 = new Server(network, 3 * scale, 0 * scale, 3, 3, 3, game);

	network.add_node(server1);
	network.add_node(server2);

	cable1_c2 = new Cable(network, server1, city2, 0.5, 60);
	cable1_c3 = new Cable(network, server1, city3, 0.5, 60);
	cable1_r1 = new Cable(network, server1, resource1, 0.5, 60);
	cable1_r2 = new Cable(network, server1, resource2, 0.5, 60);
	cable1_r3 = new Cable(network, server1, resource3, 0.5, 60);

	network.add_cable(cable1_c2);
	network.add_cable(cable1_c3);
	network.add_cable(cable1_r1);
	network.add_cable(cable1_r2);
	network.add_cable(cable1_r3);

	cable2_c1 = new Cable(network, server2, city1, 0.5, 40);
	cable2_r1 = new Cable(network, server2, resource1, 0.5, 40);
	cable2_r2 = new Cable(network, server2, resource2, 0.5, 40);
	cable2_r3 = new Cable(network, server2, resource3, 0.5, 40);

	network.add_cable(cable2_c1);
	network.add_cable(cable2_r1);
	network.add_cable(cable2_r2);
	network.add_cable(cable2_r3);
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
	game.debug.pointer(game.input.activePointer);
}
