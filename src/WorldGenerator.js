var INITIAL_BOUNDS_RADIUS = 700;
var INITIAL_MIN_DIST = 220;
var MINIMAL_MIN_DIST = 170;
var FIXED_CITY_LAMBDA = 0.8;

class WorldGenerator {
	constructor() {
		this.minDist = INITIAL_MIN_DIST;
		this.boundsRadius = INITIAL_BOUNDS_RADIUS;
		this.types = [];
		this.hasResource = [];
		this.activeTypesCount = 3;
		this.citySpeed = 1.5;
	}

	inCircle(center, radius, p) {
		return Math.pow(center[0] - p[0], 2) + Math.pow(center[1] - p[1], 2) <= Math.pow(radius, 2);
	}

	canPlace(p) {
		if (!this.inCircle([0, 0], this.boundsRadius, p))
			return false;

		for (var i = 0;i < network.nodes.length;++i) {
			var c = [network.nodes[i].x, network.nodes[i].y];
			if (this.inCircle(c, this.minDist, p))
				return false;
		}

		return true;
	}

	generateResources(number, types) {
		var generated = 0;

		while (generated < number) {
			var x, y;
			x = 2 * Math.random() - 1
			y = 2 * Math.random() - 1;

			x *= this.boundsRadius;
			y *= this.boundsRadius;

			if (this.canPlace([x, y])) {
				var typeNo = Math.floor(Math.random() * types.length)
				var type = types[typeNo];
				this.hasResource[typeNo] = true;
				new Resource(network, x, y, type);
				generated++;
			}
		}

		for (i = 0; i < this.activeTypesCount; i++) {
			while (!this.hasResource[i]) {
				var x, y;
				x = 2 * Math.random() - 1
				y = 2 * Math.random() - 1;

				x *= this.boundsRadius;
				y *= this.boundsRadius;

				if (this.canPlace([x, y])) {
					var type = types[i];
					this.hasResource[i] = true;
					new Resource(network, x, y, type);
				}
			}
		}
	}

	generateCityDistribution(types) {
		var x = [];

		for (var i = 0;i < types.length - 1;++i) {
			x.push(Math.floor(Math.random() * 11));
		}

		// Javascript sort numbers in alphabetical order by default
		x.sort(function(a, b){return a-b});

		var last = 0;

		var distribution = [];

		for (var i = 0;i < x.length;++i) {
			distribution.push({
				"prob": (x[i] - last) / 10,
				"resource_unit": types[i],
			});

			last = x[i];
		}

		distribution.push({
			"prob": (10 - last) / 10,
			"resource_unit": types[types.length - 1]
		});

		//console.log(distribution);

		return distribution;
	}

	generateCities(number, types) {
		var generated = 0;

		while (generated < number) {
			var x, y;
			x = 2 * Math.random() - 1
			y = 2 * Math.random() - 1;

			x *= this.boundsRadius;
			y *= this.boundsRadius;

			if (this.canPlace([x, y])) {
				var distribution = this.generateCityDistribution(types);

				var newCity = new City(network, x, y, FIXED_CITY_LAMBDA, distribution);

				generated++;
			}
		}
	}

	newRadiusTween(inc) {
		var newInc = Math.min(0.8 * inc, 0.32 * INITIAL_BOUNDS_RADIUS);
		var tween = game.add.tween(this).to(
			{ boundsRadius: "+" + newInc.toString() },
			Phaser.Timer.MINUTE * 5,
			Phaser.Easing.Linear.NONE,
			true
		);

		tween.onComplete.add(function(d1, d2, inc) {
			this.newRadiusTween(inc);
		}, this, 0, newInc);
	}

	newMinDistTween() {
		var newDist = Math.max(MINIMAL_MIN_DIST, 0.985 * this.minDist);

		var tween = game.add.tween(this).to(
			{ minDist: newDist },
			Phaser.Timer.MINUTE,
			Phaser.Easing.Linear.NONE,
			true
		);

		tween.onComplete.add(this.newMinDistTween, this);
	}

	newResourceUnitTimer() {
		this.activeTypesCount++;
		if (this.activeTypesCount == this.types.length)
			return;
		new MyTimer(Phaser.Timer.MINUTE * 3, this.newResourceUnitTimer, this);
	}

	newResourcesTimer() {
		var currTypes = this.types.slice(0, this.activeTypesCount);
		this.generateResources(1, currTypes);

		new MyTimer(Phaser.Timer.MINUTE * 7/12, this.newResourcesTimer, this);
	}

	newCitiesTimer() {
		var currTypes = this.types.slice(0, this.activeTypesCount);
		this.generateCities(1, currTypes);
		graphicsManager.newCityText();
		this.citySpeed = Math.max((this.citySpeed - 0.25), 1);

		//game.time.events.add(Phaser.Timer.SECOND * 0.5, this.newCitiesTimer, this);
		new MyTimer(Phaser.Timer.MINUTE * this.citySpeed, this.newCitiesTimer, this);
	}

	initGameWorld() {
		for (var i = 0;i < RESOURCE_COLORS.length;++i) {
			this.types.push(new ResourceUnit(i, 10 + Math.max(2 * Math.ceil((i-2)/2),0), 30, RESOURCE_COLORS[i]));
			this.hasResource.push(false);
		}

		// Generate resources
		var currTypes = this.types.slice(0, this.activeTypesCount);

		this.generateResources(7, currTypes);
		this.generateCities(3, currTypes);

		this.newRadiusTween(INITIAL_BOUNDS_RADIUS * 0.5);
		this.newMinDistTween();

		new MyTimer(Phaser.Timer.MINUTE * 3.8, this.newResourceUnitTimer, this);
		new MyTimer(Phaser.Timer.MINUTE * 1.9, this.newResourcesTimer, this);
		new MyTimer(Phaser.Timer.MINUTE * 2, this.newCitiesTimer, this);
	}
}
