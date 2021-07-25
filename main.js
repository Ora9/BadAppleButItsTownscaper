console.log("Initializing..");

var TC = require('townsclipper'),
	Robot = require("Robotjs"),
	Jimp = require("jimp"),
	Clipboardy = require('Clipboardy'),
	fs = require('fs')

var loadPos = {x: 1830, y: 240},
	closeMenuPos = {x: 1710, y: 30},
	screenW = Robot.getScreenSize().width,
	screenH = Robot.getScreenSize().height,
	frameMin = 9,
	frameMax = 1739,
	townW = 47,
	townH = 35,
	colorTreshold = 127,
	colorBlack = 14,
	colorWhite = 9,
	startTime = Date.now(),
	frameTiming = [],
	townPosBase = [
		{ x: 3210, y: -2901 },
		{ x: 3220, y: -2906 },
		{ x: 3230, y: -2911 },
		{ x: 3240, y: -2916 },
		{ x: 3250, y: -2921 },
		{ x: 3262, y: -2927 },
		{ x: 3272, y: -2932 },
		{ x: 3282, y: -2937 },
		{ x: 3294, y: -2943 },
		{ x: 3303, y: -2947 },
		{ x: 3312, y: -2952 },
		{ x: 3321, y: -2957 },
		{ x: 3330, y: -2961 },
		{ x: 3342, y: -2967 },
		{ x: 3352, y: -2972 },
		{ x: 3362, y: -2977 },
		{ x: 3374, y: -2983 },
		{ x: 3384, y: -2988 },
		{ x: 3396, y: -2994 },
		{ x: 3408, y: -3000 },
		{ x: 3421, y: -3007 },
		{ x: 3433, y: -3013 },
		{ x: 3445, y: -3019 },
		{ x: 3456, y: -3024 },
		{ x: 3467, y: -3030 },
		{ x: 3479, y: -3036 },
		{ x: 3492, y: -3042 },
		{ x: 3504, y: -3048 },
		{ x: 3516, y: -3054 },
		{ x: 3528, y: -3060 },
		{ x: 3538, y: -3065 },
		{ x: 3550, y: -3071 },
		{ x: 3560, y: -3076 },
		{ x: 3570, y: -3081 },
		{ x: 3582, y: -3087 },
		{ x: 3591, y: -3092 },
		{ x: 3600, y: -3096 },
		{ x: 3609, y: -3100 },
		{ x: 3618, y: -3105 },
		{ x: 3630, y: -3111 },
		{ x: 3640, y: -3116 },
		{ x: 3650, y: -3121 },
		{ x: 3662, y: -3127 },
		{ x: 3672, y: -3132 },
		{ x: 3682, y: -3137 },
		{ x: 3692, y: -3142 },
		{ x: 3702, y: -3147 }
	];


async function testTill(ms, testFunc, resolve) {
	return await new Promise(function (resolve) {
		var interval = setInterval(function() {
			if( testFunc() ) {
		        clearInterval(interval)
				resolve()
			}
		}, ms)
	});
}

async function waitMS(ms, callback, resolve) {
	return await new Promise(function (resolve) {
		setTimeout(() => {
			callback();
			resolve();
		}, ms)
	});
}

(async function() {
	console.log("Let's GOO..");

	function loadAndConvert(img) {
		console.log("loading frame n°" + frame + "/" + frameMax + " ..");
		var currVoxels = [],
			sparse = [];
		for (var pixelX = 0; pixelX < townW; pixelX++) {
			var townPos = townPosBase[pixelX];
			sparse.push({ x: townPos.x, y: townPos.y, voxels: {} })

			for (var pixelY = townH; pixelY >= 0; pixelY--) {

				var imgPixelRGB = Jimp.intToRGBA(img.getPixelColor(pixelX, pixelY));
				var imgPixelLum = Math.round(0.2126*imgPixelRGB.r + 0.7152*imgPixelRGB.g + 0.0722*imgPixelRGB.b)

				currVoxels = sparse[sparse.length - 1]["voxels"]
				currVoxels[(townH - pixelY) + 1 ] = ((imgPixelLum < colorTreshold) ? colorWhite : colorBlack)

				//console.log(`X: ${pixelX}, Y: ${pixelY}, truePos: ${JSON.stringify(townPos)}, pixelLum: ${imgPixelLum}, pixelBool: ${((imgPixelLum < 127) ? "." : "█")}`)
			}
		}

		var clip = TC.sparseToClip(sparse);
		Clipboardy.writeSync(clip);

	}

	async function moveAndShot(frame) {
		var clip = Clipboardy.readSync();

		Robot.moveMouse(loadPos.x, loadPos.y);
		Robot.mouseClick();

		await testTill(50, function() {
			if( Robot.getPixelColor(1900, 1060) === "474952" ) {
				return true;
			} else {
				return false;
			}
		}).then((result) => {
			console.log("  - Frame Loaded");
		});


		Robot.setMouseDelay(30)

		// centering the camera
		Robot.moveMouse(screenW / 2, screenH / 2);
		for (var i = 0; i < 3; i++) {
			Robot.scrollMouse(0, -50);
		}

		Robot.mouseToggle("down");
		Robot.dragMouse(screenW / 2, 0);
		Robot.mouseToggle("up");
		Robot.moveMouse(0, 0) // move mouse out of screen to take screenshot


		var outputFileName = "output/raw" + frame
		await waitMS(50, function() {
			console.log("  - Taking screenshot");
			var rawImg = Robot.screen.capture().image
			fs.writeFile(outputFileName, rawImg, (err) => {err})
		}).then((result) => {});

	}

	// for(var frame = frameMin; frame < frameMax; frame++) {
	// 	frameTiming.push({
	// 		"startTime": Date.now()
	// 	})

	// 	var inputFile = "imgs/img" + frame + ".png"

	// 	await Jimp.read(inputFile).then((img) => loadAndConvert(img, frame));
	// 	await moveAndShot(frame)

	// 	let frameEndTime = Date.now()
	// 	lastFrameTiming = frameTiming[frameTiming.length - 1]

	// 	lastFrameTiming["endTime"] = frameEndTime
	// 	console.log("  - Frame took " + ((lastFrameTiming["endTime"] - lastFrameTiming["startTime"]) / 1000) + " seconds to process");
	// }

	var frame = 433
	var inputFile = "imgs/img" + frame + ".png"
	await Jimp.read(inputFile).then((img) => loadAndConvert(img, frame));
	await moveAndShot(frame)

	var frameTotal = 0
	frameTiming.forEach((item, i) => {
		frameTotal += ((item["endTime"] - item["startTime"]) / 1000)
	});
	average = frameTotal / frameTiming.length

	var endTime = Date.now()
	console.log("Total Execution Time: " + ((endTime - startTime) / 1000) + " seconds !")

})()

// 1h47