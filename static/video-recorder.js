var videoelement = document.getElementById("videoelement");
var localStreamConstraints = {
    audio: true,
    video: {
        width: 1920,
        height: 1080,
        facingMode: "user" // Ensure the front camera is used
    },
};

var mediarecorder;
var options = { mimeType: "video/webm; codecs=vp9" };
var recordedChunks = [];

if (videoelement) {
    console.log("we have the video");
    navigator.mediaDevices
        .getUserMedia(localStreamConstraints)
        .then(gotStream)
        .catch(function (e) {
            if (confirm("An error with camera occurred:(" + e.name + ") Do you want to reload?")) {
                location.reload();
            }
        });
}

function gotStream(stream) {
    console.log("Adding local stream.");
    videoelement.srcObject = stream;
    mediarecorder = new MediaRecorder(stream, options);
    mediarecorder.ondataavailable = handleDataAvailable;
    mediarecorder.onstop = download;
}

var recbtn = document.getElementById("recbutton");
if (recbtn) {
    recbtn.addEventListener('click', () => {
        recordedChunks = []; // Clear recorded chunks before starting a new recording
        mediarecorder.start();
    });
}

var stopbtn = document.getElementById("stopbutton");
if (stopbtn) {
    stopbtn.addEventListener('click', () => {
        mediarecorder.stop();
    });
}

function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
        console.log(event.data);
    }
}

function download() {
    var blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });

    // Get the current date including milliseconds
    var now = new Date();
    var timestamp = String(now.getDate()).padStart(2, '0') + "-" +
                    String(now.getMonth() + 1).padStart(2, '0') + "-" +
                    now.getFullYear() + "_" +
                    String(now.getHours()).padStart(2, '0') + "-" +
                    String(now.getMinutes()).padStart(2, '0') + "-" +
                    String(now.getSeconds()).padStart(2, '0') + "-" +
                    String(now.getMilliseconds()).padStart(3, '0');

    var filename = 'profile-video-' + timestamp + '.webm';

    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    // Set the recorded video as the source for the first small video on the left side
    setVideoSource(url);
}

function setVideoSource(url) {
    var videoDiv = document.getElementById("recordedVideos");
    if (videoDiv) {
        var firstVideo = videoDiv.querySelector("video");
        if (!firstVideo) {
            // If there's no video element, create one
            firstVideo = document.createElement("video");
            firstVideo.width = 170;
            firstVideo.height = 120;
            firstVideo.controls = true;
            firstVideo.classList.add("smallVideoBorder", "videoS");
            videoDiv.appendChild(firstVideo);
            videoDiv.appendChild(document.createElement("br"));
        }
        firstVideo.src = url;
        firstVideo.load(); // Ensure the video element loads the new source
        firstVideo.play();
    }
}