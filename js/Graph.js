class Graph {
	
	constructor(trajectories) {

		// Array of trajectory objects
		this.trajectories = trajectories

		// Array to hold the polylines
		this.polylines = []

		// The horizontal and vertical space for the axes
		this.axesPadding = 50

		// Default graph width (lg graphic)
		this.graphWidth = 448
		// Default graph height
		this.graphHeight = 150
		// Default graph scale
		this.graphScale = 1
		// The height of the tickmarks
		this.tickHeight = 4
		// The default stroke width
		this.strokeWidth = 0.5
		// Default text size
		this.textSize = 8

		// All colours in sequence
		this.colors = [
		'rgb(241, 94, 34)',
		'rgb(70, 175, 160)',
		'rgb(4, 128, 144)',
		'rgb(5, 102, 142)',
		'rgb(66, 83, 101)',
		'rgb(105, 133, 157)',
		'rgb(134, 152, 171)',
		'rgb(165, 176, 192)',
		'rgb(197, 203, 213)',
		'rgb(234, 236, 240)'
		]

		this.textAttrs = {
			'font-family': 'FF Mark Pro',
			'font-size': this.textSize + 'pt',
			'fill': this.colors[5],
			'font-weight': 300,
			'text-anchor': 'middle'
		}

		this.lineAttrs = {
			'stroke-width': this.strokeWidth,
			'fill-opacity': 0,
			'fill': 'none'
		}

	}

	addTrajectory(trajectory) {

		this.trajectory.push(trajectory)

	}

	draw(id) {

		// Get the graph DOM object
		var graphEl = $('#' + id)

		// Clear the graph of all its previous contents
		graphEl.empty()

		// Create variables to store the max x and y values
		var xMax = 0
		var yMax = 0

		// Determine the largest x and y dimensions
		for (let trajectory of this.trajectories) {

			if (trajectory.xMax > xMax) { xMax = trajectory.xMax }
			if (trajectory.yMax > yMax) { yMax = trajectory.yMax }

		}

		// Determine the graph scaling factor and graph height
		var plotWidth = this.graphWidth - this.axesPadding

		this.graphScale = plotWidth / xMax
		this.graphHeight = (this.graphScale * yMax) + this.axesPadding
		console.log(plotWidth, this.graphScale)

		this.drawAxes(id, xMax, yMax)

		// Set the height of the graph DOM object
		graphEl.height(this.graphHeight)

		// Create a snapSvg object using the DOM id
		var snap = Snap('#' + id)
		snap.attr({ version: '1.1' , xmlns:"http://www.w3.org/2000/svg"})

		var i = 0

		for (let trajectory of this.trajectories) {

			// For each trajectory, create a polyline array
			var polyline = []

			for (let dataPoint of trajectory.data) {

				polyline.push((dataPoint.x * this.graphScale) + this.axesPadding )
				// polyline puts y0 at the top, so we have to subtract the value from the graph height
				polyline.push(this.graphHeight - (dataPoint.y * this.graphScale) - this.axesPadding)

			}

			// Add the polyline to the array
			this.polylines.push(polyline)

			var polylineEl = snap.polyline(polyline)
			// polylineEl.addClass(this.colorSequence[i] + ' line')
			polylineEl.attr('id', trajectory.id);

			polylineEl.attr(this.lineAttrs)

			polylineEl.attr({
				'stroke': this.colors[i],
				'stroke-dasharray': trajectory.pathLength * this.graphScale,
				'stroke-dashoffset': trajectory.pathLength * this.graphScale
			})

			polylineEl.animate({

				'stroke-dashoffset': 0

			}, trajectory.flightTime * 1000, () => {

				this.save(id)

			});

			i++

		}

	}

	drawAxes(id, xMax, yMax) {

		// Get the graph DOM object
		var graphEl = $('#' + id)

		var snap = Snap('#' + id)

		var polyline = []

		polyline[0] = this.axesPadding
		polyline[1] = 0

		polyline[2] = this.axesPadding
		polyline[3] = this.graphHeight - this.axesPadding

		polyline[4] = this.graphWidth
		polyline[5] = this.graphHeight - this.axesPadding

		var polylineEl = snap.polyline(polyline)

		polylineEl.attr({
			'stroke-width': this.strokeWidth,
			'stroke': this.colors[5],
			'fill-opacity': 0,
			'fill': 'none'
		})

		// We use ceil because the amount of ticks is n+1
		var xMarks = Math.ceil(xMax / 5)
		var yMarks = Math.ceil(yMax / 5)
		var pxPerMark = (this.graphWidth - this.axesPadding) / (xMax / 5)

		for (var i = 0; i < xMarks; i++) {

			var xPos = (i * pxPerMark) + this.axesPadding
			var yPos = this.graphHeight - this.axesPadding

			var line = snap.line(xPos, yPos, xPos, yPos + this.tickHeight)
			var text = snap.text(xPos, yPos + this.textSize + this.tickHeight, String(i * 5))

			line.attr({
				'stroke-width': this.strokeWidth,
				'stroke': this.colors[5],
				'fill-opacity': 0,
				'fill': 'none'
			})

			text.attr(this.textAttrs)

		}

		for (var i = 0; i < yMarks; i++) {

			var xPos = this.axesPadding
			var yPos = (this.graphHeight - this.axesPadding) - (i * pxPerMark)

			var line = snap.line(xPos, yPos, xPos - this.tickHeight, yPos)
			var text = snap.text(xPos - 1.5 * this.tickHeight, yPos + (this.textSize / 2) - 1, String(i * 5))

			line.attr({
				'stroke-width': this.strokeWidth,
				'stroke': this.colors[5],
				'fill-opacity': 0
			})

			text.attr(this.textAttrs)
			text.attr({
				'text-anchor': 'end'
			})

		}

	}

	save(id) {

		var svg = document.getElementById(id)

		var serializer = new XMLSerializer()
		var source = serializer.serializeToString(svg)

		var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);

		document.getElementById('air-resistance-save').href = url

	}

}