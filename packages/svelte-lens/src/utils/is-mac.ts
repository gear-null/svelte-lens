export const isMac = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    "";
  return /Mac|iPhone|iPod|iPad/i.test(platform);
};
