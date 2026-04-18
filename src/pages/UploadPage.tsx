import { motion } from 'framer-motion';
import { UploadForm } from '../components/UploadForm';
export function UploadPage() {
  return (
    <motion.div
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0
      }}
      className="min-h-screen pt-20 pb-24 md:pt-28 md:pb-12 flex flex-col items-center justify-center bg-ivory">
      
      <UploadForm />
    </motion.div>);

}