"use client";

import { useEffect, useState } from "react";

//custom hook to detect if a component has mounted on the client
const useMounted = () => {
  // 'mounted'is false initially
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Once the component mounts, set 'mounted' to true
    setMounted(true);
  }, []); // This runs only once after initial render

  // Return the 'mounted' state
  return mounted;
};
export default useMounted;