import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../api/public';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PrintButton } from '../common/PrintButton';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ['public-news-detail', id],
    queryFn: () => publicApi.getNews(id!).then((a) => { publicApi.trackNewsView(id!); return a; }),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner size="lg" className="py-32" />;
  if (!article) return <div className="text-center py-20 text-gray-400">Article not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/news" className="text-sm text-zammsa-green hover:underline">← Back to News</Link>
      </div>

      <article>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-zammsa-green bg-opacity-10 text-zammsa-green">{article.category}</span>
              <span className="text-sm text-gray-400">{new Date(article.published_at).toLocaleDateString('en-ZM', { dateStyle: 'long' })}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{article.title}</h1>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span>By {article.author}</span>
              <span>{article.view_count} views</span>
            </div>
          </div>
          <PrintButton />
        </div>

        {article.featured_image && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img src={article.featured_image} alt={article.title} className="w-full h-auto max-h-96 object-cover" />
          </div>
        )}

        <div className="prose prose-gray max-w-none">
          {article.content?.split('\n').map((p, i) => <p key={i} className="mb-4 leading-relaxed">{p}</p>)}
        </div>

        {article.tags?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Share:</span>
            {['Facebook', 'Twitter', 'LinkedIn'].map((s) => (
              <button key={s} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200" onClick={() => window.open(`https://www.${s.toLowerCase()}.com/share?url=${window.location.href}`, '_blank')}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;
