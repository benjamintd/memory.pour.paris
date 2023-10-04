const getMode = (line: string) => {
  if (line.startsWith("METRO")) {
    return "METRO";
  } else if (line.startsWith("RER")) {
    return "RER";
  } else if (line.startsWith("TRAM")) {
    return "TRAM";
  } else if (line.startsWith("TRAIN")) {
    return "TRAIN";
  } else {
    return "OTHER";
  }
};

export default getMode;
