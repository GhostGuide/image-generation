
import React, { useState, useCallback } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { CenterPanel } from './components/CenterPanel';
import { RightPanel } from './components/RightPanel';
import type { ReferenceImage, GenerationSettings, HistoryItem, ColorSwatch } from './types';
import { analyzeImages, generateFinalPrompt, generateImages } from './services/geminiService';

const App: React.FC = () => {
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [colorSwatches, setColorSwatches] = useState<ColorSwatch[]>([]);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [latestGeneratedImages, setLatestGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: '9:16',
    stylePreset: 'Pinterest Minimal Studio',
    mode: 'Product Only',
    variantCount: 1,
    seed: null,
    guidanceStrength: 70,
    referenceStrength: 0.8,
    temperature: 0.75,
  });

  const handleClearCanvas = useCallback(() => {
    setReferenceImages([]);
    setPrompt('');
    setColorSwatches([]);
    setLatestGeneratedImages([]);
  }, []);

  const handleAutoPrompt = useCallback(async () => {
    if (referenceImages.length === 0) {
      alert("Please upload at least one reference image.");
      return;
    }
    setIsLoading(true);
    setLoadingMessage("Analyzing images...");
    try {
      const analysis = await analyzeImages(referenceImages);
      // Simple regex to find hex codes in analysis for color swatches
      const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
      const foundColors = analysis.match(hexRegex) || [];
      setColorSwatches([...new Set(foundColors)].map(hex => ({ hex, name: 'Color' })));

      setLoadingMessage("Generating prompt...");
      const result = await generateFinalPrompt(analysis, prompt, settings.stylePreset, settings);
      setPrompt(result.prompt);
    } catch (error) {
      console.error("Error generating prompt:", error);
      alert("Failed to generate prompt. Please check the console for details.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [referenceImages, prompt, settings]);

  const handleGenerate = useCallback(async () => {
    if (referenceImages.length === 0) {
      alert("Please upload at least one reference image.");
      return;
    }
    if (!prompt) {
      alert("Please generate or write a prompt first.");
      return;
    }
    setIsLoading(true);
    setLoadingMessage("Generating images...");
    try {
      const images = await generateImages(prompt, referenceImages);
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        generatedImages: images,
        prompt,
        settings,
        referenceImages,
        timestamp: Date.now(),
      };
      setLatestGeneratedImages(images);
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (error) {
      console.error("Error generating images:", error);
      alert("Failed to generate images. Please check the console for details.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [prompt, referenceImages, settings]);

  return (
    <div className="bg-gray-900 text-gray-200 font-sans flex h-screen overflow-hidden">
       {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}
      <LeftPanel
        settings={settings}
        setSettings={setSettings}
        referenceImages={referenceImages}
        setReferenceImages={setReferenceImages}
      />
      <CenterPanel
        referenceImages={referenceImages}
        prompt={prompt}
        setPrompt={setPrompt}
        colorSwatches={colorSwatches}
        onAutoPrompt={handleAutoPrompt}
        onGenerate={handleGenerate}
        onClearCanvas={handleClearCanvas}
        isLoading={isLoading}
      />
      <RightPanel
        latestImages={latestGeneratedImages.slice(0, settings.variantCount)}
        history={history}
      />
    </div>
  );
};

export default App;
