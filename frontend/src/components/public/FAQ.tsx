import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../api/public';
import { SearchBar } from '../common/SearchBar';
import { LoadingSpinner } from '../common/LoadingSpinner';


const FAQ: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [expandedAll, setExpandedAll] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['public-faqs'],
    queryFn: () => publicApi.listFAQs({ limit: 100 }),
  });

  const faqs = data?.results || [];

  const filtered = search
    ? faqs.filter((f) => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase()))
    : faqs;

  const categories = Array.from(new Set(filtered.map((f) => f.category)));

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
    setExpandedAll(false);
  };

  const toggleAll = () => {
    if (expandedAll) {
      setExpanded(new Set());
      setExpandedAll(false);
    } else {
      setExpanded(new Set(filtered.map((f) => f.id)));
      setExpandedAll(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
        <p className="text-gray-500 mt-2">Find answers to common questions about ZAMMSA procurement</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search FAQs..." />
        </div>
        <button
          onClick={toggleAll}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          {expandedAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : !filtered.length ? (
        <div className="text-center py-20 text-gray-400">No FAQs found matching your search.</div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">{category}</h2>
              <div className="space-y-2">
                {filtered.filter((f) => f.category === category).map((faq) => (
                  <div key={faq.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggle(faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                      <svg
                        className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${expanded.has(faq.id) ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expanded.has(faq.id) && (
                      <div className="px-4 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                        {faq.answer}
                      </div>
                    )}
                    <div className="px-4 pb-4" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQ;
