import { motion } from "framer-motion"

export default function BackgroundAnimation() {
  return (
    <motion.div
      className="absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-primary/10 rounded-full"
          style={{
            width: Math.random() * 100 + 10,
            height: Math.random() * 100 + 10,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 100 - 50],
            x: [0, Math.random() * 100 - 50],
            scale: [1, Math.random() + 0.5],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </motion.div>
  )
}