var config = {
	renderer: Phaser.AUTO,
	width: 900,
	height: 600,
	parent: "game",
}

var bootConfig = {
	preload: function() {
		game.load.spritesheet('button', 'assets/ui/menu/buttons.png', 600, 150);
		game.load.spritesheet('buttonSmall', 'assets/ui/menu/buttonsSmall.png', 250, 125);
		game.load.spritesheet('buttonPause', 'assets/ui/menu/buttonsPause.png', 35, 35);
		game.load.spritesheet('buttonReload', 'assets/ui/menu/buttonsReload.png',35,35);
		game.load.spritesheet('buttonSpeed', 'assets/ui/menu/buttonsSpeed.png',35,35);
		game.load.image('aboutUs', 'assets/ui/menu/aboutUs.png');
		game.load.image('logo', 'assets/ui/menu/metaswitch-logo.png');
		game.load.image('arrow', 'assets/ui/menu/arrow.png');

		this.load.image('server', 'assets/server.png');
		this.load.image('resource', 'assets/resource.png');
		this.load.image('city', 'assets/city.png');

		game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
		slickUI = game.plugins.add(Phaser.Plugin.SlickUI);
		game.add.plugin(PhaserInput.Plugin);

		this.game.scale.pageAlignHorizontally = true;
		this.game.scale.pageAlignVertically = true;
		this.game.scale.refresh();
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
		createButton(150, 218, "Tutorial", function() {tutorialOn = true; tutorialScreen = 0; game.state.start('tutorial')});
		createButton(150, 402, "About Us", function() {game.state.start('about')});

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

var submitConfig = {
	create: function() {
		var header = game.add.text(450, 40, header);
		header.font = 'Lato';
		header.anchor.setTo(0.5);
		header.fontSize = 40;
		header.text = "Thank You for Playing Net-a-switch, powered by"
		header.fill = '#ffffff';

		var image = game.add.image(450, 100, 'logo');
		image.anchor.setTo(0.5);
		image.scale.setTo(0.5);

		var mainText = game.add.text(450, 230, mainText);
		mainText.font = 'Lato';
		mainText.anchor.setTo(0.5);
		mainText.fontSize = 25;
		mainText.text = "Metaswitch is a UK-based tech company that designs, develops, manufactures, and markets telecommunications software. Congratulations on your score! If you liked this game, we think you could be a good fit for a career at Metaswitch. Please check out our career page and submit your details below to keep in touch."
		mainText.fill = '#ffffff';
		mainText.wordWrap = true;
		mainText.wordWrapWidth = 800;
		mainText.align = 'center';

		var first_input = game.add.inputField(80, 330, {
			font: '30px Lato',
			fill: '#ffffff',
			width: 355,
			height: 40,
			placeHolder: 'First Name...',
			padding: 10,
			borderColor: '#505050',
			backgroundColor: '#111111',
			cursorColor: '#505050',
			borderRadius: 5,
			placeHolderColor: '#505050',
		});

		var last_input = game.add.inputField(465, 330, {
			font: '30px Lato',
			fill: '#ffffff',
			width: 355,
			height: 40,
			placeHolder: 'Last Name...',
			padding: 10,
			borderColor: '#505050',
			backgroundColor: '#111111',
			cursorColor: '#505050',
			borderRadius: 5,
			placeHolderColor: '#505050',
		});

		var email_input = game.add.inputField(80, 400, {
			font: '30px Lato',
			fill: '#ffffff',
			width: 740,
			height: 40,
			placeHolder: 'Enter your email address...',
			padding: 10,
			borderColor: '#505050',
			backgroundColor: '#111111',
			cursorColor: '#505050',
			borderRadius: 5,
			placeHolderColor: '#505050',
		});




		function createButton(x, y, text, funct) {
			button = game.add.button(x, y, 'button', function() {}, this, 1, 0, 1, 0);
			button.onInputDown.add(funct, this);
			text = game.add.text(x + 90, y + 30, text);
			text.font = 'Lato';
			text.anchor.setTo(0.5);
			text.fontSize = 40;
			return button;
		}

		button1 = createButton(100, 475, "Submit", function() {

			var details = {'first': first_input.text._text, 'last': last_input.text._text, 'email': email_input.text._text, 'score':lifetimeCredit, 'elapsed': totalTime};

		$.ajax({
			url: "submit",
			type: 'POST',
			data: JSON.stringify(details),
			success: function() {
				game.state.start('menu');
				alert("Your score has successfully been submitted to Metaswitch."); //alerts the user that game is over
			}
	 });
 });
		button2 = createButton(375, 475, "Clear", function() {game.state.start('submit')});
		button3 = createButton(650, 475, "Menu", function() {game.state.start('menu')});

		button1.scale.setTo(0.3, 0.5);
		button2.scale.setTo(0.3, 0.5);
		button3.scale.setTo(0.3, 0.5);

		this.cKey = game.input.keyboard.addKey(Phaser.Keyboard.C);
		this.cKey.onDown.add(function() {first_input.setText(""); last_input.setText(""); email_input.setText("")}, this)

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
	0x00ffa1,
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
			foreverTimers.forEach(function(item) {item.resume();})
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
game.state.add('submit', submitConfig);

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

var tutorialOn = false;
var tutorialScreen = 0;
var currentCredit = 2000;
var lifetimeCredit = 0;
var currentPenalty = 0;
var maxPenalty = 500;
var packetCount = 0;
var deadPackets = [];
var paused = false;
var release = [];
var timers = [];
var speed = 1;
var totalTime = 0;
var currentCity = null;
for (var i = 0;i < RESOURCE_COLORS.length;++i) {
	deadPackets[i] = 0;
}
var foreverTimers = [];
var cursors;
//var submitCheck = false;

function initialisation() {
	currentCredit = 2000;
	currentPenalty = 0;
	packetCount = 0;
	lifetimeCredit = 0;
	deadPackets = [];
	release = [];
	totalTime = 0;
	timers = [];
	paused = false;
	foreverTimers = [];
	speed = 1;
	currentCity = null;
	tutorialOn = false;
	for (var i = 0;i < RESOURCE_COLORS.length;++i) {
		deadPackets[i] = 0;
	}
	worldScale = 0.5;
	//submitCheck = false;
}
WebFontConfig = {
	active: function() {game.time.events.add(250, function() {game.state.start('menu', menuConfig)}, this)},
	inactive: function() {game.state.start('menu', menuConfig);},
	google: {
		families: ['Lato'],
	}
};


function preload() {
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
	buttonPause.visible = false;
	buttonPlay = game.add.button(game.width - 40, 8, 'buttonPause', function() {}, this, 3, 2, 3, 2);
	buttonPlay.onInputDown.add(function() {pause(); game.buttonPress = true; buttonPause.visible = true; buttonPlay.visible = false;}, this);
	buttonSpeed1 = game.add.button(game.width - 40, 47, 'buttonSpeed', function() {}, this, 1, 0, 1, 0);
	buttonSpeed1.onInputDown.add(function() {changeSpeed(2); game.buttonPress = true; buttonSpeed1.visible = false, buttonSpeed2.visible = true;})
	buttonSpeed2 = game.add.button(game.width - 40, 47, 'buttonSpeed', function() {}, this, 3, 2, 3, 2);
	buttonSpeed2.onInputDown.add(function() {changeSpeed(4); game.buttonPress = true; buttonSpeed2.visible = false, buttonSpeed4.visible = true;})
	buttonSpeed2.visible = false;
	buttonSpeed4 = game.add.button(game.width - 40, 47, 'buttonSpeed', function() {}, this, 5, 4, 5, 4);
	buttonSpeed4.onInputDown.add(function() {changeSpeed(1); game.buttonPress = true; buttonSpeed4.visible = false, buttonSpeed1.visible = true;})
	buttonSpeed4.visible = false;
	buttonReload = game.add.button(game.width - 40, 86, 'buttonReload', function() {}, this, 1,0,1,0);
	buttonReload.onInputDown.add(function() {game.state.start('menu')});

	graphicsManager = new GraphicsManager();
	worldGenerator = new WorldGenerator();
	gameGroup = game.add.group();

	cables = game.add.group();
	tmpcables = game.add.group();
	packets = game.add.group();
	nodes = game.add.group();
	ui = game.add.group();

	ui.add(buttonPause);
	ui.add(buttonPlay);
	ui.add(buttonReload);
	ui.add(buttonSpeed1);
	ui.add(buttonSpeed2);
	ui.add(buttonSpeed4);

	gameGroup.add(cables);
	gameGroup.add(packets);
	gameGroup.add(nodes);

	gameGroup.position.setTo(game.world.centerX, game.world.centerY);
	game.input.mouse.capture = true;

/*comment this out once submit debugging is complete
	this.oKey = game.input.keyboard.addKey(Phaser.Keyboard.O);
	this.oKey.onDown.add(function() {game.state.start('submit')}, this);

//stop commenting out by here.*/
	this.tabKey = game.input.keyboard.addKey(Phaser.Keyboard.TAB);
	this.tabKey.onDown.add(moveToCity, this);

	this.plusKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);
	this.minusKey = game.input.keyboard.addKey(Phaser.Keyboard.E);
	this.plusKey.onDown.add(function() {if(worldScale > 0.25){worldScale -= 0.05;gameGroup.scale.set(worldScale);}}, this);
	this.minusKey.onDown.add(function() {if(worldScale < 1){worldScale += 0.05;	gameGroup.scale.set(worldScale);}}, this);

  this.wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
	this.aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
	this.dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

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

	game.cableDrag = false;
	game.dragCable = null;
  game.nodeCurrentOver = null; //note currently being hovered over.

	network = new Network();
	graphicsManager.network = network;
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

	pause();
}

function update() {
	updateCamera();

	if (cursors.up.isDown || this.wKey.isDown) {
    gameGroup.y += 8;
  }
  else if (cursors.down.isDown || this.sKey.isDown) {
    gameGroup.y -= 8;
  }

	if (cursors.left.isDown || this.aKey.isDown) {
    gameGroup.x += 8;
  } else if (cursors.right.isDown || this.dKey.isDown) {
    gameGroup.x -= 8;
  }

	generalClickCheck();

	if (game.cableDrag) {
		game.dragCable.clear();
		game.dragCable.alpha = 1;
		game.dragCable.lineStyle(2,0xffffff,1);
		game.dragCable.moveTo(game.nodeclicked.x, game.nodeclicked.y);
		if (game.nodeCurrentOver != null) {
			game.dragCable.lineTo(game.nodeCurrentOver.x, game.nodeCurrentOver.y);
		} else {
			var x = (game.input.activePointer.position.x - gameGroup.x)/worldScale
			var y = (game.input.activePointer.position.y - gameGroup.y)/worldScale
			game.dragCable.lineTo(x, y);
		}

	} else {
		game.dragCable = null;
	}

	if (!paused) {
		totalTime += game.time.elapsedMS * speed;
		while ((timers.length > 0) && (timers[0].check())) {
			removeTopTimer();
		}
	}

	if (game.currentActivePanel != null && game.currentActivePanel != shopServerPanel) {
		game.currentActivePanel.setToNode(game.currentActivePanel.node);
	}

	statusPanel.updateCredit(currentCredit);

	var thresholdScore = 20000;
	var submitCheck = false;
	//var redirect;
	if (currentPenalty>=maxPenalty){
		//the game ends once the user has exceeded the maximum penalty
		if (true || lifetimeCredit>=thresholdScore){
			//submitCheck = true;
			//if their score is good enough for Metaswitch to be interested,
			//they are prompted to submit their contact info
			if (confirm("Game over!" + "\n" + "Would you like to submit your score?")) {
				//redirect = 1;
				game.state.start('submit');
			}
			else{
				game.state.start('menu');
			}
		}
		else {
			alert("Game over!" + "\n" + "You have let too many packets die!" + "\n" + "Now returning to main menu."); //alerts the user that game is over
			game.state.start('menu');
			//window.location.reload();
		}
	}
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
		if (game.origDragPoint && !game.cableDrag) {
			var xChange = game.origDragPoint.x - game.input.activePointer.position.x;
			var yChange = game.origDragPoint.y - game.input.activePointer.position.y;
			if (Math.abs(xChange) + Math.abs(yChange) > 2) {
				game.drag = true;
			}
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
	// game.debug.pointer(game.input.activePointer);
}

function generalClickCheck() {
	if (game.input.activePointer.isDown) {
		if (game.currentActivePanel == null) {
			game.clicked = true;
		} else if (!game.buttonPress && !game.cableMode) {
			game.currentActivePanel.visible = false;
			game.currentActivePanel = null;
			shopServerPanel.nowUp = true;
			game.cableMode = false;
		}
		if (game.nodeClicked && !game.cableDrag && (game.currentActivePanel == null) && (game.nodeCurrentOver != null)) {
			game.cableDrag = true;
			game.dragCable = game.add.graphics();
    	game.dragCable.lineStyle(2,0xffffff,1);
			game.dragCable.moveTo(game.nodeclicked.x, game.nodeclicked.y);
			game.dragCable.lineTo(game.nodeCurrentOver.x, game.nodeCurrentOver.y);
			cables.add(game.dragCable);
		}
		if (game.cableMode) {game.clicked = true;};
		if (game.input.activePointer.duration > 200) {
			game.clicked = false;
			shopServerPanel.nowUp = false;
		}
	}

	if (game.input.activePointer.isUp) {
		if (game.cableDrag) {
			game.dragCable.clear();
			cables.remove(game.dragCable);
			game.dragCable = null;
			if (game.nodeCurrentOver != null) {
				var cable = network.get_adjacent_cable(game.nodeclicked, game.nodeCurrentOver);
				if ((network.can_connect(game.nodeclicked, game.nodeCurrentOver)) || cable != null) {
					var dist = game.nodeclicked.dist(game.nodeCurrentOver);
			    var baseCost = Math.floor((dist/4 + (dist*dist)/5000)/1.5) + 50;
					var cost = -1;
					if (cable != null) {
						cost = Math.floor(baseCost * (cable.level)*(1 + cable.level/3));
					}
					if ((baseCost <= currentCredit) && (cable == null)) {
						cable = new Cable(
		  				network,
		  				game.nodeclicked,
		  				game.nodeCurrentOver,
		  				NEW_CABLE_LAMBDA,
		  				NEW_CABLE_V,
		          1
		  			);
						currentCredit -= baseCost;
						network.add_cable(cable);
					} else if ((cost <= currentCredit) && (cable != null)) {
						currentCredit -= cost;

		        cable.lambda -= 0.15;
		        cable.level += 1;
		        var level = cable.level;
		        cable.v += 50 + (4 * Math.pow(Math.floor(level/2),2));
		        network.update_distances();

		        if (level <= 6) {
		          cable.graphics.tint = CABLE_COLORS[level - 1];
		        } else if (level == 7) {
		          var timer = game.time.create(false);
		          foreverTimers.push(timer);
		          cable.timer = timer.loop(100, updateCable, cable, cable);
		          cable.version = 2;
		          function updateCable(item) {
		            item.version += 1;
		            if (item.version == CABLE_COLORS.length) {
		              item.version = 2;
		            }
		            item.graphics.tint = CABLE_COLORS[cable.version];
		          }
		          timer.start();
		        } else {
		          cable.timer.delay = (100/(level - 6));
		        }
					}
				}
			}
			game.cableDrag = false;
		}

		if (game.clicked && !game.buttonPress) {
			if ((game.nodeclicked != null) && (game.nodeclicked == game.nodeCurrentOver) && !game.cableMode) {
				game.buttonPress = true;
				if (game.nodeclicked.type == "server") {
					nodeInfoServerPanel.setToNode(game.nodeclicked);
				} else if (game.nodeclicked.type == "resource"){
					nodeResourcePanel.setToNode(game.nodeclicked);
			  } else {
					nodeCityPanel.setToNode(game.nodeclicked);
				}
		  } else if (!game.cableMode) {
				if (!game.drag) {
					shopServerPanel.nowUp = !shopServerPanel.nowUp;
					shopServerPanel.setToNode(null);
				}
			} else if (game.currentActivePanel != null){
				game.cableMode = false;
				game.currentActivePanel.visible = false;
				game.currentActivePanel = null;
			}
			shopCablePanel.visible = false;
		}
		game.drag = false;
		game.buttonPress = false;
		game.clicked = false;
		game.nodeclicked = null;
		game.nodeClicked = false;
	}
}

function formatTime(millis) { //milliseconds -> MM:SS.XYZ
	var end = String(millis % 1000);
	if(end.length < 3) {end = "0".repeat(3-end.length)+end;}
	var secs = String(Math.floor(millis/1000) % 60);
	if (secs.length === 1) {secs = "0" + secs;}
	var mins = String(Math.floor(millis/60000));
	return mins + ":" + secs + "." + end;
}

function changeSpeed(amount) {
	speed = amount;
	packets.forEach(function(item) {item.tween.timeScale = speed;})
}
