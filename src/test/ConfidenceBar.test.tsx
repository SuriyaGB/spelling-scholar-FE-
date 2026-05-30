import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ConfidenceBar } from "@/components/ConfidenceBar";

describe("ConfidenceBar", () => {
  it("renders correctly with label and formatted percentage", () => {
    render(<ConfidenceBar confidence={0.85} label="AI Confidence" />);
    
    // Check if label text is present
    expect(screen.getByText("AI Confidence")).toBeInTheDocument();
    
    // Check if rounded percentage is displayed
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("does not render label and percentage elements when label is omitted", () => {
    render(<ConfidenceBar confidence={0.5} />);
    
    // The label container should not be rendered
    const labelText = screen.queryByText(/%/);
    expect(labelText).not.toBeInTheDocument();
  });

  it("renders progress bar with correct width style", () => {
    const { container } = render(<ConfidenceBar confidence={0.624} />);
    
    // Locate the inner progress bar div (the one with the dynamic width style)
    const progressBar = container.querySelector(".h-full");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: "62%" });
  });

  it("applies bg-success class for high confidence (>= 0.7)", () => {
    const { container } = render(<ConfidenceBar confidence={0.7} />);
    const progressBar = container.querySelector(".h-full");
    expect(progressBar).toHaveClass("bg-success");
    expect(progressBar).not.toHaveClass("bg-warning");
  });

  it("applies bg-warning class for mid confidence (>= 0.4 and < 0.7)", () => {
    const { container: containerMid } = render(<ConfidenceBar confidence={0.4} />);
    const progressBarMid = containerMid.querySelector(".h-full");
    expect(progressBarMid).toHaveClass("bg-warning");
    expect(progressBarMid).not.toHaveClass("bg-success");

    const { container: containerHighMid } = render(<ConfidenceBar confidence={0.69} />);
    const progressBarHighMid = containerHighMid.querySelector(".h-full");
    expect(progressBarHighMid).toHaveClass("bg-warning");
  });

  it("applies low confidence class for confidence < 0.4", () => {
    const { container } = render(<ConfidenceBar confidence={0.39} />);
    const progressBar = container.querySelector(".h-full");
    expect(progressBar).toHaveClass("bg-muted-foreground/40");
    expect(progressBar).not.toHaveClass("bg-success");
    expect(progressBar).not.toHaveClass("bg-warning");
  });
});
