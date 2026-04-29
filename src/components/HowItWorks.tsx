//HowItWorks.tsx
import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Pick a date", description: "Choose when you want to play on our live calendar." },
  { step: "02", title: "Grab a slot", description: "Select an available court time that works for you." },
  { step: "03", title: "Fill the form", description: "No account needed — just your name and contact." },
  { step: "04", title: "Show up & play", description: "Arrive at the court and enjoy your game!" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};



const HowItWorks = () => {
  return (
    <section className="bg-pink-50 py-20 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 left-10 w-64 h-64 bg-pink-200 rounded-full opacity-20 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-48 h-48 bg-pink-300 rounded-full opacity-20 blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-extrabold text-gray-900">
            How it <span className="text-pink-500">works</span>
          </h2>
          <p className="text-gray-400 mt-3 text-sm">Four simple steps to get on the court.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map(({ step, title, description }) => (
            <motion.div
              key={step}
              
              whileHover={{ scale: 1.05, y: -8 }}
              className="flex flex-col items-center text-center gap-3"
            >
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-300 flex items-center justify-center text-white font-extrabold text-sm shadow-md"
                whileHover={{
                  scale: 1.2,
                  boxShadow: "0 20px 25px -5px rgba(236, 72, 153, 0.4)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {step}
              </motion.div>
              <h3 className="font-bold text-gray-800">{title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>

      
      
      </div>
    </section>
  );
};

export default HowItWorks;