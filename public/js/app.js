const webcamElement = document.getElementById("webcam");

const canvasElement = document.getElementById("canvas");

const snapSoundElement = document.getElementById("snapSound");

const webcam = new Webcam(
  webcamElement,
  "user",
  canvasElement,
  snapSoundElement
);
let descriptors = { desc1: null, desc2: null };
let first_img = false;

let second_img = false;
const threshold = 0.6;

$("#webcam-switch").change(function () {
  if (this.checked) {
    $(".md-modal").addClass("md-show");
    webcam
      .start()
      .then((result) => {
        cameraStarted();
        console.log("webcam started");
      })
      .catch((err) => {
        displayError();
      });
  } else {
    cameraStopped();
    webcam.stop();
    console.log("webcam stopped");
  }
});

$("#cameraFlip").click(function () {
  webcam.flip();
  webcam.start();
});

$("#closeError").click(function () {
  $("#webcam-switch").prop("checked", false).change();
});

function displayError(err = "") {
  if (err != "") {
    $("#errorMsg").html(err);
  }
  $("#errorMsg").removeClass("d-none");
}

function cameraStarted() {
  $("#errorMsg").addClass("d-none");
  $(".flash").hide();
  $("#webcam-caption").html("on");
  $("#webcam-control").removeClass("webcam-off");
  $("#webcam-control").addClass("webcam-on");
  $(".webcam-container").removeClass("d-none");
  if (webcam.webcamList.length > 1) {
    $("#cameraFlip").removeClass("d-none");
  }
  $("#wpfront-scroll-top-container").addClass("d-none");
  window.scrollTo(0, 0);
  $("body").css("overflow-y", "hidden");
}

function cameraStopped() {
  $("#errorMsg").addClass("d-none");
  $("#wpfront-scroll-top-container").removeClass("d-none");
  $("#webcam-control").removeClass("webcam-on");
  $("#webcam-control").addClass("webcam-off");
  $("#cameraFlip").addClass("d-none");
  $(".webcam-container").addClass("d-none");
  $("#webcam-caption").html("Click to Start Camera");
  $(".md-modal").removeClass("md-show");
}

$("#take-photo").click(function () {
  beforeTakePhoto();
  uploadRefImage();
  afterTakePhoto();
});

function beforeTakePhoto() {
  $(".flash")
    .show()
    .animate({ opacity: 0.3 }, 500)
    .fadeOut(500)
    .css({ opacity: 0.7 });
  window.scrollTo(0, 0);
  $("#webcam-control").addClass("d-none");
  $("#cameraControls").addClass("d-none");
}

function afterTakePhoto() {
  webcam.stop();
  $("#canvas").removeClass("d-none");
  $("#take-photo").addClass("d-none");

  $("#resume-camera").removeClass("d-none");
  $("#cameraControls").removeClass("d-none");

  if (first_img) {
    $("#match-photo").removeClass("d-none");
  } else {
    $("#submit-photo").removeClass("d-none");
  }
}

function removeCapture() {
  $("#canvas").addClass("d-none");
  $("#webcam-control").removeClass("d-none");
  $("#cameraControls").removeClass("d-none");
  $("#take-photo").removeClass("d-none");
  $("#submit-photo").addClass("d-none");
  $("#match-photo").addClass("d-none");
  $("#resume-camera").addClass("d-none");
}

$("#resume-camera").click(function () {
  if (second_img) {
    second_img = false;
  } else if (first_img) {
    first_img = false;
  }
  webcam.stream().then((facingMode) => {
    removeCapture();
  });
});
$("#submit-photo").click(function () {
  webcam.stream().then((facingMode) => {
    //   console.log(facingMode)
    removeCapture();
  });
});

$("#match-photo").click(function () {
  webcam.stop();
  $("#canvas").addClass("d-none");
  $("#take-photo").addClass("d-none");

  $("#resume-camera").addClass("d-none");
  $("#cameraControls").addClass("d-none");

  $("#match-photo").addClass("d-none");

  $("#submit-photo").addClass("d-none");
  $("#first-image").addClass('expand');
  $("#second-image").addClass('expand_second');
  updateResult();
});
function updateResult() {
  const distance = faceapi.utils.round(
    faceapi.euclideanDistance(descriptors.desc1, descriptors.desc2)
  );
  let text = distance;
  let bgColor = "#ffffff";
  if (distance > threshold) {
    text += " (no match)";
    bgColor = "#ce7575";
  }
  console.log(text, bgColor);
  $('#resultmatch').show();
  $('#distance').val(text)
  $('#distance').css('background-color', bgColor)
}
async function uploadRefImage(e) {
  var imageData = dataURLtoFile(webcam.snap());
  const img = await faceapi.bufferToImage(imageData);
  if (!first_img) {
    $("#first-image").children().remove();
    $("#first-image").append(img);
    first_img = true;
    descriptors[`desc${1}`] = await faceapi.computeFaceDescriptor(img);
    console.log(descriptors);
  } else if (first_img && !second_img) {
    $("#second-image").children().remove();
    $("#second-image").append(img);
    second_img = true;
    descriptors[`desc${2}`] = await faceapi.computeFaceDescriptor(img);
  }
}

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

async function run() {
  await faceapi.loadFaceRecognitionModel();
}
$(document).ready(function () {
    $('#resultmatch').hide();
  run();
});
