const pushEvent = (matches: string[]) => {
  if (matches.length === 0) return;

  fetch("https://www.metro-memory.com/api/count", {
    method: "POST",
    body: JSON.stringify({
      matches,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const usePushEvent = () => {
  return (matches: (string | number)[]) =>
    pushEvent(matches.map((match) => `paris-${match}`));
};

export default usePushEvent;
