import NotFoundPage from "../components/NotFoundPage";
import HomePage from "../components/HomePage";
import GamePage from "../components/GamePage";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SocketProvider } from "../contexts/socketContext";
import { render, screen } from "@testing-library/react";
import React from "react";

describe("NotFoundPage Component", () => {
  it("renders the NotFoundPage component when route is not found", () => {
	render(
		<SocketProvider>
		<MemoryRouter initialEntries={['/unknown-route']}>
		  <Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/:room/:player_name" element={<GamePage />} />
			<Route path="*" element={<NotFoundPage />} />
		  </Routes>
		</MemoryRouter>
		</SocketProvider>
	  );
	const linkElement = screen.getByTestId("not-found-page");
	expect(document.body.contains(linkElement)).toBe(true);
  });
});