import { v4 as uuidv4 } from "uuid";

export const generatePatientId = (): string => {
  const hex = uuidv4().replace(/-/g, "");
  const chunk = hex.slice(0, 8); 
  const num = parseInt(chunk, 16) % 1000000; 
  const digits = num.toString().padStart(6, "0");
  return `PAT-${digits}`;
};
