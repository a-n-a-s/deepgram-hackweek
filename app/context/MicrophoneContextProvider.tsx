"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface MicrophoneContextType {
  microphone: MediaRecorder | null;
  startMicrophone: () => void;
  stopMicrophone: () => void;
  setupMicrophone: () => void;
  microphoneState: MicrophoneState | null;
}

export enum MicrophoneEvents {
  DataAvailable = "dataavailable",
  Error = "error",
  Pause = "pause",
  Resume = "resume",
  Start = "start",
  Stop = "stop",
}

export enum MicrophoneState {
  NotSetup = -1,
  SettingUp = 0,
  Ready = 1,
  Opening = 2,
  Open = 3,
  Error = 4,
  Pausing = 5,
  Paused = 6,
  Stopped = 7,
}

const MicrophoneContext = createContext<MicrophoneContextType | undefined>(
  undefined
);

interface MicrophoneContextProviderProps {
  children: ReactNode;
}

const MicrophoneContextProvider: React.FC<MicrophoneContextProviderProps> = ({
  children,
}) => {
  const [microphoneState, setMicrophoneState] = useState<MicrophoneState>(
    MicrophoneState.NotSetup
  );
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);

  const setupMicrophone = async () => {
    setMicrophoneState(MicrophoneState.SettingUp);

    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      const microphone = new MediaRecorder(userMedia);
      
      // Add event listeners to track state changes
      microphone.onstart = () => {
        setMicrophoneState(MicrophoneState.Open);
      };
      
      microphone.onpause = () => {
        setMicrophoneState(MicrophoneState.Paused);
      };
      
      microphone.onresume = () => {
        setMicrophoneState(MicrophoneState.Open);
      };
      
      microphone.onstop = () => {
        setMicrophoneState(MicrophoneState.Stopped);
      };
      
      microphone.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setMicrophoneState(MicrophoneState.Error);
      };

      setMicrophoneState(MicrophoneState.Ready);
      setMicrophone(microphone);
    } catch (err: any) {
      console.error(err);
      setMicrophoneState(MicrophoneState.Error);
      throw err;
    }
  };

  const stopMicrophone = useCallback(() => {
    if (!microphone) return;

    setMicrophoneState(MicrophoneState.Pausing);
    
    if (microphone.state === "recording") {
      microphone.pause();
    } else if (microphone.state === "inactive") {
      setMicrophoneState(MicrophoneState.Stopped);
    }
  }, [microphone]);

  const startMicrophone = useCallback(() => {
    if (!microphone) return;

    setMicrophoneState(MicrophoneState.Opening);

    if (microphone.state === "paused") {
      microphone.resume();
    } else if (microphone.state === "inactive") {
      microphone.start(250);
    }
    // If already recording, do nothing
  }, [microphone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (microphone) {
        if (microphone.state === "recording") {
          microphone.stop();
        }
        microphone.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [microphone]);

  return (
    <MicrophoneContext.Provider
      value={{
        microphone,
        startMicrophone,
        stopMicrophone,
        setupMicrophone,
        microphoneState,
      }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};

function useMicrophone(): MicrophoneContextType {
  const context = useContext(MicrophoneContext);

  if (context === undefined) {
    throw new Error(
      "useMicrophone must be used within a MicrophoneContextProvider"
    );
  }

  return context;
}

export { MicrophoneContextProvider, useMicrophone };