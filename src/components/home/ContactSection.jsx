import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, MessageSquare, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactSection() {
  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: "your.email@example.com",
      href: "mailto:your.email@example.com",
      color: "blue"
    },
    {
      icon: Linkedin,
      label: "LinkedIn", 
      value: "Connect professionally",
      href: "#",
      color: "indigo"
    },
    {
      icon: Github,
      label: "GitHub",
      value: "View my projects", 
      href: "#",
      color: "slate"
    },
    {
      icon: MessageSquare,
      label: "Schedule a call",
      value: "Let's discuss your project",
      href: "#",
      color: "emerald"
    }
  ];

  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    indigo: "from-indigo-500 to-indigo-600",
    slate: "from-slate-500 to-slate-600", 
    emerald: "from-emerald-500 to-emerald-600"
  };

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
            Let's
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Connect
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Ready to tackle complex challenges together? Whether it's a consulting opportunity 
            or a collaborative project, I'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.label}
              href={method.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="block p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorMap[method.color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{method.label}</h3>
                    <p className="text-slate-600 text-sm">{method.value}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-500 mb-6">
            Based in your location • Available for remote and on-site engagements
          </p>
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-slate-700 font-medium text-sm">Currently available</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}