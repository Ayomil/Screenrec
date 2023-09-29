let stream = null,
  audio = null,
  mixedStream = null,
  chunks = [],
  recorder = null;
let startButton = null,
  stopButton = null,
  downloadButton = null,
  recordedVideo = null;

async function setupStream() {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    audio = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });

    setupVideoFeedback();
  } catch (err) {
    console.error(err);
  }
}

function setupVideoFeedback() {
  if (stream) {
    const video = document.querySelector(".video-feedback");
    video.srcObject = stream;
    video.play();
  } else {
    console.warn("No stream available");
  }
}

async function startRecording() {
  await setupStream();

  if (stream && audio) {
    mixedStream = new MediaStream([
      ...stream.getTracks(),
      ...audio.getTracks(),
    ]);
    recorder = new MediaRecorder(mixedStream);
    recorder.ondataavailable = handleDataAvailable;
    recorder.onstop = handleStop;
    recorder.start(1000);

    startButton.disabled = true;
    stopButton.disabled = false;

    console.log("Recording started");
  } else {
    console.warn("No stream available.");
  }
}

function stopRecording() {
  recorder.stop();

  startButton.disabled = false;
  stopButton.disabled = true;
}

function handleDataAvailable(e) {
  chunks.push(e.data);
}

function handleStop(e) {
  const blob = new Blob(chunks, { type: "video/mp4" });
  chunks = [];

  const videoName = prompt("Enter a name for the video:");
  if (videoName) {
    // Create a downloadable anchor element
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${videoName}.mp4`;
    a.textContent = "Download Video";
    a.style.display = "block";

    // Append the anchor element to the downloadButton container
    downloadButton.innerHTML = "";
    downloadButton.appendChild(a);
  } else {
    console.warn("No video name entered.");
  }

  recordedVideo.src = URL.createObjectURL(blob);
  recordedVideo.load();
  recordedVideo.onloadeddata = function () {
    const rc = document.querySelector(".recorded-video-wrap");
    rc.classList.remove("hidden");
    rc.scrollIntoView({ behavior: "smooth", block: "start" });

    recordedVideo.play();
  };

  stream.getTracks().forEach((track) => track.stop());
  audio.getTracks().forEach((track) => track.stop());

  console.log("Recording stopped");
}

window.addEventListener("load", () => {
  startButton = document.querySelector(".start-recording");
  stopButton = document.querySelector(".stop-recording");
  downloadButton = document.querySelector(".download-video");
  recordedVideo = document.querySelector(".recorded-video");

  startButton.addEventListener("click", startRecording);
  stopButton.addEventListener("click", stopRecording);
});
