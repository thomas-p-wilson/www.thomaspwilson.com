import React from 'react';
import { motion } from 'framer-motion';
import { Award, Briefcase, Calendar, Code } from 'lucide-react';

export default function AboutSection() {
  const stats = [
    { icon: Calendar, label: "Years Experience", value: "20+" },
    { icon: Briefcase, label: "Projects Delivered", value: "150+" },
    { icon: Award, label: "Certifications", value: "12+" },
    { icon: Code, label: "Applications Built", value: "200+" }
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-8 leading-tight">
              Crafting solutions for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
                complex challenges
              </span>
            </h2>
            
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                With over two decades in software development, I've architected 
                systems that scale, secured applications that protect millions of users, and 
                streamlined operations that keep businesses running 24/7.
              </p>
              
              <p>
                My expertise spans the full spectrum of software development—from writing elegant 
                code to designing robust infrastructure, implementing security best practices, 
                and guiding teams through complex technical decisions.
              </p>
              
              <p>
                I take pride in creating practical solutions that solve real-world problems. 
                Each project represents my commitment to turning complex requirements into 
                simple, accessible tools that make a difference.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                <stat.icon className="w-8 h-8 text-blue-600 mb-4" />
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}