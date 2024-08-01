import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const BouncingText = ({ text, displacement, duration, endTime }) => {
  const [isRunning, setIsRunning] = useState(true);
  const timerRef = useRef();
  useEffect(() => {
    if (endTime) {
      timerRef.current = setTimeout(() => {
        setIsRunning(false);
      }, endTime);
    }

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [text, duration, endTime]);

  return (
    <>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          style={{ marginRight: `${displacement}px`, display: "inline-block" }}
          animate={isRunning ? { y: [0, -displacement, 0] } : { y: [0, 0, 0] }}
          transition={{
            duration: 0.6,
            repeat: isRunning ? Infinity : 0,
            delay: 0.2 * index,
          }}
        >
          {char}
        </motion.span>
      ))}
    </>
  );
};

export default BouncingText;
