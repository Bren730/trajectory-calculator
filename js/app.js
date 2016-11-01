

// Converts degrees into radians
function rad(deg) {

	var rad = (deg * Math.PI) / 180
	return rad

}

function deg(rad) {

	var deg = (rad * 180) / Math.PI

	return deg
}

function copyObj(obj) {

	var _obj = JSON.parse(JSON.stringify(obj))

	return _obj

}

$('.toggle').on('click tap', function(e){

	$(this).toggleClass('checked')

	var event = new CustomEvent('changeGraphWidth', {
		'detail': $(this).hasClass('checked')
	})

	document.dispatchEvent(event)

})