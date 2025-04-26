// frontend/src/App.tsx
import React from 'react';
import PracticeView from './components/PracticeView';
import './App.css'; // Assuming you have or will create this CSS file

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Flashcard Learner</h1>
      </header>
      <main className="app-main">
        <PracticeView />
      </main>
    </div>
  );
};

export default App;