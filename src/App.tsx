import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { APP_ROUTES } from './config/routes';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
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
      </Router>
    </Provider>
  );
}

export default App;
