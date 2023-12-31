import { useState, useRef } from "react";
const mimeType = "audio/webm";
const AudioRecorder = () => {
    const [permission, setPermission] = useState(false); 
    //uses a boolean value to indicate whether user permission has been given
    const mediaRecorder = useRef(null)
    //holds the data from creating a new MediaRecorder object, given a mediastream to record
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    //sets the current recording status of the recorder. The possible values are recording, inactive and paused
    const [stream, setStream] = useState(null); 
    //contains the mediastream received from the getusermedia method
    const [audioChunks, setAudioChunks] = useState([]);
    //contains encoded chunks of the audio recording
    const [audio, setAudio] = useState(null); 
    //contains a blob URL of the finished audio recording

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };
    const startRecording = async () => {
        setRecordingStatus("recording");
        //create new Media recorder instance using the stream
        const media = new MediaRecorder(stream, { type: mimeType });
        //set the MediaRecorder instance to the mediaRecorder ref
        mediaRecorder.current = media;
        //invokes the start method to start the recording process
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
           if (typeof event.data === "undefined") return;
           if (event.data.size === 0) return;
           localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
      };
      const stopRecording = () => {
        setRecordingStatus("inactive");
        //stops the recording instance
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
          //creates a blob file from the audiochunks data
           const audioBlob = new Blob(audioChunks, { type: mimeType });
          //creates a playable URL from the blob file.
           const audioUrl = URL.createObjectURL(audioBlob);
           setAudio(audioUrl);
           setAudioChunks([]);
        };
      };
    return (
        <div>
            <h2>Audio Recorder</h2>
            <main>
                <div className="audio-controls">
                    {!permission ? (
                        <button onClick={getMicrophonePermission} type="button">
                            Get Microphone
                        </button>
                    ): null}
                    {permission && recordingStatus === "inactive" ? (
                        <button onClick={startRecording} type="button">
                           Start Recording
                        </button>
                    ): null}
                    {recordingStatus === "recording" ? (
                        <button onClick={stopRecording} type=" button">
                          Stop Recording
                        </button>
                    ): null} 
                </div> 
            
            {audio ? (
                <div className="audio-container">
                    <audio src={audio} controls></audio>
                    <a download href={audio}>
                        Download Recording
                    </a>
                </div>

                ) : null}
        
            </main>
        </div>
        
    );
};
export default AudioRecorder;