import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import FoundationPage from './pages/FoundationPage';
import TopicA1Page from './pages/TopicA1Page';
import TopicA2Page from './pages/TopicA2Page';
import TopicA3Page from './pages/TopicA3Page';
import TopicB1Page from './pages/TopicB1Page';
import TopicB2Page from './pages/TopicB2Page';
import TopicB3Page from './pages/TopicB3Page';
import AllInOnePage from './pages/AllInOnePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/foundation" element={<FoundationPage />} />
            <Route path="/a1"         element={<TopicA1Page />} />
            <Route path="/a2"         element={<TopicA2Page />} />
            <Route path="/a3"         element={<TopicA3Page />} />
            <Route path="/b1"         element={<TopicB1Page />} />
            <Route path="/b2"         element={<TopicB2Page />} />
            <Route path="/b3"         element={<TopicB3Page />} />
            <Route path="/all-in-one" element={<AllInOnePage />} />
          </Routes>
        </main>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
