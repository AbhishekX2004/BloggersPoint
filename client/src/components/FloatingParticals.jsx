/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const FloatingParticals = ( { particals } ) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {[...Array(particals)].map((_, i) => {
                const size = Math.random() * 6 + 10;
                const initialX = Math.random() * 100;
                const initialY = Math.random() * 100;
                const moveX = (Math.random() - 0.5) * 200;
                const moveY = (Math.random() - 0.5) * 200;
                const duration = Math.random() * 10 + 8;
                const delay = Math.random() * 5;
                const opacity = Math.random() * 0.15 + 0.50;

                return (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: size,
                            height: size,
                            left: `${initialX}%`,
                            top: `${initialY}%`,
                            background: i % 3 === 0
                                ? 'rgba(59, 130, 246, 0.4)' // blue-500 with reduced opacity
                                : i % 3 === 1
                                    ? 'rgba(147, 51, 234, 0.4)' // purple-600 with reduced opacity
                                    : 'rgba(16, 185, 129, 0.4)', // emerald-500 with reduced opacity
                            opacity: opacity
                        }}
                        animate={{
                            x: [0, moveX, moveX * 0.5, 0],
                            y: [0, moveY, moveY * 0.7, 0],
                            scale: [1, 1.2, 0.8, 1],
                            opacity: [opacity, 0.1, opacity],
                        }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: delay
                        }}
                    />
                );
            })}
        </div>
    )
}

export default FloatingParticals;