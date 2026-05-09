import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import publicApi from '../../api/public';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Event } from '../../types';

const PAGE_SIZE = 12;

const typeBadges: Record<string, string> = {
  meeting: 'bg-purple-100 text-purple-700',
  workshop: 'bg-blue-100 text-blue-700',
  conference: 'bg-green-100 text-green-700',
  training: 'bg-orange-100 text-orange-700',
  deadline: 'bg-red-100 text-red-700',
  other: 'bg-gray-100 text-gray-700',
};

const EventsList: React.FC = () => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const params: Record<string, any> = { page, page_size: pageSize };
  if (tab === 'upcoming') params.upcoming = true;

  const { data, isLoading } = useQuery({
    queryKey: ['public-events', params],
    queryFn: () => publicApi.listEvents(params),
  });

  const addToCalendar = (event: Event) => {
    const text = encodeURIComponent(event.title);
    const dates = `${event.start_date.replace(/-/g, '')}/${event.end_date.replace(/-/g, '')}`;
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-500 mt-2">Upcoming procurement events and activities</p>
      </div>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => { setTab('upcoming'); setPage(1); }}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'upcoming' ? 'bg-zammsa-green text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => { setTab('past'); setPage(1); }}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'past' ? 'bg-zammsa-green text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
        >
          Past Events
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : !data?.results?.length ? (
        <div className="text-center py-20 text-gray-400">No events found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.results.map((event: Event) => {
            const isUpcoming = new Date(event.start_date) > new Date();
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className={`px-5 py-4 text-white ${isUpcoming ? 'bg-zammsa-green' : 'bg-gray-500'}`}>
                  <div className="text-2xl font-bold">{new Date(event.start_date).getDate()} {new Date(event.start_date).toLocaleString('default', { month: 'short' })}</div>
                  <div className="text-sm opacity-80">{new Date(event.start_date).toLocaleDateString('en-ZM', { weekday: 'long' })}</div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeBadges[event.type] || 'bg-gray-100 text-gray-700'}`}>
                      {event.type}
                    </span>
                    {event.is_featured && <span className="text-xs text-zammsa-orange font-medium">Featured</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
                  <div className="text-sm text-gray-500 space-y-1 mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(event.start_date).toLocaleTimeString()} - {new Date(event.end_date).toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={() => addToCalendar(event)}
                    className="w-full px-4 py-2 border border-zammsa-green text-zammsa-green text-sm rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Add to Calendar
                  </button>
                </div>
              </div>
            );
          })}
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

export default EventsList;
