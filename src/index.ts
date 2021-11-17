const FaceDetector = require('facedetector');

console.log("shite");

interface Box {
	x: number; y: number;
	width: number; height: number;
}

async function shit_doer() {
	let media = await navigator.mediaDevices.getUserMedia({video: {width: 1280, height: 720}});
	console.log(media);
	let video_element = document.createElement("video");
	video_element.srcObject = media;

	let canvas = document.createElement("canvas");
	canvas.width = 1920;
	canvas.height = 1080;
	canvas.id = "the_canvas";
	document.body.appendChild(canvas);

	await new Promise((resolve, reject) => {
		video_element.addEventListener("loadedmetadata", resolve);
		video_element.addEventListener("error", reject);
	});
	
	video_element.play();

	let w = video_element.videoWidth;
	let h = video_element.videoHeight;

	canvas.width = w;
	canvas.height = h;

	let x_slider = document.createElement("input");
	x_slider.type = "range"; x_slider.min = "1"; x_slider.max = "10"; x_slider.value = localStorage.getItem("widetracker_x_fac") || "1"; x_slider.step = "any";
	let y_slider = document.createElement("input");
	y_slider.type = "range"; y_slider.min = "1"; y_slider.max = "10"; y_slider.value = localStorage.getItem("widetracker_y_fac") || "1"; y_slider.step = "any";
	let text = document.createElement("span");
	text.textContent = "Click the video toggle wide and the above two sliders to adjust your wide-ness";
	document.body.appendChild(x_slider);
	document.body.appendChild(y_slider);
	document.body.appendChild(text);
	x_slider.onchange = () => {
		localStorage.setItem("widetracker_x_fac", x_slider.value);
	}
	y_slider.onchange = () => {
		localStorage.setItem("widetracker_y_fac", y_slider.value);
	}

	let detector = new FaceDetector({video: video_element, flipLeftRight: false, flipUpsideDown: false});
	detector.startDetecting();
	console.log(detector);
	let is_wide = false;
	canvas.addEventListener("click", () => {
		is_wide = !is_wide;
	})

	let curr_face = {x: 0, y: 0, width: canvas.width, height: canvas.height};

	detector.setOnFaceUpdatedCallback(function (faces : any[]) {
		let biggest_face;
		for (var i = 0; i < faces.length; i++) {
			var face = faces[i];
			if(!biggest_face || face.height*face.width > biggest_face.height*biggest_face.width) biggest_face = face;
		}
		if(biggest_face) {
			curr_face = biggest_face;
		}
		let ctx = canvas.getContext("2d");
		if(ctx && is_wide) {
			//ctx.drawImage(video_element, 0, 0);
			let fx = curr_face.x;
			let fy = curr_face.y;
			let fw = curr_face.width;
			let fh = curr_face.height;
			fx += fw/2;
			fy += fh/2;
			fw /= +x_slider.value;
			fh *= +y_slider.value;
			fx -= fw/2;
			fy -= fh/2;

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(video_element, fx*w, fy*h, fw*w, fh*h, 0, 0, canvas.width, canvas.height);
		}
	});

	function frame() {
		let ctx = canvas.getContext("2d");
		if(ctx && !is_wide) {
			ctx.drawImage(video_element, 0, 0);
		}
		requestAnimationFrame(frame);
	}
	frame();
}

window.addEventListener('DOMContentLoaded', shit_doer);
