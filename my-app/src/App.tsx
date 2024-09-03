import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import NotFoundPage from './components/NotFoundPage';

function App() {

	return (
		<div>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/room/player" element={<GamePage />} />
					<Route path="/*" element={<NotFoundPage />} />
				</Routes>
			</BrowserRouter>
		</div>
	)
}

export default App
