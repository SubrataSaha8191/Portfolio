import { createRoot } from 'react-dom/client';
import App from './App';
import { applyWall } from './animation/wall';
import './styles/global.css';
import './styles/graffiti.css';

applyWall();
createRoot(document.getElementById('root')).render(<App />);
