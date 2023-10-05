export const removeAccents = (str?: string) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/st /g, "saint ")
    .replace(/st-/g, "saint-")
    .replace(/ste /g, "sainte ")
    .replace(/ste-/g, "sainte-")
    .replace(/cdg-/g, "charles de gaulle")
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/[^a-z0-9]/g, "");

export default removeAccents;
