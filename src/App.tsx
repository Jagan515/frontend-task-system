import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { store, type AppDispatch, type RootState } from './store';
import { APP_ROUTES } from './config/routes';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { Layout } from './components/Layout';
import { initializeAuth } from './store/slices/authSlice';

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitializing } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'var(--sans)',
        color: 'var(--text)'
      }}>
        <div className="loading-spinner">Initializing Session...</div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <AppInitializer>
        <Router>
          <Layout>
            <Routes>
              {APP_ROUTES.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <RoleProtectedRoute
                      isProtected={route.isProtected}
                      permissions={route.permissions}
                    >
                      <route.element />
                    </RoleProtectedRoute>
                  }
                />
              ))}
            </Routes>
          </Layout>
        </Router>
      </AppInitializer>
    </Provider>
  );
}
export default App;
