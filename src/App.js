import { useEffect, useState } from "react";
import IntroOverlay from "./components/introOverlay";
function App() {
  const [isLoading, setIsLoading] = useState(true);

  // nếu loading bật intro
  if (isLoading) {
    return <IntroOverlay setIsLoading={setIsLoading} />;
  }
  // else Router page
  return (
    <div className="App">
      <div className="text-red-400 bg-black">App</div>
    </div>
  );
}

export default App;
