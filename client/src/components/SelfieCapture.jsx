import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FiCamera, FiRefreshCw, FiCheck } from 'react-icons/fi';

const videoConstraints = {
  width: 400,
  height: 300,
  facingMode: 'user',
};

const SelfieCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      onCapture && onCapture(imageSrc);
    }
  }, [onCapture]);

  const retake = () => {
    setCapturedImage(null);
    onCapture && onCapture(null);
  };

  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-xl p-8 border-2 border-dashed border-gray-300">
        <FiCamera className="text-gray-400 mb-2" size={36} />
        <p className="text-sm text-gray-500 text-center">
          Camera access denied or not available.<br />
          <span className="text-xs">Please allow camera permission and refresh.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!capturedImage ? (
        <>
          <div className="rounded-xl overflow-hidden border-2 border-blue-200 shadow-md">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMediaError={() => setCameraError(true)}
              className="block"
              style={{ width: 400, height: 300 }}
            />
          </div>
          <button
            type="button"
            onClick={capture}
            className="btn-primary flex items-center gap-2"
          >
            <FiCamera size={16} />
            Take Selfie
          </button>
        </>
      ) : (
        <>
          <div className="relative rounded-xl overflow-hidden border-2 border-green-400 shadow-md">
            <img
              src={capturedImage}
              alt="Captured selfie"
              className="block"
              style={{ width: 400, height: 300, objectFit: 'cover' }}
            />
            <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
              <FiCheck size={16} />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={retake}
              className="btn-secondary flex items-center gap-2"
            >
              <FiRefreshCw size={16} />
              Retake
            </button>
            <span className="text-sm text-green-600 font-medium self-center">
              ✓ Selfie captured
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default SelfieCapture;
