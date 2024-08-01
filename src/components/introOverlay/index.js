import React, { useEffect, useMemo, useRef, useState } from "react";
import { Howl, Howler } from "howler";
import introSound from "../../assets/sounds/backgrounds/sound.mp3";
import BouncingText from "../Animations/AnimatedCharacters/bouncingText";

const maxIntroTime = 300000;

function IntroOverlay({ setIsLoading }) {
  const [time, setTime] = useState(maxIntroTime);
  const [isStart, setIsStart] = useState(false);
  const [isStop, setIsStop] = useState(false);
  const fadeInRef = useRef(null);
  const fadeOutRef = useRef(null);
  const timeIntervalRef = useRef(null);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioSourceRef = useRef(null);

  const sound = useMemo(
    () =>
      new Howl({
        src: [introSound],
        html5: true,
        // autoplay: true,
        // loop: true,
        volume: 0,
      }),
    []
  );

  // Tăng dần âm lượng khi start
  useEffect(() => {
    if (isStart && sound) {
      fadeInRef.current = setInterval(() => {
        if (sound.volume() < 1) {
          sound.volume(sound.volume() + 0.1);
        } else {
          clearInterval(fadeInRef.current);
        }
      }, 500);
    }
    return () => clearInterval(fadeInRef.current);
  }, [isStart, sound]);

  // Giảm dần âm lượng khi gần hết intro
  useEffect(() => {
    if (isStart) {
      if (time <= 5000 || isStop) {
        clearInterval(fadeInRef.current); // Dừng tăng âm lượng
        fadeOutRef.current = setInterval(() => {
          const newVolume = Math.max(0, sound.volume() - 0.1);
          sound.volume(newVolume);
          if (newVolume <= 0) {
            clearInterval(fadeOutRef.current);
          }
        }, 500);
      }
    }
    return () => clearInterval(fadeOutRef.current);
  }, [time, isStart, isStop, sound]);

  // Kết thúc intro
  useEffect(() => {
    if (time <= 0) {
      sound.stop();
      // Do hàm này nên mất âm thanh sửa giúp tôi
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      setIsLoading(false);
    }
  }, [sound, time, setIsLoading]);

  // Time Effect
  useEffect(() => {
    if (isStart) {
      timeIntervalRef.current = setInterval(() => {
        setTime((prev) => prev - 1000);
      }, 1000);
    }
    return () => clearInterval(timeIntervalRef.current);
  }, [isStart]);

  // vẽ canvas
  const drawLineWaveform = (canvas, ctx) => {
    const analyser = analyserRef.current;

    if (!ctx || !analyser) return;

    // Creating output array (according to documentation https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
    analyser.fftSize = 512;
    // [32, 64, 128, 256, 512, 1024, 2048]
    var bufferLength = analyser.frequencyBinCount;
    // Get the Data array (dữ liệu miền thời gian)
    var timeData = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(timeData);
    // draw
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const sliceWidth = canvasWidth / bufferLength;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // line visualize
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(0, 255, 0)";
    ctx.beginPath();

    for (let i = 0; i < bufferLength; i++) {
      const x = i * sliceWidth;
      const v = timeData[i] / 128.0 - 1;
      const y = canvasHeight / 2 + (canvasHeight * v) / 2;
      const color = Math.floor((255 * (v + 1)) / 2);
      ctx.strokeStyle = `rgb(${color}, ${255 - color}, 0)`;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  const draColWaveform = (canvas, ctx) => {
    const analyser = analyserRef.current;

    if (!ctx || !analyser) return;

    // Creating output array (according to documentation https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
    analyser.fftSize = 512;
    // [32, 64, 128, 256, 512, 1024, 2048]
    var bufferLength = analyser.frequencyBinCount;
    //Get the Data array (dữ liệu phổ )
    var frequencyData = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(frequencyData);

    // draw
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Bar visualize
    const barWidth = (canvasWidth / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      barHeight = frequencyData[i] / 2;

      ctx.fillStyle = `rgb(${barHeight + 100} 50 50)`;
      ctx.fillRect(x, canvasHeight - barHeight / 2, barWidth, barHeight);

      x += barWidth + 1;
    }
  };
  // Function to calculate average frequency value
  const getAvg = (dataArray) => {
    const total = dataArray.reduce((sum, value) => sum + value, 0);
    return total / dataArray.length;
  };
  const drawWaveformCircle = (w, h, ctx) => {
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;
    // get data bound
    // analyser.fftSize = 1024;
    // [32, 64, 128, 256, 512, 1024, 2048]
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    // get data for circle
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) / 6; // Radius of the circle
    const waveDetail = 360; // Number of points for the wave
    const waveAmplitude = 20; // Amplitude of the wave
    const avg = getAvg(dataArray) * gainNodeRef.current.gain.value;
    // start path main line
    ctx.beginPath();
    // style path
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    // create circle
    ctx.arc(centerX, centerY, avg + radius, Math.PI * 2, false);
    // start draw
    ctx.stroke();
    // end path
    ctx.closePath();
    // Draw wave outline
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;

    const waveRadius = avg + radius;
    const step = Math.floor(bufferLength / waveDetail);

    for (let i = 0; i <= waveDetail; i++) {
      const angle = (i / waveDetail) * Math.PI * 2;
      const dataIdx = i * step;
      const pointRadius =
        waveRadius + (dataArray[dataIdx] / 255.0) * waveAmplitude;
      const x = centerX + pointRadius * Math.cos(angle);
      const y = centerY + pointRadius * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.stroke();
  };
  const updateWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    // Clear canvas each call
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawLineWaveform(canvas, ctx);
    draColWaveform(canvas, ctx);
    drawWaveformCircle(canvasWidth, canvasHeight, ctx);
    animationIdRef.current = requestAnimationFrame(updateWaveform);
  };
  // Create abalyzer, conncect to media source(bài nhạc đang play), connect to destination (thiết bị đầu ra), set canvas size
  const setCanvasSize = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = 500;
    }
  };
  useEffect(() => {
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    if (sound && !analyserRef.current) {
      const analyser = Howler.ctx.createAnalyser();
      analyserRef.current = analyser;
      if (!gainNodeRef.current) {
        gainNodeRef.current = Howler.ctx.createGain();
        gainNodeRef.current.gain.value = 1;
        gainNodeRef.current.connect(analyser);
      }
      if (!audioSourceRef.current) {
        audioSourceRef.current = Howler.ctx.createMediaElementSource(
          sound._sounds[0]._node
        );
        // audioSourceRef.current.disconnect();
        audioSourceRef.current.connect(analyser);
        analyser.connect(Howler.ctx.destination);
      }
    }
    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [sound]);

  const handleStart = () => {
    if (!sound.playing()) {
      sound.play();
      setIsStart(true);
      updateWaveform(); // Bắt đầu vẽ sóng âm thanh
    }
  };

  const handleStop = () => {
    if (sound.playing()) {
      setIsStop(true);
      setTime(5000); // set time về 5s
    }
  };

  return (
    <div className="h-screen w-screen bg-black relative">
      <div className="text-white text-2xl font-semibold">
        LOADING
        <BouncingText
          className="text-white text-2xl font-semibold"
          text={" ..."}
          displacement={10}
          duration={500}
          endTime={5000}
        />
      </div>
      <p className="text-white">{Math.floor(time / 1000)}</p>

      <div
        className="text-white p-2 bg-purple-500 border-1 cursor-pointer"
        onClick={handleStart}
      >
        Press to start
      </div>
      <div
        className="text-white p-2 bg-red-500 border-1 cursor-pointer"
        onClick={handleStop}
      >
        Press to stop
        {isStop && (
          <div className="text-white">
            {"Intro stop in " + Math.floor(time / 1000)}
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        id="waveformCanvas"
        // className="fixed inset-0 pointer-events-none"
        height="800px"
      ></canvas>
    </div>
  );
}

export default IntroOverlay;
