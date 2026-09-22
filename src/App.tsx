import { ImageViewer } from './components/ImageViewer';
import { InstallPrompt } from './components/InstallPrompt';
import './App.css';

function App() {
  return (
    <div className="App">
      <InstallPrompt />
      <ImageViewer />
    </div>
  );
}

export default App;
