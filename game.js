var config = {
    renderer: Phaser.AUTO,
    width: 800,
    height: 600,
    state: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var cursors;
var mode = 'cable';
var connect = null;


function preload () {
	this.load.image('server', 'assets/server.png');
	this.load.image('resource', 'assets/resource.png');
	this.load.image('city', 'assets/city.png');
  cursors = game.input.keyboard.createCursorKeys();
}

function create () {
	this.stage.backgroundColor = '#2d2d2d';

	// Makes 0,0 the center of the screen
	this.world.setBounds(-1000,-1000,2000,2000);
	this.camera.x = -400;
	this.camera.y = -300;

	game.input.mouse.capture = true;

	network = new Network();

	resource_unit1 = new ResourceUnit(1, 10, 100);
	resource_unit2 = new ResourceUnit(2, 10, 100);
	resource_unit3 = new ResourceUnit(3, 10, 100);

	resource1 = new Resource(network, 0, 0, resource_unit1);
	resource2 = new Resource(network, 5, 5, resource_unit2);
	resource3 = new Resource(network, 2, 3, resource_unit3);

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
	city1 = new City(network, 5, -7, 4, distro_1);
	city2 = new City(network, -4, 0, 4, distro_2);
	city3 = new City(network, 0, 10, 4, distro_3);

	network.add_node(city1);
	network.add_node(city2);
	network.add_node(city3);

	server1 = new Server(network, 0, 5, 3, 3, 3, game);
	server2 = new Server(network, 3, 0, 3, 3, 3, game);

	network.add_node(server1);
	network.add_node(server2);
	//server1 cables
	/*
	cable1_c2 = new Cable(network, server1, city2, 3, 1);
	cable1_c3 = new Cable(network, server1, city3, 3, 1);
	cable1_r1 = new Cable(network, server1, resource1, 3, 1);
	cable1_r2 = new Cable(network, server1, resource2, 3, 1);
	cable1_r3 = new Cable(network, server1, resource3, 3, 1);

	network.add_cable(cable1_c2);
	network.add_cable(cable1_c3);
	network.add_cable(cable1_r1);
	network.add_cable(cable1_r2);
	network.add_cable(cable1_r3);
	//server1 cables

	cable2_c1 = new Cable(network, server2, city1, 3, 1);
	cable2_r1 = new Cable(network, server2, resource1, 3, 1);
	cable2_r2 = new Cable(network, server2, resource2, 3, 1);
	cable2_r3 = new Cable(network, server2, resource3, 3, 1);

	network.add_cable(cable2_c1);
	network.add_cable(cable2_r1);
	network.add_cable(cable2_r2);
	network.add_cable(cable2_r3);

	/*
	network = new Network();
	server1 = new Server(network, 0, 5, 3, 3, 3);
	server2 = new Server(network, 3, 0, 3, 3, 3);
	network.add_node(server1);
	network.add_node(server2);
	*/

}

function update () {
		moveCamera();

		// Bug this.edges[destination_idx] is undefined when no cables
		/*
		network.update();
		*/
}

function moveCamera() {
	if (cursors.up.isDown)
    {
        game.camera.y -= 8;
    }
    else if (cursors.down.isDown)
    {
        game.camera.y += 8;
    }

    if (cursors.left.isDown)
    {
        game.camera.x -= 8;
    }
    else if (cursors.right.isDown)
    {
        game.camera.x += 8;
    }
}
function spriteInit(item) {
	if (item instanceof Node) {
		node = item;
	if (node instanceof Server) {
		node.sprite = game.add.sprite(node.x*40, node.y*40, 'server');
	}
	if (node instanceof City) {
		node.sprite = game.add.sprite(node.x*40, node.y*40, 'city');
	}
	if (node instanceof Resource) {
		node.sprite = game.add.sprite(node.x*40, node.y*40, 'resource');
	}
	node.sprite.inputEnabled = true;
	node.sprite.events.onInputDown.add(listener);
	node.sprite.node = node;
	node.sprite.anchor.set(0.5, 0.5);
  }
	if (item instanceof Cable) {
		cable = item;
		cable.line = new Phaser.Line(cable.node_1.x*40,cable.node_1.y*40,cable.node_2.x*40,cable.node_2.y*40);
		cable.graphics = game.add.graphics();
		cable.graphics.lineStyle(10, 0xffd900, 1);
		cable.graphics.moveTo(cable.line.start.x,cable.line.start.y);
		cable.graphics.lineTo(cable.line.end.x,cable.line.end.y);
		cable.graphics.endFill();
		cable.node_1.sprite.bringToTop();
		cable.node_2.sprite.bringToTop();
	}
}

function listener(sprite) {
		if (connect == null) {
			connect = sprite;
			sprite.tint = 0x00ff00;
			console.log("Hmm");
		} else {
			if (connect == sprite) {
				console.log("Denied");
			} else {
				cable = new Cable(network, connect.node, sprite.node, 3, 1);
				if (network.add_cable(cable)) {
					console.log("Cable added");
				} else {
					cable.graphics.destroy();
					console.log("Cable cannot be added");
				}
			}
			connect.tint = 0xffffff;
			connect = null;
		}
}
