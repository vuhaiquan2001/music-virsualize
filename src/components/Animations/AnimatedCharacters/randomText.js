import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Danh sách các ký tự có thể xuất hiện
const numbers = "0123456789";
const letters = "abcdefghijklmnopqrstuvwxyz";
const lettersUppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const vietnameseLetters =
  "àáâãèéêìíòóôọợạậặẹệịụựỗỡẫẵõùúăđĩũơăâđêôơư0123456789abcdefghijklmnopqrstuvwxyz";
const vietnameseLettersUppercase =
  "ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƯƠABCDEFGHIJKLMNOPQRSTUVWXYZ";

const getRandomCharacter = (char) => {
  // Nếu là số
  if (numbers.includes(char)) {
    return numbers[Math.floor(Math.random() * numbers.length)];
  } else if (letters.includes(char) || vietnameseLetters.includes(char)) {
    // Nếu là chữ thường
    return letters[Math.floor(Math.random() * letters.length)];
  } else if (
    lettersUppercase.includes(char) ||
    vietnameseLettersUppercase.includes(char)
  ) {
    // Nếu là chữ hoa
    return lettersUppercase[
      Math.floor(Math.random() * lettersUppercase.length)
    ];
  }
  return char;
};

const AnimatedCharacters = ({
  targetString,
  duration = 1000,
  intervalDuration = 20,
}) => {
  const [currentCharacters, setCurrentCharacters] = useState(
    targetString
      .split("")
      .map((char) => (char === " " ? "\u00A0" : getRandomCharacter(char)))
  );
  useEffect(() => {
    // Số lần thay đổi tối đa dựa vào duration/ khoảng thời gian thay đổi ký tự
    const totalIntervals = duration / intervalDuration;
    // Lần thay đổi hiện tại
    let currentStep = 0;
    const interval = setInterval(() => {
      setCurrentCharacters(
        currentCharacters.map((char, idx) => {
          // Hết thời gian (duration) thì sẽ không thay đổi nữa (khi này intarval chưa clear)
          if (currentStep >= totalIntervals) {
            return targetString[idx];
          }
          return targetString[idx] === " "
            ? "\u00A0"
            : getRandomCharacter(targetString[idx]);
        })
      );

      currentStep += 1;
      // hết thời gian clear interval (set lại string gốc)
      if (currentStep >= totalIntervals) {
        clearInterval(interval);
        setCurrentCharacters([targetString]);
      }
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [targetString, duration]);

  return (
    <div style={{ display: "flex", fontSize: "2rem", fontWeight: "bold" }}>
      {currentCharacters.map((char, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedCharacters;
