async function createOffer() {
  const pc = window.pc = new RTCPeerConnection()
  const localVideo = document.getElementById('local')
  const remoteVideo = document.getElementById('remote')

  // Get user's mic and camera
  const stream = await navigator.mediaDevices.getUserMedia({audio: false, video:true})

  localVideo.srcObject = stream

  // add the audio and video tracks to the peer connection
  stream.getTracks().forEach(track => pc.addTrack(track, stream))

  // Create our initial Offer SDP. This does not yet have ICE candidates
  const offerSdpWithoutIceCandidates = await pc.createOffer()

  // A hack to wait until all ICE candidates are collected
  await new Promise(resolve => {
    // This handler will be called once for every candidate
    // the browser finds. When it has found all candidates,
    // event.candidate will be null.
    pc.onicecandidate = event => {
      if (!event.candidate) {
        resolve()
      }
    }

    // Setting the local description will start ICE candidate collection
    pc.setLocalDescription(offerSdpWithoutIceCandidates)
  })

  // Setup handler to render remote video when it's ready
  pc.ontrack = event => {
    remoteVideo.srcObject = event.streams[0]
  }

  // Get the updated offer SDP with ICE candidates
  const offerSdp = pc.localDescription

  return offerSdp.sdp
}

async function createAnswer(offer) {
  const pc = window.pc = new RTCPeerConnection()
  const localVideo = document.getElementById('local')
  const remoteVideo = document.getElementById('remote')

  // Setup handler to render remote video when it's ready
  pc.ontrack = event => {
    remoteVideo.srcObject = event.streams[0]
    remoteVideo.play()
  }

  // Get user's mic and camera
  const stream = await navigator.mediaDevices.getUserMedia({audio: false, video:true})

  localVideo.srcObject = stream

  // add the audio and video tracks to the peer connection
  stream.getTracks().forEach(track => pc.addTrack(track, stream))

  await pc.setRemoteDescription({type: 'offer', sdp: offer})

  const answerSdpWithoutIceCandidates = await pc.createAnswer()

  // A hack to wait until all ICE candidates are collected
  await new Promise(resolve => {
    // This handler will be called once for every candidate
    // the browser finds. When it has found all candidates,
    // event.candidate will be null.
    pc.onicecandidate = event => {
      if (!event.candidate) {
        resolve()
      }
    }

    // Setting the local description will start ICE candidate collection
    pc.setLocalDescription(answerSdpWithoutIceCandidates)
  })

  // Get the updated offer SDP with ICE candidates
  const answerSdp = pc.localDescription

  return answerSdp.sdp
}

function setAnswer(answer) {
  window.pc.setRemoteDescription({type: 'answer', sdp: answer})
}