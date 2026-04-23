import { render, screen } from "@testing-library/react";
import { Provider } from "../store/reactReduxLite";
import App from "../App";
import { SocketProvider } from "../contexts/socketContext";
import { createTestStore } from "./testStore";
import React from "react";

describe("App Component", () => {

	it("should render the HomePage when the path is '/'", () => {
		const { store } = createTestStore();
		render(
			<Provider store={store}>
				<SocketProvider>
					<App />
				</SocketProvider>
			</Provider>
		);

		const linkElement = screen.getByText("WELCOME TO RED TETRIS");
		expect(document.body.contains(linkElement)).toBe(true);
	});
});
