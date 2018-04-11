// Distance between points in pixels
var MIN_DIST = 150;
var BOUND_RADIUS = 1000;
// Linear bounds on which we calculate the allowed radius
var MAX_N = 100;

class WorldGenerator {
	constructor() {
		// Just the coordinates;
		this.resources = [];
		this.cities = [];
		this.servers;
	}

	in_circle(center, radius, p) {
		return Math.pow(center[0] - p[0], 2) + Math.pow(center[1] - p[1], 2) <= Math.pow(radius, 2);
	}

	genHaltonMember(i, base) {
		var st = i.toString(base).split("").reverse().join("");
		var ret = parseInt(st, base) / Math.pow(base, st.length);
		return ret;
	}

	genHaltonSeq(i, j, base) {
		var ret = [];

		var idx = i;
		for (;idx < j;++idx)
			ret.push(this.genHaltonMember(idx, base));

		return ret;
	}

	zip(a, b) {
		return a.map(function(e, i) {
			return [e, b[i]];
		});
	}

	sortByDist(points) {
		points.sort(function(a, b) {
			var distA = Math.pow(a[0], 2) + Math.pow(a[1], 2);
			var distB = Math.pow(b[0], 2) + Math.pow(b[1], 2);
			if (distA < distB)
				return -1;
			if (distB < distA)
				return 1;
			return 0;
		});
	}

	genPointsOut(n, startAt, current_points=[]) {
		var old_n = current_points.length;
		var points = [];
		var idx = startAt;
		var seq = [];

		while (points.length < n) {
			if (seq.length == 0) {
				seq = this.zip(
					this.genHaltonSeq(idx, idx + 200, 2), 
					this.genHaltonSeq(idx, idx + 200, 3)
				);

				seq = seq.map(function(pt, i) {
					return [(2 * pt[0] - 1) * BOUND_RADIUS, (2 * pt[1] - 1) * BOUND_RADIUS];
				});
				idx += 200;
			}

			var point = seq.shift();
			if (!this.in_circle([0, 0], BOUND_RADIUS, point))
				continue;

			var can_place = true;

			for (var i = 0;(i < points.length && can_place);++i)
				if (this.in_circle(points[i], MIN_DIST, point))
					can_place = false;

			for (var i = 0;(i < current_points.length && can_place);++i)
				if (this.in_circle(current_points[i], MIN_DIST, point))
					can_place = false;

			if (can_place)
				points.push(point);
		}

		return points;
	}

	genPointsInfill(n, startAt, current_points=[], around=false, initial_circle=0.3) {
		var points = [];
		var old_n = 0;

		if (around)
			old_n = current_points.length;


		var idx = startAt;

		while (points.length < n) {
			var allowed_radius = (initial_circle + (1 - initial_circle) * Math.min(1, (points.length + old_n) / MAX_N)) * BOUND_RADIUS;

			var x = (2 * this.genHaltonMember(idx, 2) - 1) * BOUND_RADIUS;
			var y = (2 * this.genHaltonMember(idx, 3) - 1) * BOUND_RADIUS;

			idx += 1;
			if (!this.in_circle([0, 0], allowed_radius, [x, y]))
				continue;

			var can_place = true;

			for (var i = 0;(i < points.length && can_place);++i)
				if (this.in_circle(points[i], MIN_DIST, [x, y]))
					can_place = false;

			for (var i = 0;(i < current_points.length && can_place);++i)
				if (this.in_circle(current_points[i], MIN_DIST, [x, y]))
					can_place = false;

			if (can_place)
				points.push([x, y]);
		}

		return points;
	}

	initGameWorld() {
		// Generate resources
		this.resources = this.genPointsOut(30, Math.ceil(Math.random() * 1000));

		var resource_units = [
			new ResourceUnit(1, 10, 30, RESOURCE_COLORS[0]),
			new ResourceUnit(2, 10, 30, RESOURCE_COLORS[1]),
			new ResourceUnit(3, 10, 30, RESOURCE_COLORS[2]),
		]

		for (var i = 0;i < this.resources.length;++i) {
			network.add_node(
				new Resource(
					network, 
					this.resources[i][0],
					this.resources[i][1],
					resource_units[Math.floor(Math.random() * 3)],
				)
			);
		}

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

		this.cities = this.genPointsInfill(
			3, 
			1000 + Math.ceil(Math.random() * 1000),
			this.resources,
			false,
			0.4,
		);

		for (var i = 0;i < this.cities.length;++i) {
			var p0 = Math.floor(Math.random() * 11);
			var p1 = Math.floor(Math.random() * 11);

			// Swaping two values
			if (p0 > p1)
				p1 = [p0, p0 = p1][0];

			var distro = make_probs([
				[p0 / 10, resource_units[0]],
				[(p1 - p0) / 10, resource_units[1]],
				[(10 - p1) / 10, resource_units[2]],
			]);

			network.add_node(
				new City(
					network,
					this.cities[i][0],
					this.cities[i][1],
					0.3 + Math.random() * 0.8,
					distro
				)
			);
		}
	}
}
