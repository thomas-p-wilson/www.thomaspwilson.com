
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalculatorIcon, ExternalLink, Filter, ArrowLeft } from 'lucide-react';
import { Calculator } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CalculatorCard = ({ calc }) => {
  const categoryColors = {
    financial: "bg-green-100 text-green-800",
    mathematical: "bg-blue-100 text-blue-800",
    engineering: "bg-purple-100 text-purple-800",
    utility: "bg-orange-100 text-orange-800",
    conversion: "bg-indigo-100 text-indigo-800",
    scientific: "bg-red-100 text-red-800"
  };

  const internalCalculators = {
    'Unit Conversion Tool': 'UnitConverter',
    'Resistive Element Sizing': 'ResistiveElementSizing',
  };

  const isInternal = internalCalculators[calc.title];
  const url = isInternal ? createPageUrl(internalCalculators[calc.title]) : calc.url;
  
  const CardContent = (
    <div className={`p-6 rounded-2xl border hover:shadow-lg transition-all duration-300 h-full flex flex-col ${isInternal ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white group'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isInternal ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-100 group-hover:bg-slate-200'} transition-colors`}>
          <CalculatorIcon className={`w-6 h-6 ${isInternal ? 'text-white' : 'text-slate-600'}`} />
        </div>
        {!isInternal && calc.url && (
          <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
        )}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{calc.title}</h3>
      <p className="text-slate-600 mb-4 flex-grow">{calc.description}</p>
      <div className="flex flex-wrap gap-2 mt-auto">
        <Badge className={categoryColors[calc.category]}>
          {calc.category === 'engineering' ? 'technical' : calc.category}
        </Badge>
        {calc.technologies?.map((tech) => (
          <Badge key={tech} variant="outline" className="text-xs">
            {tech}
          </Badge>
        ))}
      </div>
    </div>
  );

  return isInternal ? <Link to={url}>{CardContent}</Link> : <a href={url} target="_blank" rel="noopener noreferrer">{CardContent}</a>;
};


export default function Calculators() {
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

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'financial', label: 'Financial' },
    { value: 'mathematical', label: 'Mathematical' },
    { value: 'engineering', label: 'Technical' },
    { value: 'utility', label: 'Utility' },
    { value: 'conversion', label: 'Conversion' },
    { value: 'scientific', label: 'Scientific' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link 
            to={createPageUrl("Home")}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-6">
            Calculator
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Collection
            </span>
          </h1>
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

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-2xl h-56 animate-pulse"></div>
            ))}
          </div>
        ) : filteredCalculators.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalculators.map((calc) => (
              <motion.div
                key={calc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CalculatorCard calc={calc} />
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
    </div>
  );
}
