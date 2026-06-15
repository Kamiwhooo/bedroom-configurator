// types/index.ts
export interface RoomColors {
  walls: string;
  ceiling: string;
  floor: string;
  wardrobe: string;
  wardrobeHandle: string;
  bedFrame: string;
  bedsheet: string;
  pillow: string;
  studyTable: string;
  dressingTable: string;
  windowFrame: string;
  balconyDoor: string;
  mirror: string;
  doorFrame: string;
}

export interface RoomConfig {
  colors: RoomColors;
  isNight: boolean;
}

export const ITEM_LABELS: Record<keyof RoomColors, string> = {
  walls: "Walls",
  ceiling: "Ceiling",
  floor: "Hardwood Floor",
  wardrobe: "Wardrobe",
  wardrobeHandle: "Handles & Hardware",
  bedFrame: "Bed Frame",
  bedsheet: "Bed Sheet",
  pillow: "Pillows",
  studyTable: "Study Table",
  dressingTable: "Dressing Table",
  windowFrame: "Window Frames",
  balconyDoor: "Balcony Door",
  mirror: "Mirror Glass",
  doorFrame: "Entry Door",
};

export const DEFAULT_COLORS: RoomColors = {
  walls: "#F2EDE8",
  ceiling: "#FAF8F5",
  floor: "#C4956A",
  wardrobe: "#4A3728",
  wardrobeHandle: "#C9A84C",
  bedFrame: "#2C1F14",
  bedsheet: "#D6E4F0",
  pillow: "#EEF2F7",
  studyTable: "#5C3D2E",
  dressingTable: "#5C3D2E",
  windowFrame: "#7A5C3A",
  balconyDoor: "#6B4F30",
  mirror: "#B8D4E0",
  doorFrame: "#6B4F30",
};
