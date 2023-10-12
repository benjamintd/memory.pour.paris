const useUpload = (setFound: (list: number[]) => void) => {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      if (typeof content === "string") {
        setFound(JSON.parse(content));
      }
    };
    reader.readAsText(file);
  };

  return handleUpload;
};

export default useUpload;
