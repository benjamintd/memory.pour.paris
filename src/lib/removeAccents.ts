export const removeAccents = (str?: string) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/st /g, "saint ")
    .replace(/st-/g, "saint-")
    .replace(/ste /g, "sainte ")
    .replace(/ste-/g, "sainte-")
    .replace(/[^a-z0-9]/g, "");

export default removeAccents;
