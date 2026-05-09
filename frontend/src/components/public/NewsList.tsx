import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../api/public';
import { SearchBar } from '../common/SearchBar';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { NewsArticle } from '../../types';

const PAGE_SIZE = 12;

const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <Link to={`/news/${article.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
    <div className="h-48 bg-gray-200 overflow-hidden">
      {article.featured_image ? (
        <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
      )}
    </div>
    <div className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 text-xs font-medium rounded bg-zammsa-green bg-opacity-10 text-zammsa-green">{article.category}</span>
        <span className="text-xs text-gray-400">{new Date(article.published_at).toLocaleDateString()}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-3">{article.summary}</p>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">By {article.author}</span>
        <span className="text-xs text-gray-400">{article.view_count} views</span>
      </div>
    </div>
  </Link>
);

const NewsList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const params: Record<string, any> = { page, page_size: pageSize };
  if (search) params.q = search;
  if (category) params.category = category;

  const { data, isLoading } = useQuery({
    queryKey: ['public-news', params],
    queryFn: () => publicApi.listNews(params),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">News & Updates</h1>
        <p className="text-gray-500 mt-2">Latest news from ZAMMSA</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search news..." />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="border-gray-300 rounded-lg text-sm">
          <option value="">All Categories</option>
          <option value="press_release">Press Releases</option>
          <option value="announcement">Announcements</option>
          <option value="procurement">Procurement</option>
          <option value="general">General</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : !data?.results?.length ? (
        <div className="text-center py-20 text-gray-400">No news articles found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.results.map((article) => <NewsCard key={article.id} article={article} />)}
        </div>
      )}

      {data && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(data.count / pageSize)}
          pageSize={pageSize}
          totalItems={data.count}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      )}
    </div>
  );
};

export default NewsList;
