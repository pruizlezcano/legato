import { useScroll, useTransform, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import heroImgDark from '../assets/legato-screenshot-dark.png';
import heroImgLight from '../assets/legato-screenshot-light.png';

function Header({ translate }: { translate: any }) {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="grid place-items-center mb-20 mt-32 md:mt-0"
    >
      <h1 className="text-7xl font-bold tracking-tight m-1 animate-fade-in-down">
        Legato
      </h1>
      <p className="text-sm font-news italic animate-fade-in animate-delay-400">
        The manager for your Ableton projects
      </p>
      <div className="flex flex-row space-x-2 mt-4 animate-fade-in-up animate-delay-800">
        <a href="/legato/getting-started">
          <button
            className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-md cursor-pointer text-sm"
            type="button"
          >
            Get started
          </button>
        </a>
        <a
          href="https://github.com/pruizlezcano/legato"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button
            className="text-white p-2 bg-gray-400 rounded-md cursor-pointer text-sm"
            type="button"
          >
            GitHub
          </button>
        </a>
      </div>
    </motion.div>
  );
}

export function Card({ rotate, scale }: { rotate: any; scale: any }) {
  const [heroImg, setHeroImg] = useState(heroImgLight.src);

  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme');
    const img = theme === 'dark' ? heroImgDark.src : heroImgLight.src;
    setHeroImg(img);
  }, []);

  return (
    <motion.div
      style={{
        rotateX: rotate, // rotate in X-axis
        scale,
      }}
      className="rounded-lg md:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-fade-in animate-delay-[1300ms]"
    >
      <img
        src={heroImg}
        alt="Legato screenshot"
        className="rounded-lg md:rounded-2xl"
        width="100%"
        height="100%"
      />
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="md:pt-32 md:pb-20 flex items-center justify-center"
      ref={ref}
    >
      <div
        className="w-full"
        style={{
          perspective: '1000px',
        }}
      >
        <Header translate={translate} />
        <Card rotate={rotate} scale={scale} />
      </div>
    </div>
  );
}
