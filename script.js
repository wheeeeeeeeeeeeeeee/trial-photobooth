// home
const startB = document.getElementById('startB');

// initialise
const video = document.getElementById("video");
const countdown = document.getElementById('countdown');
const strip = document.getElementById('strip');

// customise
const stripImage = document.getElementById("stripImage")
const downloadBtn = document.getElementById('download');
const homeBtn = document.getElementById('home')

// shots
const shot1 = document.getElementById('shot1');
const shot2 = document.getElementById('shot2');
const shot3 = document.getElementById('shot3');
const previews = [shot1, shot2, shot3]

//buttons 
const bfrButtons = document.getElementById('snap');
const aftButtons = document.getElementById('aftButtons');
const nextBtn = document.getElementById('next');
const retakeBtn = document.getElementById('retake');

let photos = [];
let finalStripCanvas = null;


function initIndex() {
	startB.onclick = () => {		
		console.log('yes');
		window.location.href = "takephoto.html";
	};
}

function initTakePhoto() {
	// ask for access to use camera
	navigator.mediaDevices.getUserMedia({ video: true })
	.then(stream => {
		video.srcObject = stream;
	});
	//stream --> show live feed when the camera is showing (mirror)

	// button clicked
	bfrButtons.onclick = start;
	//if you put startCountdown(), it will assign undefined to the variable --> for onclick
	//this way ur js executing the function like a python class
}

// Index page (when start button clicked)
async function start() {
	strip.innerHTML = '';
	photos = [];  // clear array before every run

	// loop, take pic 3 times 
	for (let i = 0; i < 3; i++) {
		await startCountdown();       // wait 3 → 2 → 1
		// javascript default will run everything together at once

		const canvas = document.createElement('canvas');
		// get 3 new photos, create new canvas each time

		const photo = takePhoto(canvas); 
		previews[i].src = getImageData(photo);  // assign image to previews 
		photos.push(photo); // add to photos array
	}

	// save photos to local storage as an array of 3 images
	const photoData = photos.map(photoCanvas => getImageData(photoCanvas));
	localStorage.setItem("photos", JSON.stringify(photoData));

	// show after buttons
	bfrButtons.style.display = 'none';
	aftButtons.style.display = "flex";

	// after buttons actions
	retakeBtn.onclick = retake;
	nextBtn.onclick = () => {
		window.location.href = "customise.html";
	};
}


//customise 
function initCustomise() {
	const images = JSON.parse(localStorage.getItem("photos"));  // in image data form
	const canvas = document.getElementById('stripImage');
	
	if (canvas && images.length>0) {
		createStrip(canvas, images);
	}

	console.log(canvas.width, canvas.height);

	// buttons
	const whiteB = document.getElementById('whiteB'); 
	const pinkB = document.getElementById('pinkB');
	const blueB = document.getElementById('blueB');
	const greenB = document.getElementById('greenB');

	const noneB = document.getElementById('noneB');
	const duckB = document.getElementById('duckB');

	let currColor = '#ffffff';
	let currTheme = '';

	// customisation actions 
	whiteB.onclick = () => {
		currColor = 'white';
		changeTemplate(canvas, images, currColor, currTheme);
	};
	pinkB.onclick = () => {
		currColor = 'pink';
		changeTemplate(canvas, images, currColor, currTheme);
	};
	blueB.onclick = () => {
		currColor = '#bbe5ff';
		changeTemplate(canvas, images, currColor, currTheme);
	};
	greenB.onclick = () => {
		currColor = '#89d495';
		changeTemplate(canvas, images, currColor, currTheme);
	};

	duckB.onclick = () => {
		currTheme = 'duck';
		changeTemplate(canvas, images, currColor, currTheme);
	};
	noneB.onclick = () => {
		currTheme = '';
		changeTemplate(canvas, images, currColor, currTheme);
	}
	downloadBtn.onclick = () => {downloadStrip(getImageData(canvas))};
	homeBtn.onclick = () => {window.location.href = 'index.html'};
}


// take photo
function startCountdown() {  // counts down from three ONLY
	countdown.style.visibility = 'visible';

	let count = 3;
	countdown.textContent = count;

	// promise --> placeholder for something that will happen later
	return new Promise(resolve => {
		const interval = setInterval(() => {
			count = count-1;
			// can use count--;  same function
			
			if (count>0) {
				countdown.textContent = count;
			}
			else {
				countdown.textContent = '';
				//reach zero liao, end timer 
				clearInterval(interval);
				resolve();	// tells loop that we're done, can continue (await)
			}	
		}, 1000);
	})
}


function takePhoto(canvas) {  // takes photo, returns canvas with photo
	const ctx = canvas.getContext("2d");
	// getContext --> drawing API to draw in canvas

	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	
	//take photo (current frame)
	ctx.drawImage(video, 0, 0);

	return canvas; 
}


function getImageData(canvas) {   // converts canvas to image data
	const ImageData = canvas.toDataURL('image/png');
	return ImageData;
}


function retake() {
		previews.forEach(img => img.src = ''); // clear previous photos
		photos = [];
		// reset button state
		document.getElementById("snap").style.display = 'block';
		document.getElementById("aftButtons").style.display = "none";
}



// customise.html functions 
async function createStrip(canvas, photos, bgColor='#ffffff') {
 	const images = await Promise.all(photos.map(loadImage));
	// load all images from image string, need wait before drawing onto canvas
	const ctx = canvas.getContext('2d');

	const width = images[0].width; // image string got no width and height
	const height = images[0].height;	
	const gap = 50;
	const padding = 40;
	const bottom_space = 300;

	canvas.width = width + padding*2;
	canvas.height = (height+gap) * images.length + bottom_space;	
	canvas.style.backgroundColor = bgColor

	// draw background on canvas
	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// draw each photo into strip
	// forEach(function for this item, THIS item)
	images.forEach((img, i) => {
		ctx.drawImage(
			img, 
			padding, i * height + (i+1)*gap,   // stack vertically
			width, height
			);
		// drawImage syntax --  drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
		});
	
	return canvas;
}


function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}


async function changeTemplate(canvas, images, bgColor, theme) {
	// draw background + photos first
	await createStrip(canvas, images, bgColor);
	let stickerSrc = '';

	if (theme === 'duck') {
		stickerSrc = 'stickers/duck.png';
	}
	else {
		return canvas;
	}

	// then draw sticker on top
	const sticker = await loadImage(stickerSrc);
	const ctx = canvas.getContext("2d");

	ctx.drawImage(sticker, 0,0, canvas.width, canvas.height); 		
	return canvas;
}


function downloadStrip(imagedata) {
  const link = document.createElement("a");
  link.download = "photostrip.png";
  link.href = imagedata;  // converts canvas to image string
  link.click(); // user doesnt need to click, it will auto download if u hover 
}


if (startB) {
	console.log('yy');
	initIndex();
}

if (video) {
	initTakePhoto();
};

if (stripImage) {
	initCustomise();
};

// when a page loads, the entire javascript runs from scratch