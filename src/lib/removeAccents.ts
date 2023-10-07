export const removeAccents = (str?: string) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u2010-\u2015]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/st /g, "saint ")
    .replace(/ste /g, "sainte ")
    .replace(/cdg/g, "charles de gaulle")
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/[^a-z0-9]/g, "");

export default removeAccents;
