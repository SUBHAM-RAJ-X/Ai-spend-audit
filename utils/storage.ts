// localStorage handling
interface ToolData {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export const saveToStorage = (data: ToolData[]) => {
  localStorage.setItem("ai-spend-audit-tools", JSON.stringify(data));
};

export const getFromStorage = (): ToolData[] | null => {
  try {
    const data = localStorage.getItem("ai-spend-audit-tools");
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('Error parsing storage data:', error);
    return null;
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.removeItem("ai-spend-audit-tools");
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};