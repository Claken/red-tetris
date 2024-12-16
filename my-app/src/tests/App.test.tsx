import { render, screen } from "@testing-library/react";
import App from "../App";
import { SocketProvider } from "../contexts/socketContext";
import React from "react";

describe("App Component", () => {

	it("should render the HomePage when the path is '/'", () => {
		render(
			<SocketProvider>
				<App />
			</SocketProvider>
		);

		const linkElement = screen.getByText("WELCOME TO RED TETRIS");
		expect(document.body.contains(linkElement)).toBe(true);
	});
});
