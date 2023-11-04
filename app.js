const localAudio = document.getElementById("localAudio");
const remoteAudio = document.getElementById("remoteAudio");
const startButton = document.getElementById("startButton");
const hangupButton = document.getElementById("hangupButton");

let localStream;
let peerConnection;

// Constraints for accessing the microphone
const constraints = { audio: true, video: false };

// Handle the Start Call button click
startButton.addEventListener("click", startCall);

// Handle the Hang Up button click
hangupButton.addEventListener("click", hangUp);

async function startCall() {
  try {
    // Get user media (microphone)
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localAudio.srcObject = localStream;

    // Create an RTCPeerConnection
    peerConnection = new RTCPeerConnection();

    // Add the local stream to the peer connection
    localStream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, localStream));

    // Create an offer to send to the remote peer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Signaling: Send the offer to the remote peer (replace with your signaling method)
    sendMessage({ offer: offer });

    // Handle ICE candidate events for signaling
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send the candidate to the remote peer
        sendMessage({ iceCandidate: event.candidate });
      }
    };

    // Set up the remote peer's ontrack event
    peerConnection.ontrack = (event) => {
      remoteAudio.srcObject = event.streams[0];
    };

    // Set up the remote peer's answer
    // (You need a signaling mechanism to exchange the remote peer's answer)
  } catch (error) {
    console.error("Error starting call:", error);
  }
}

function hangUp() {
  // Close the peer connection
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  // Stop the local audio stream
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  // Clear audio elements
  localAudio.srcObject = null;
  remoteAudio.srcObject = null;
}
