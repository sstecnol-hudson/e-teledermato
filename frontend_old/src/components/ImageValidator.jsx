import React, { useState, useRef } from 'react';
import { Camera, Check, X, AlertCircle } from 'lucide-react';

const ImageValidator = ({ onValidImage, imageType, description }) => {
  const [preview, setPreview] = useState(null);
  const [validating, setValidating] = useState(false);
  const [checks, setChecks] = useState({
    resolution: null,
    brightness: null,
    isFocused: null
  });
  const fileInputRef = useRef(null);

  const validateImage = (file) => {
    setValidating(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 1. Resolution Check (> 2MP recommended)
        const resolution = (img.width * img.height) / 1000000;
        const resOk = resolution >= 2;

        // 2. Brightness Check (using canvas)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let brightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          brightness += (data[i] + data[i+1] + data[i+2]) / 3;
        }
        brightness = brightness / (data.length / 4);
        
        // Typical brightness range 50-200
        const brightOk = brightness > 40 && brightness < 220;

        // 3. Real Focus check (Heuristic: Contrast/Edge detection)
        // We use a simplified Laplacian-like check by comparing adjacent pixels
        let contrast = 0;
        for (let i = 0; i < data.length - 4; i += 4) {
          const lum = (data[i] + data[i+1] + data[i+2]) / 3;
          const nextLum = (data[i+4] + data[i+5] + data[i+6]) / 3;
          contrast += Math.abs(lum - nextLum);
        }
        const avgContrast = contrast / (data.length / 4);
        
        // Threshold for "focused" (heuristic value)
        const focusOk = avgContrast > 10;

        setChecks({
          resolution: resOk,
          brightness: brightOk,
          isFocused: focusOk
        });
        
        setPreview(e.target.result);
        setValidating(false);
        
        if (resOk && brightOk && focusOk) {
          onValidImage(file, { resolution: resOk, brightness: brightOk, isFocused: focusOk });
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) validateImage(file);
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center">
      <h3 className="text-sm font-bold text-gray-700 mb-1 uppercase">{imageType}</h3>
      {description && <p className="text-[10px] text-gray-500 mb-3">{description}</p>}
      
      {!preview ? (
        <label className="cursor-pointer flex flex-col items-center py-6">
          <div className="bg-blue-50 p-4 rounded-full text-blue-600 hover:bg-blue-100 transition-colors">
            <Camera size={32} />
          </div>
          <span className="mt-2 text-xs text-gray-500 font-medium">Clique para capturar</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="w-full space-y-4">
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg border shadow-inner" />
            <button 
              onClick={() => setPreview(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Resolução (mín 2MP)</span>
              {checks.resolution ? <Check size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-500" />}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Iluminação Adequada</span>
              {checks.brightness ? <Check size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-500" />}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Foco Detectado</span>
              {checks.isFocused ? <Check size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-gray-400" />}
            </div>
          </div>
          
          {(!checks.resolution || !checks.brightness || !checks.isFocused) && (
            <p className="text-[10px] text-red-500 font-bold text-center leading-tight">
              Qualidade insuficiente (verifique resolução, brilho e foco). Por favor, capture novamente.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageValidator;
