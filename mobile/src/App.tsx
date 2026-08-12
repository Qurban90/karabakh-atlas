import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MapScreen } from './modules/map/MapScreen';
import { LocationDetailScreen } from './modules/locations/LocationDetailScreen';
import { FeedScreen } from './modules/feed/FeedScreen';
import { AnalyticsScreen } from './modules/analytics/AnalyticsScreen';
import { ProfileScreen } from './modules/profile/ProfileScreen';
import { TabBar } from './components/TabBar';
import { Toasts } from './components/Toasts';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerOfflineNotifier } from './api/client';
import { toast } from './store/toast';

export default function App() {
  useEffect(() => {
    registerOfflineNotifier(() =>
      toast.info('Oflayn rejim — məlumatlar yaddaşdakı keşdən göstərilir')
    );
  }, []);

  return (
    <BrowserRouter>
      <div className="shell">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<MapScreen />} />
            <Route path="/location/:id" element={<LocationDetailScreen />} />
            <Route path="/feed" element={<FeedScreen />} />
            <Route path="/analytics" element={<AnalyticsScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </Routes>
        </ErrorBoundary>
        <TabBar />
        <Toasts />
      </div>
    </BrowserRouter>
  );
}
