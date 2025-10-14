import { Routes, Route } from 'react-router-dom';
import './App.css';
import { CommandBar } from './components/HomePage/CommandBar/CommandBar';
import { HomePage } from './Pages/Home';
import { TodoPage } from './Pages/Todo';

export const App = () => {
  return (
    <>
      <div className="App">
        <CommandBar /> {/* stays above, visible on all pages */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/todo" element={<TodoPage />} />
        </Routes>
      </div>
    </>
  );
}

