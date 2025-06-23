import React, { useEffect, useRef } from "react";

const interpolateColor = (
  startColor: number[],
  endColor: number[],
  factor: number
): number[] => {
  const result = [];
  for (let i = 0; i < startColor.length; i++) {
    result[i] = Math.round(
      startColor[i] + factor * (endColor[i] - startColor[i])
    );
  }
  return result;
};

const Visualizer = ({ microphone }: { microphone: MediaRecorder }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  useEffect(() => {
    const source = audioContext.createMediaStreamSource(microphone.stream);
    source.connect(analyser);

    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = (): void => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    if (!context) return;

    context.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;
    const startColor = [19, 239, 147];
    const endColor = [20, 154, 251];

    // Draw circular visualization
    const bars = 180; // Number of bars in the circle
    const step = Math.PI * 2 / bars;
    
    for (let i = 0; i < bars; i++) {
      const value = dataArray[i % dataArray.length];
      const radius = maxRadius * (value / 255) + 10; // Add minimum radius
      
      const interpolationFactor = value / 255;
      const color = interpolateColor(startColor, endColor, interpolationFactor);
      
      const angle = step * i;
      const x1 = centerX + Math.cos(angle) * 10;
      const y1 = centerY + Math.sin(angle) * 10;
      const x2 = centerX + Math.cos(angle) * radius;
      const y2 = centerY + Math.sin(angle) * radius;
      
      // Draw a line from center to outer point
      context.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
      
      // Draw a circle at the end point
      context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`;
      context.beginPath();
      context.arc(x2, y2, 2, 0, Math.PI * 2);
      context.fill();
    }
    
    // Optional: Add a center circle
    context.fillStyle = "rgba(20, 154, 251, 0.2)";
    context.beginPath();
    context.arc(centerX, centerY, 10, 0, Math.PI * 2);
    context.fill();
  };

  return <canvas ref={canvasRef} width={window.innerWidth}></canvas>;
};

export default Visualizer;