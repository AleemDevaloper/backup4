import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AppProvider } from './context/AppContext';

function App() {
  return (
   <div style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
    <Router>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </Router>
    </div>
  );
}

export default App;
