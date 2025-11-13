
export interface ReferenceImage {
  id: string;
  file: File;
  previewUrl: string;
}

export type AspectRatio = "9:16" | "3:4" | "4:5" | "1:1" | "16:9" | "Custom";

export type StylePreset = 
  | "Pinterest Minimal Studio"
  | "Soft Pastel Aesthetic"
  | "Luxury Editorial"
  | "Outdoor Lifestyle"
  | "High Fashion Runway"
  | "Clean Flatlay"
  | "Jewelry Macro";

export type Mode = "Product Only" | "Model Wearing" | "Mixed (dynamic)";

export interface GenerationSettings {
  aspectRatio: AspectRatio;
  stylePreset: StylePreset;
  mode: Mode;
  variantCount: 1 | 2 | 4;
  seed: number | null;
  guidanceStrength: number;
  referenceStrength: number;
  temperature: number;
}

export interface HistoryItem {
  id: string;
  generatedImages: string[];
  prompt: string;
  settings: GenerationSettings;
  referenceImages: ReferenceImage[];
  timestamp: number;
}

export interface ColorSwatch {
  hex: string;
  name: string;
}
