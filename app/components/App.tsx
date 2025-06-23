"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider";
import Visualizer from "./Visualizer";

const App: () => JSX.Element = () => {
  const [caption, setCaption] = useState<string | undefined>("Speaking?...");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } =
    useMicrophone();
  const captionTimeout = useRef<any>();
  const keepAliveInterval = useRef<any>();
  const transcriptRef = useRef("");

  useEffect(() => {
    setupMicrophone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  const toggleListening = () => {
    if (isListening) {
      stopMicrophone();
      setIsListening(false);
    } else {
      startMicrophone();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (!microphone) return;
    if (!connection) return;

    const onData = (e: BlobEvent) => {
      // iOS SAFARI FIX:
      // Prevent packetZero from being sent. If sent at size 0, the connection will close. 
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      let thisCaption = data.channel.alternatives[0].transcript;

      if (thisCaption !== "") {
        setCaption(thisCaption);
        
        // Update transcript in real-time
        if (isFinal) {
          transcriptRef.current += " " + thisCaption;
          setTranscript(transcriptRef.current);
        } else {
          // For interim results, show current transcript + the new text
          setTranscript(transcriptRef.current + " " + thisCaption);
        }
      }

      if (isFinal && speechFinal) {
        clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {
          setCaption(undefined);
          clearTimeout(captionTimeout.current);
        }, 3000);
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      if (isListening) {
        startMicrophone();
      }
    }

    return () => {
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState, isListening]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState, connectionState]);

  const clearTranscript = () => {
    setTranscript("");
    transcriptRef.current = "";
  };

  return (
    <>
      <div className="flex h-full antialiased border-4 rounded-lg border-blue-600">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <div className="flex flex-col flex-auto h-full">
            {/* Controls section */}
            <div className="flex justify-center items-center p-4 gap-4">
              <button
                onClick={toggleListening}
                className={`px-6 py-2 rounded-full text-white font-medium ${
                  isListening ? "bg-red-500" : "bg-green-500"
                }`}
              >
                {isListening ? "Stop" : "Start"}
              </button>
              <button
                onClick={clearTranscript}
                className="px-6 py-2 rounded-full bg-red-500 text-white font-medium"
              >
                Clear
              </button>
            </div>

            {/* Visualizer area */}
            <div className="relative w-full h-[60vh]">
              {microphone && <Visualizer microphone={microphone} />}
              <div className="absolute bottom-[8rem] inset-x-0 max-w-4xl mx-auto text-center">
                {caption && <span className="bg-gray-200 px-2 py-1 text-gray-700">{caption}</span>}
              </div>
            </div>

            {/* Transcript area */}
            <div className="p-4 flex-1">
              <textarea
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  transcriptRef.current = e.target.value;
                }}
                className="w-full bg-blue-200 text-black h-full p-4 border border-gray-300 rounded-lg resize-none placeholder:text-black"
                placeholder="Your transcription will appear here..."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;