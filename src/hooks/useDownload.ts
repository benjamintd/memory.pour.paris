import { useCallback, useEffect, useRef } from "react";

const useDownload = (localStorageLocation: string, fileName?: string) => {
  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    const data = window.localStorage.getItem(localStorageLocation) || "[]";
    const content = btoa(data);

    const targetUrl = `data:application/octet-stream;base64,${content}`;
    a.href = targetUrl;

    if (!fileName) {
      a.target = "__blank";
    } else {
      a.download = fileName;
    }
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    // also copy the content to clipboard
    navigator.clipboard.writeText(data);
  }, [localStorageLocation, fileName]);

  return handleDownload;
};

export default useDownload;
