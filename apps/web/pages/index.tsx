import Link from "next/link";
import { Satellite } from "lucide-react";

const LandingPage = () => {
  return (
    <div
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)",
      }}
      className="h-screen w-full overflow-x-hidden bg-no-repeat bg-cover bg-center flex flex-row items-end justify-end"
    >
      <div className="flex flex-col justify-center w-full md:w-1/2 h-full gap-12 px-8 md:px-16 text-white">
        <div className="flex items-center gap-4">
          <Satellite className="w-12 h-12 text-blue-400" />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            LunarLens
          </h1>
        </div>
        <h2 className="text-3xl md:text-5xl font-semibold">
          Analyze the Lunar Cosmos
        </h2>
        <p className="text-lg md:text-xl text-gray-200 max-w-lg">
          Unlock the secrets of the Moon through advanced X-ray fluorescence
          (XRF) spectrum analysis. Visualize elemental compositions, detect
          peaks, and explore lunar surface data with precision.
        </p>
        <Link href="/fits-viewer">
          <button className="rounded-full w-48 p-3 text-xl text-white border-2 border-white hover:bg-white hover:text-gray-900 transition-colors duration-300">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
