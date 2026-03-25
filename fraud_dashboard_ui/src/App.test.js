import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dashboard navigation", () => {
  render(<App />);
  expect(screen.getByText(/claims/i)).toBeInTheDocument();
  expect(screen.getByText(/upload/i)).toBeInTheDocument();
  expect(screen.getByText(/queue/i)).toBeInTheDocument();
  expect(screen.getByText(/reports/i)).toBeInTheDocument();
});
