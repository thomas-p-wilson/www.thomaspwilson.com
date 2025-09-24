import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalculatorIcon, ExternalLink, Filter, Plus } from 'lucide-react';
import { Calculator } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CalculatorSection() {
  const [calculators, setCalculators] = useState([]);
  const [filteredCalculators, setFilteredCalculators] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalculators();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredCalculators(calculators);
    } else {
      setFilteredCalculators(calculators.filter(calc => calc.category === selectedCategory));
    }
  }, [calculators, selectedCategory]);

  const loadCalculators = async () => {
    try {
      const data = await Calculator.list('-created_date');
      setCalculators(data);
      setFilteredCalculators(data);
    } catch (error) {
      console.error('Error loading calculators:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    financial: "bg-green-100 text-green-800",
    mathematical: "bg-blue-100 text-blue-800", 
    engineering: "bg-purple-100 text-purple-800",
    utility: "bg-orange-100 text-orange-800",
    conversion: "bg-indigo-100 text-indigo-800",
    scientific: "bg-red-100 text-red-800"
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'financial', label: 'Financial' },
    { value: 'mathematical', label: 'Mathematical' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'utility', label: 'Utility' },
    { value: 'conversion', label: 'Conversion' },
    { value: 'scientific', label: 'Scientific' }
  ];

  const featuredCalculators = calculators.filter(calc => calc.featured);

  return (
    <section id="calculators" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
            Calculator
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Collection
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Practical tools born from real-world needs. Each calculator represents a problem solved.
          </p>

          {!loading && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-slate-500">
                {filteredCalculators.length} calculator{filteredCalculators.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </motion.div>

        {/* Featured Calculators */}
        {featuredCalculators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></span>
              Featured Tools
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCalculators.map((calc) => (
                <div key={calc.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <CalculatorIcon className="w-6 h-6 text-white" />
                    </div>
                    {calc.url && (
                      <a
                        href={calc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-2">{calc.title}</h4>
                  <p className="text-slate-600 mb-4">{calc.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={categoryColors[calc.category]}>
                      {calc.category}
                    </Badge>
                    {calc.technologies?.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Calculators */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-2xl h-48 animate-pulse"></div>
            ))}
          </div>
        ) : filteredCalculators.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalculators.map((calc) => (
              <motion.div
                key={calc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <CalculatorIcon className="w-5 h-5 text-slate-600" />
                  </div>
                  {calc.url && (
                    <a
                      href={calc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">{calc.title}</h4>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{calc.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className={categoryColors[calc.category]} variant="secondary">
                    {calc.category}
                  </Badge>
                  {calc.technologies?.slice(0, 2).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <CalculatorIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No calculators yet</h3>
            <p className="text-slate-600">Start building your calculator collection!</p>
          </div>
        )}
      </div>
    </section>
  );
}