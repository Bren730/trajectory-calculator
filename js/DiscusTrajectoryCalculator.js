class DiscusTrajectoryCalculator {

	constructor() {

		var self = this


		// Default values to use for calculations

		// Object to hold default values
		this.defVal = {}
		// Average gravity (m/s^2)
		this.defVal.g = 9.81
		// Average air density (kg/m^3)
		this.defVal.rho = 1.225
		// Average release speed (m/s)
		this.defVal.v0 = 23.6
		// Standard release angle (deg)
		this.defVal.thetaRelease0 = 35
		this.defVal.thetaMotion0 = 35
		// Standard attack angle (deg)
		this.defVal.thetaAttack0 = 0
		this.defVal.thetaInclination = this.defVal.thetaRelease0 + this.defVal.thetaAttack0
		
		// Standard stalling angle (deg)
		this.defVal.thetaStall = 30
		this.defVal.vx0 = this.defVal.v0 * Math.cos(rad(this.defVal.thetaRelease0))
		this.defVal.vy0 = this.defVal.v0 * Math.sin(rad(this.defVal.thetaRelease0))
		// Standard mass (kg)
		this.defVal.m = 2
		// Standard minimum drag coefficient (dimensionless)
		this.defVal.cDMin = 0.04
		// Standard maximum drag coefficient (dimensionless)
		this.defVal.cDMax = 0.42
		// Frontal surface area of a 2kg discus (m^2)
		this.defVal.aFront = (0.0535 * 0.045) + (0.0835 * 0.045)
		// Bottom surface area of a 2kg discus (m^2)
		this.defVal.aBottom = Math.PI * Math.pow((0.22 / 2), 2)
		// Average release height (m)
		this.defVal.y0 = 1.02
		// Default x starting distance 
		this.defVal.x0 = 0
		// Standard delta time interval (s)
		this.defVal.deltaT = 0.01
		// Default wind speed
		this.defVal.vWind = 0

		DiscusTrajectoryCalculator._defVal = $.extend(true, {}, this.defVal)


		// Objects to store calculated trajectories

		// Object to store vacuum trajectories
		this.vacuumTrajectories = []
		// Object to store air resistance trajectories
		this.airResistanceTrajectories = []


		// Event handlers

		// Event handler for vacuum trajectory model calculations
		$('#vacuum-calculate').on('click tap', function(){

			return self.vacuum()

		})

		// Event handler for air resistance model calculations
		$('#air-resistance-calculate').on('click tap', function(){

			return self.airResistance()

		})

	}

	vacuum(variables) {

		variables = variables || copyObj(this.defVal)

		//Initial speed
		var v0 = parseFloat($('#vacuum-v0').val()) || variables.v0
		variables.v0 = v0

		// Initial x distance = 0
		var x0 = parseFloat($('#vacuum-x0').val()) || variables.x0
		variables.x0 = x0
		var x = x0
		// Initial y height is the release height
		var y0 = parseFloat($('#vacuum-y0').val()) || variables.y0
		variables.y0 = y0
		var y = y0
		// Value to store the maximum heigh
		var yMax = 0

		// Initial release angle
		var thetaRelease0 = parseFloat($('#vacuum-thetaRelease0').val()) || variables.thetaRelease0
		variables.thetaRelease0 = thetaRelease0

		// Initial x speed
		var vx0 = v0 * Math.cos(rad(thetaRelease0))
		variables.vx0 = vx0
		// Initial y speed
		var vy0 = v0 * Math.sin(rad(thetaRelease0))
		variables.vy0 = vy0

		// Gravity
		var g = parseFloat($('#vacuum-g').val()) || variables.g
		variables.g = g

		// X speed at time t
		var vx = vx0
		// Y speed at time t
		var vy = vy0

		// X acceleration
		var ax = 0
		// Y acceleration
		var ay = -g

		// Time starts at 0s
		var t = 0
		var deltaT = parseFloat($('#vacuum-deltaT').val()) || variables.deltaT
		variables.deltaT = deltaT

		// Variable to store the total path length
		var pathLength = 0;

		// Array to hold the data in [ [t0, x, y], [t1, x, y]... ] format
		var data = []

		console.log(v0, thetaRelease0, g, y0, deltaT, vx0, vy0)

		var id = 'vacuum-' + this.vacuumTrajectories.length

		var trajectory = new Trajectory(id, 'vacuum', data, 0, 0, 0, variables)

		while (y > 0 && t < 10) {

			// console.log(t, x, y)

			var thetaMotion = deg(Math.atan(vy / vx))

			var prevX = x
			var prevY = y

			vx = vx0
			vy = vy0 - (g * t)

			x = vx0 * t + x0
			y = vy0 * t - (0.5 * g * Math.pow(t, 2) ) + y0

			// console.log(x, y)

			var coords = {
				't' : t, 
				'x' : x, 
				'y' : y,
				'vx' : vx, 
				'vy' : vy, 
				'ax' : ax, 
				'ay' : ay,
				'thetaMotion': thetaMotion
			}

			pathLength += Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2) )

			data.push(coords)

			if (y > yMax) { yMax = y }

			if (data.length > 1 && x > data[data.length - 2].x) {

				trajectory.xMax = x

			}

			if (data.length > 1 && y > data[data.length - 2].y) {

				trajectory.yMax = y

			}

			t += deltaT

		}

		trajectory.data = data
		trajectory.pathLength = pathLength
		trajectory.flightTime = t

		this.vacuumTrajectories.push(trajectory)

		console.log("Total time: " + t)
		// console.log(data)
		var el = $('#vacuum-model-svg')

		this.graph = new Graph(this.vacuumTrajectories, 'vacuum-model-svg')
		this.graph.draw('vacuum-model-svg')

	}

	airResistance(variables) {

		// This JSON code is necessary to make a copy of the defVal object without referencing it
		variables = variables || copyObj(this.defVal)

		//Initial speed
		var v0 = parseFloat($('#air-resistance-v0').val()) || variables.v0
		variables.v0 = v0
		var v = v0

		// Initial x distance = 0
		var x0 = parseFloat($('#air-resistance-x0').val()) || variables.x0
		variables.x0 = x0
		var x = x0
		// Initial y height is the release height
		var y0 = parseFloat($('#air-resistance-y0').val()) || variables.y0
		variables.y0 = y0
		var y = y0

		// Initial release angle
		var thetaRelease0 = parseFloat($('#air-resistance-thetaRelease0').val()) || variables.thetaRelease0
		variables.thetaRelease0 = thetaRelease0

		// Initial x speed
		var vx0 = v0 * Math.cos(rad(thetaRelease0))
		variables.vx0 = vx0
		// Initial y speed
		var vy0 = v0 * Math.sin(rad(thetaRelease0))
		variables.vy0 = vy0

		// The wind speed (solely in x-direction), negative values represent a headwind
		var vWind = parseFloat($('#air-resistance-vWind').val()) || variables.vWind
		variables.vWind = vWind
		var vRelX0 = vx0 - vWind

		// Gravity
		var g = parseFloat($('#air-resistance-g').val()) || variables.g
		variables.g = g

		// X speed at time t
		var vx = vx0
		// Y speed at time t
		var vy = vy0

		// air density
		var rho = parseFloat($('#air-resistance-rho').val()) || variables.rho
		variables.rho = rho

		// Discus mass
		var m = parseFloat($('#air-resistance-m').val()) || variables.m
		variables.m = m

		var thetaAttack0 = parseFloat($('#air-resistance-thetaAttack0').val()) || variables.thetaAttack0
		variables.thetaAttack0 = thetaAttack0
		var thetaAttack = thetaAttack0

		var thetaMotion0 = parseFloat($('#air-resistance-thetaRelease0').val()) || variables.thetaRelease0
		variables.thetaMotion0 = thetaMotion0
		var thetaMotion = thetaMotion0

		var thetaInclination = thetaRelease0 + thetaAttack0
		variables.thetaInclination = thetaInclination

		var cD = this.cDrag(thetaAttack, this.defVal.cDMin, this.defVal.cDMax)
		var cL = this.cLift(thetaAttack)
		var a = this.surfaceArea(thetaAttack, this.defVal.aFront, this.defVal.aBottom)

		// Initial x acceleration
		var ax0 = -Math.abs(this.aAeroX(rho, v, cD, cL, a, thetaMotion, m))
		var ax = ax0
		// Initial y acceleration
		var ay0 = -g + this.aAeroY(rho, v, cD, cL, a, thetaMotion, m)
		var ay = ay0

		console.log(ax0, ay0, cD, cL, a, g)

		// Time starts at 0s
		var t = 0
		var deltaT = parseFloat($('#air-resistance-deltaT').val()) || variables.deltaT
		variables.deltaT = deltaT
		var pathLength = 0;

		// Array to hold the data in [ [t0, x, y], [t1, x, y]... ] format
		var data = []

		console.log(v0, thetaRelease0, g, y0, deltaT, vx0, vy0, rho, m, thetaAttack0)

		var id = 'air-resistance-' + this.vacuumTrajectories.length

		// Create new trajectory object to hold the data being generated
		var trajectory = new Trajectory(id, 'air-resistance', data, 0, 0, 0, variables)

		// While the projectile is in positive y-space, calculate the trajectory
		// When t > 10 seconds, stop, even if y > 0, to prevent infinite loops

		var coords0 = {
			't' : t, 
			'x' : x, 
			'y' : y,
			'v' : v,
			'vx' : vx, 
			'vy' : vy, 
			'ax' : ax, 
			'ay' : ay,
			'thetaMotion' : thetaMotion,
			'thetaAttack' : thetaAttack,
			'cD' : cD,
			'cL' : cL
		}

		data.push(coords0)

		while (y > 0 && t < 30) {

			var thetaMotion = deg(Math.atan(vy / vx))

			thetaAttack = thetaInclination - thetaMotion

			cD = this.cDrag(thetaAttack, this.defVal.cDMin, this.defVal.cDMax)
			cL = this.cLift(thetaAttack)
			a = this.surfaceArea(thetaAttack, this.defVal.aFront, this.defVal.aBottom)

			var vRelX = vx - vWind
			var thetaMotionRel = deg(Math.atan(vy / vRelX))
			var vRel = Math.sqrt(Math.pow(vRelX, 2) + Math.pow(vy, 2))

			var aAerodynamicsX = -Math.abs(this.aAeroX(rho, vRel, cD, cL, a, thetaMotionRel, m))
			var aAerodynamicsY = this.aAeroY(rho, vRel, cD, cL, a, thetaMotionRel, m)

			ax = aAerodynamicsX
			ay = -g + aAerodynamicsY
			// console.log(aAerodynamicsX, aAerodynamicsY, thetaMotion)
			// console.log('aAeroY', this.aAeroY(rho, v, cD, cL, a, thetaMotion, m), 'vy', vy, 'cL', cL, 'cD', cD, 'thetaAttack', thetaAttack)

			var prevX = x
			var prevY = y

			vx += ax * deltaT
			vy += ay * deltaT

			x += vx * deltaT
			y += vy * deltaT

			var coords = {
				't' : t, 
				'x' : x, 
				'y' : y,
				'v' : v,
				'vx' : vx, 
				'vy' : vy, 
				'ax' : ax, 
				'ay' : ay,
				'aAeroX': aAerodynamicsX,
				'aAeroY': aAerodynamicsY,
				'thetaMotion' : thetaMotion,
				'thetaAttack' : thetaAttack,
				'cD' : cD,
				'cL' : cL
			}

			pathLength += Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2) )

			data.push(coords)

			if (data.length > 1 && x > data[data.length - 2].x) {

				trajectory.xMax = x

			}

			if (data.length > 1 && y > data[data.length - 2].y) {

				trajectory.yMax = y

			}

			t += deltaT

		}

		trajectory.data = data
		trajectory.pathLength = pathLength
		trajectory.flightTime = t
		this.airResistanceTrajectories.push(trajectory)

		this.graph = new Graph(this.airResistanceTrajectories, 'air-resistance-model-svg')
		this.graph.draw('air-resistance-model-svg')

		console.log(trajectory)

		// this.drawGraph(data, 'air-resistance-model-svg')

		// console.log(data)

	}

	cDrag(thetaAttack, cDMin, cDMax) {

		var cD = (thetaAttack / 90) * (cDMax - cDMin) + cDMin

		return cD

	}

	cLift(thetaAttack) {

		// var cL = 2 * Math.PI * rad(thetaAttack)

		var cL

		if (thetaAttack < this.defVal.thetaStall) {

			cL = thetaAttack / 30

		} else {

			cL = 0
		}
		

		return cL

	}

	surfaceArea(thetaAttack, aMin, aMax) {

		// The attack angle is in degrees. At 0 degrees it is cDMin, at 90 it is cDMax
		var perc = thetaAttack / 90

		var a = perc * (aMax - aMin) + aMin

		return a

	}

	fAeroX(rho, v, cD, cL, a, thetaMotion) {

		// Since lift is perpendicular to the angle of motion, we add 90° to thetaMotion

		var F = 0.5 * rho * Math.pow(v, 2) * (Math.cos(rad(thetaMotion)) * cD + Math.sin(rad(thetaMotion)) * cL) * a

		return F

	}

	fAeroY(rho, v, cD, cL, a, thetaMotion) {

		// Since lift is perpendicular to the angle of motion, we add 90° to thetaMotion

		var F = 0.5 * rho * Math.pow(v, 2) * (Math.cos(rad(thetaMotion)) * cL + Math.sin(rad(thetaMotion)) * cD) * a

		return F
		
	}

	aAeroX(rho, v, cD, cL, a, thetaMotion, m) {

		// console.log(rho, v, cD, cL, a, thetaMotion, m)

		return this.fAeroX(rho, v, cD, cL, a, thetaMotion) / m

	}

	aAeroY(rho, v, cD, cL, a, thetaMotion, m) {

		return this.fAeroY(rho, v, cD, cL, a, thetaMotion) / m

	}

}

window.discusTrajectoryCalculator = new DiscusTrajectoryCalculator()