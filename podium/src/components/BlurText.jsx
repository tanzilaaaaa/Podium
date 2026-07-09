import { motion } from 'framer-motion'

export default function BlurText({
  text = '',
  delay = 220,
  startDelay = 0,
  duration = 1.8,
  style = {},
  className = '',
}) {
  const words = text.split(' ')

  return (
    <span className={className} style={{ display: 'inline', ...style }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          initial={{ opacity: 0, filter: 'blur(20px)', y: 10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{
            delay: startDelay / 1000 + (i * delay) / 1000,
            duration,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}{i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  )
}
