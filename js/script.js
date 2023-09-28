let video;
let poseNet;
let pose;
let skeleton;
let brain;
let a, i;
var k;
var selectedLabel;
let o;
let state = "waiting";
let targetLabel;

/*
async function startProgram() {
 //o = await prompt("Please enter the asana you want help with :- ");
 
  //setup(); 

  //const asanaSelect = document.getElementById("asana-select");
  //o = asanaSelect.value; // Assign the value when the user presses start
  setup();
// setup();
}
*/

 // Start the program when the page loads

function setup() {
    const asanaSelect = document.getElementById("asana-select");
    o = asanaSelect.value;
    if(o!=0){
        createCanvas(640, 480);

  // Request camera access permission
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      // Create a video element to display the camera feed
      video = createCapture({
        video: { mandatory: { minWidth: 640, minHeight: 480 } },
        audio: false,
      });
      video.elt.srcObject = stream; // Assign the camera stream to the video element
      video.hide();

      poseNet = ml5.poseNet(video, modelLoaded);
      poseNet.on("pose", gotPoses);

      let options = {
        inputs: 34,
        outputs: 3,
        task: "classification",
        debug: true,
      };
      brain = ml5.neuralNetwork(options);
      const modelInfo = {
        model: "models/model.json",
        metadata: "models/model_meta.json",
        weights: "models/model.weights.bin",
      };
      brain.load(modelInfo, brainLoaded);
    })
    .catch(function (error) {
      // User denied camera access or other error occurred
      console.error("Error accessing camera:", error);
    });
    }
}

function brainLoaded() {
  console.log("Pose Classification Ready!");
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
    selectedValue = o;
    //selectedValue='uttana shishoasana';
    //if(selectedValue != 0){}
    k = selectedValue;
    if (pose) {
      if (results && results.length > 0) {
        for (i = 0; i < 20; i++) {
          if (results[i].label == k) {
            selectedLabel = i;
          }
        }
  
        //}
  
        //k=selectedLabel;
        console.log(results[selectedLabel].confidence);
        console.log(o);
  
        // Set the value of the range element to the confidence value
        document.getElementById("myRange").value =
          results[selectedLabel].confidence;
  
        // Update the label with the confidence value
        document.getElementById("rangeLabel").innerHTML =
          results[selectedLabel].confidence.toFixed(9);
  
        // Check if the confidence value is greater than 0.5
        if (results[selectedLabel].confidence > 0.5) {
          // Create a new Audio object
          var audio = new Audio();
  
          // Set the audio file to play
          audio.src = "sounds/ring_sound.mp3";
  
          // Set the volume to full (1)
          audio.volume = 1;
  
          // Play the audio file
          audio.play();
        }
      }
    }
    classifyPose();
  }

  function gotPoses(poses) {
    //console.log(poses);
  
    if (poses.length > 0) {
      pose = poses[0].pose;
      skeleton = poses[0].skeleton;
  
      if (state == "collecting") {
        let inputs = [];
        for (let i = 0; i < pose.keypoints.length; i++) {
          let x = pose.keypoints[i].position.x;
          let y = pose.keypoints[i].position.y;
          //let score = pose.keyPoints[i].score;
          inputs.push(x);
          inputs.push(y);
          //inputs.push(score);
        }
        let target = [targetLabel];
  
        brain.addData(inputs, target);
      }
    }
  }

function modelLoaded() {
  console.log("poseNet ready");
}

function draw() {
    if (video) {
      image(video, 0, 0);
      //background(200);
  
      translate(video.width, 0);
      scale(-1, 1);
      image(video, 0, 0, video.width, video.height);
  
      if (pose) {
        let eyeR = pose.rightEye;
        let eyeL = pose.leftEye;
        let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
        fill(0, 255, 255);
        ellipse(pose.nose.x, pose.nose.y, d / 2);
        fill(0, 255, 255);
        ellipse(pose.rightWrist.x, pose.rightWrist.y, 16);
        ellipse(pose.leftWrist.x, pose.leftWrist.y, 16);
  
        for (let i = 0; i < pose.keypoints.length; i++) {
          let x = pose.keypoints[i].position.x;
          let y = pose.keypoints[i].position.y;
          fill(0, 255, 255);
          ellipse(x, y, 16, 16);
        }
        for (let i = 0; i < skeleton.length; i++) {
          let a = skeleton[i][0];
          let b = skeleton[i][1];
          strokeWeight(2);
          stroke(0, 255, 255);
          line(a.position.x, a.position.y, b.position.x, b.position.y);
        }
      }
    }
  }
  

document.addEventListener("DOMContentLoaded", function () {
  const optionsDiv = document.getElementById("options-div");
  const countdownDiv = document.getElementById("countdown-div");
  const countdownTimer = document.getElementById("countdown-timer");
  const countdownMessage = document.getElementById("countdown-message");
  const asanaSelect = document.getElementById("asana-select");
  const timeLimitInput = document.getElementById("time-limit");
  const startButton = document.getElementById("start-button");
  const mainContent = document.getElementById("main-content");
  const form = document.querySelector('form');
  const canvas = document.querySelector('canvas');


  startButton.addEventListener("click", function () {
    const selectedAsana = asanaSelect.value;
    console.log(selectedAsana)
    const timeLimit = parseInt(timeLimitInput.value);
    let timer = timeLimit;

    // Hide options, show countdown
    optionsDiv.style.display = "none";
    countdownDiv.style.display = "block";

    countdownMessage.textContent = `Please be ready for the ${selectedAsana} asana`;

    // Display countdown
    countdownTimer.textContent = timer;

    const countdownInterval = setInterval(function () {
      timer--;

      if (timer >= 0) {
        countdownTimer.textContent = timer;
      } else {
        clearInterval(countdownInterval);
        // Show main content here
        mainContent.style.display = "block";
        // Hide countdown div
        countdownDiv.style.display = "none";
        form.style.display="block";
        canvas.style.display="block";

        startProgram();

        // Include the sketch.js script dynamically with the correct relative path
        // const sketchScript = document.createElement("script");
        //sketchScript.src = "js/sketch.js"; // Modify the path as needed
        //document.body.appendChild(sketchScript);
        //body.style.display="none";
        
        // sketch.js
        // Use jQuery to load sketch.js dynamically
       
        // You can add your logic for displaying the main content after the timer
      }
    }, 1000);
  });
});
