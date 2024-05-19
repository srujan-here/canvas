import React, { useRef, useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import "./CanvasEditor.css";

const CanvasEditor = () => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [adContent, setAdContent] = useState(
    "Treat yourself to a divine Blueberry Cake - INR 900.00!"
  );
  const [ctaText, setCtaText] = useState("Shop now");
  const [currentColor, setCurrentColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#0369A1");
  const [colorHistory, setColorHistory] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (image) {
      drawImageOnCanvas(image);
    }
  }, [adContent, ctaText, currentColor, backgroundColor]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      drawImageOnCanvas(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAdContentChange = (e) => {
    setAdContent(e.target.value);
  };

  const handleCtaTextChange = (e) => {
    setCtaText(e.target.value);
  };

  const handleColorChange = (color) => {
    setCurrentColor(color.hex);
    updateColorHistory(color.hex);
    setShowColorPicker(false);
  };

  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color.hex);
  };

  const updateColorHistory = (color) => {
    setColorHistory((prevHistory) => {
      const newHistory = [color, ...prevHistory.filter((c) => c !== color)];
      return newHistory.slice(0, 5);
    });
  };

  const handleColorSelect = (color) => {
    setCurrentColor(color);
  };

  const handleEyeDropper = async () => {
    if ("EyeDropper" in window) {
      const eyeDropper = new window.EyeDropper();
      try {
        const result = await eyeDropper.open();
        setCurrentColor(result.sRGBHex);
        updateColorHistory(result.sRGBHex);
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("EyeDropper API is not supported in your browser.");
    }
  };

  const drawImageOnCanvas = (imgSrc) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw ad content background
      ctx.fillStyle = "white";
      ctx.fillRect(10, canvas.height - 120, canvas.width - 20, 60);

      // Draw ad content text
      ctx.fillStyle = "black";
      ctx.font = "16px Arial";
      wrapText(ctx, adContent, 20, canvas.height - 90, canvas.width - 40, 20);

      // Draw CTA button background
      ctx.fillStyle = currentColor;
      const buttonX = canvas.width - 120;
      const buttonY = canvas.height - 50;
      const buttonWidth = 100;
      const buttonHeight = 40;
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

      // Draw CTA button text
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "14px Arial";
      ctx.fillText(
        ctaText,
        buttonX + buttonWidth / 2,
        buttonY + buttonHeight / 2 + 5
      );
    };
  };

  // Helper function to wrap text
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  };

  return (
    <div className="container">
      <div className="left">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="canvas"
        ></canvas>
      </div>
      <div className="right">
        <div className="mb-4">
          <label>Change the ad creative image:</label>
          <input type="file" onChange={handleImageChange} />
        </div>
        <div className="mb-4">
          <label>Ad Content</label>
          <input
            type="text"
            value={adContent}
            onChange={handleAdContentChange}
          />
        </div>
        <div className=" my-10">
          <label>CTA</label>
          <input type="text" value={ctaText} onChange={handleCtaTextChange} />
        </div>
        <div className="mb-4">
          <label>Choose your color</label>
          <div className="color-picker">
            {colorHistory.map((color, index) => (
              <div
                key={index}
                className="color-swatch"
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              ></div>
            ))}
            {showColorPicker ? (
              <SketchPicker color={currentColor} onChange={handleColorChange} />
            ) : (
              <button
                className="color-picker-button"
                onClick={() => setShowColorPicker(true)}
              >
                +
              </button>
            )}
            <button className="eyedropper-button" onClick={handleEyeDropper}>
              Pick from page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
