import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const IncreaseToNumber = ({
  initialValue,
  finalValue,
  duration,
  isIncrease,
  toFixed = 1,
}) => {
  const [currentValue, setCurrentValue] = useState(initialValue);

  useEffect(() => {
    let startTime = null;
    let requestId = null;

    const updateValue = (timestamp) => {
      // Nếu chưa có start time set start = current timestamp tại frame này
      if (!startTime) startTime = timestamp;
      //   tiến trình = timestamp tại frame hiện tại - thời gian bắt đầu
      const progress = timestamp - startTime;
      // Thông số lượng % hoàn thành
      const percentage = Math.min(progress / duration, 1);
      //   Khoảng cách giữa init và final
      const valueDiff = finalValue - initialValue;

      if (isIncrease) {
        setCurrentValue(initialValue + valueDiff * percentage); // Tăng dần giá trị
      } else {
        setCurrentValue(finalValue - valueDiff * percentage); // Giảm dần giá trị
      }
      //    nếu progress vẫn nhỏ hơn khoảng duration truyền vào tiếp tục call requestAnimationFrame
      if (progress < duration) {
        requestId = requestAnimationFrame(updateValue); // Tiếp tục cập nhật giá trị nếu chưa đạt đến thời gian kết thúc
      }
    };
    // call requestAnimationFrame(callback = timestamp of current frame)
    requestId = requestAnimationFrame(updateValue);

    return () => cancelAnimationFrame(requestId); // Dọn dẹp requestAnimationFrame khi unmount
  }, [initialValue, finalValue, duration, isIncrease]);

  return (
    <div>
      <motion.div
        style={{ fontSize: "2rem", fontWeight: "bold" }}
        // animate={{ scale: [0.8, 1.2, 1] }} // Scale animation
        // transition={{ duration: 0.5 }}
      >
        {parseFloat(currentValue.toFixed(toFixed))}
      </motion.div>
    </div>
  );
};

export default IncreaseToNumber;
