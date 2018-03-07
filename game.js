/*var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload ()
{
}

function create ()
{
}

function update ()
{
}*/

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

server1 = new Server(network, 0, 5, 3, 3, 3);
server2 = new Server(network, 3, 0, 3, 3, 3);

network.add_node(server1);
network.add_node(server2);
//server1 cables
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
