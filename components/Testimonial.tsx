import React from 'react';
import { motion } from 'framer-motion';

export const Testimonial: React.FC = () => {
  return (
    <section className="py-16 relative overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4"
            style={{ backgroundColor: '#FEF2F3', color: '#A51C30' }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A51C30' }}></span>
            Real Stories
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-4"
            style={{ color: '#A51C30' }}
          >
            Student Testimonials
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600"
          >
            Hear from students who achieved their dreams
          </motion.p>
        </div>

        {/* Video - Reduced Height */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="relative" style={{ paddingBottom: '42%', maxHeight: '500px' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/xeYCACJjShM?si=ln0gYtT8gFaLI94S"
              title="Student Testimonial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>
      </div>
    </section>
  );
};