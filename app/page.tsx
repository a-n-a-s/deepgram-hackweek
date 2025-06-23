"use client";

import App from "./components/App";
import { XIcon } from "./components/icons/XIcon";
import { LinkedInIcon } from "./components/icons/LinkedInIcon";
import { FacebookIcon } from "./components/icons/FacebookIcon";

const Home = () => {
  return (
    <>
      {/* height 100% minus 8rem */}
      <main className="mx-auto  px-4 md:px-6 lg:px-8 h-[calc(100%-4rem)] -mb-[4rem]">
        <App />
      </main>
    </>
  );
};

export default Home;
