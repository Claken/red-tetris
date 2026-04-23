import NotFoundPage from "../components/NotFoundPage";
import HomePage from "../components/HomePage";
import GamePage from "../components/GamePage";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "../store/reactReduxLite";
import { SocketProvider } from "../contexts/socketContext";
import { render, screen } from "@testing-library/react";
import { createTestStore } from "./testStore";
import React from "react";

describe("NotFoundPage Component", () => {
  it("renders the NotFoundPage component when route is not found", () => {
	const { store } = createTestStore();
	render(
		<Provider store={store}>
			<SocketProvider>
			<MemoryRouter initialEntries={['/unknown-route']}>
			  <Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/:room/:player_name" element={<GamePage />} />
				<Route path="*" element={<NotFoundPage />} />
			  </Routes>
			</MemoryRouter>
			</SocketProvider>
		</Provider>
	  );
	const linkElement = screen.getByTestId("not-found-page");
	expect(document.body.contains(linkElement)).toBe(true);
  });
});
