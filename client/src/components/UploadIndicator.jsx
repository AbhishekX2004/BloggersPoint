import { motion, AnimatePresence } from 'framer-motion';

const UploadIndicator = ({ 
    isVisible, 
    message = "Uploading...", 
    position = "top-left",
    icon = null,
    color = "blue"
}) => {
    const positionClasses = {
        "top-left": "top-4 left-4",
        "top-right": "top-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "top-center": "top-4 left-1/2 transform -translate-x-1/2",
        "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2"
    };

    const colorClasses = {
        blue: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            dot: "bg-blue-600",
            text: "text-blue-700"
        },
        green: {
            bg: "bg-green-50",
            border: "border-green-200",
            dot: "bg-green-600",
            text: "text-green-700"
        },
        purple: {
            bg: "bg-purple-50",
            border: "border-purple-200",
            dot: "bg-purple-600",
            text: "text-purple-700"
        },
        orange: {
            bg: "bg-orange-50",
            border: "border-orange-200",
            dot: "bg-orange-600",
            text: "text-orange-700"
        },
        red: {
            bg: "bg-red-50",
            border: "border-red-200",
            dot: "bg-red-600",
            text: "text-red-700"
        }
    };

    const slideDirection = {
        "top-left": { x: -50, y: 0 },
        "top-right": { x: 50, y: 0 },
        "bottom-left": { x: -50, y: 0 },
        "bottom-right": { x: 50, y: 0 },
        "top-center": { x: 0, y: -50 },
        "bottom-center": { x: 0, y: 50 }
    };

    const currentColor = colorClasses[color] || colorClasses.blue;
    const currentPosition = positionClasses[position] || positionClasses["top-left"];
    const slideDir = slideDirection[position] || slideDirection["top-left"];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`fixed ${currentPosition} z-60 bg-white rounded-lg shadow-lg p-4 border ${currentColor.border} ${currentColor.bg} min-w-[200px]`}
                    initial={{ opacity: 0, ...slideDir }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, ...slideDir }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    <div className="flex items-center gap-3">
                        {icon ? (
                            <div className="text-lg">
                                {icon}
                            </div>
                        ) : (
                            <motion.div
                                className={`w-4 h-4 ${currentColor.dot} rounded-full`}
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        )}
                        <span className={`text-sm font-medium ${currentColor.text}`}>
                            {message}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UploadIndicator;