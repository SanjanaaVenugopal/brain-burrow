import './App.css';
import { CommandBar } from './components/HomePage/CommandBar/CommandBar';
import { Home } from './components/HomePage/Home';

export const App = () => {
  return (
    <>
      <div className="App">
        <CommandBar />
        <Home />
      </div>
    </>
  );
}

