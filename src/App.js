import './App.css';
import EPubViewer from './components/EPubViewer';

function App() {
  return (
    <div className='App'>
      <header className='App-header'>Bookiwi</header>
      <EPubViewer url='../epub_sample.epub' />
    </div>
  );
}

export default App;
