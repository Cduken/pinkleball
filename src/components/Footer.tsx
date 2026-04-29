//Footer.tsx
import { motion } from "framer-motion";
import MainLogo from '../components/MainLogo/MainLogo';

const Footer = () => {
  return (
    <footer className="bg-pink-50 border-t border-pink-100 py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <MainLogo />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-gray-400"
        >
          © {new Date().getFullYear()} PinkleBall. All rights reserved.
        </motion.p>
        
       
        
      </div>
    </footer>
  );
};

export default Footer;