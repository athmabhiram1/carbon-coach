import { Car, Laptop, Plane, GraduationCap, Leaf, LucideIcon } from "lucide-react";

export interface Persona {
  id: string;
  name: string;
  description: string;
  icon: string; // "car" | "laptop" | "plane" | "school" | "leaf"
  baseline: {
    transport: number;
    diet: number;
    energy: number;
    shopping: number;
  };
}

export const US_NATIONAL_AVERAGE = 16000;

export const personas: Persona[] = [
  {
    id: "daily-commuter",
    name: "Daily Commuter",
    description: "Drives 30 miles daily, occasional flights, standard suburban lifestyle",
    icon: "car",
    baseline: {
      transport: 5200,
      diet: 2500,
      energy: 4800,
      shopping: 1200,
    },
  },
  {
    id: "remote-worker",
    name: "Remote Worker",
    description: "Works from home, minimal commute, higher home energy use",
    icon: "laptop",
    baseline: {
      transport: 1200,
      diet: 2500,
      energy: 6200,
      shopping: 1800,
    },
  },
  {
    id: "frequent-flyer",
    name: "Frequent Flyer",
    description: "Flies monthly for business and leisure, city apartment living",
    icon: "plane",
    baseline: {
      transport: 12000,
      diet: 2500,
      energy: 2800,
      shopping: 2400,
    },
  },
  {
    id: "student",
    name: "Student",
    description: "Dorm or shared housing, mostly plant-based diet, limited budget",
    icon: "school",
    baseline: {
      transport: 1800,
      diet: 1700,
      energy: 1800,
      shopping: 600,
    },
  },
  {
    id: "eco-conscious",
    name: "Eco-Conscious",
    description: "Already uses renewable energy, vegan/vegetarian, minimal consumption",
    icon: "leaf",
    baseline: {
      transport: 2600,
      diet: 1500,
      energy: 2400,
      shopping: 800,
    },
  },
];

export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}

export function getPersonaIconComponent(iconName: string): LucideIcon {
  switch (iconName) {
    case "car":
      return Car;
    case "laptop":
      return Laptop;
    case "plane":
      return Plane;
    case "school":
      return GraduationCap;
    case "leaf":
    default:
      return Leaf;
  }
}

