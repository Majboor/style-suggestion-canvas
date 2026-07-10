import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageCard from "./ImageCard";

// Mock the API client so the component test never hits the network.
vi.mock("@/services/StyleApiClient", () => ({
  default: {
    submitFeedbackAndGetNextImage: vi.fn(),
    saveProfile: vi.fn().mockResolvedValue({ message: "saved" }),
  },
}));

// sonner renders portals/toasts we don't care about here.
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

import styleApiClient from "@/services/StyleApiClient";

const submitMock = styleApiClient.submitFeedbackAndGetNextImage as unknown as ReturnType<
  typeof vi.fn
>;

describe("ImageCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the current iteration counter", () => {
    render(
      <ImageCard
        imageUrl="http://img/1.png"
        iteration={3}
        isCompleted={false}
        onFeedbackSubmitted={vi.fn()}
      />
    );
    expect(screen.getByText("Iteration 3/30")).toBeInTheDocument();
  });

  it("renders enabled Like/Dislike buttons when an image is present", () => {
    render(
      <ImageCard
        imageUrl="http://img/1.png"
        iteration={1}
        isCompleted={false}
        onFeedbackSubmitted={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /^like this style suggestion$/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /^dislike this style suggestion$/i })).toBeEnabled();
  });

  it("disables feedback buttons when there is no image", () => {
    render(
      <ImageCard
        imageUrl=""
        iteration={0}
        isCompleted={false}
        onFeedbackSubmitted={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /^like this style suggestion$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^dislike this style suggestion$/i })).toBeDisabled();
  });

  it("submits feedback and notifies the parent with the next image", async () => {
    const user = userEvent.setup();
    submitMock.mockResolvedValue({
      image_url: "http://img/2.png",
      iteration: 2,
      completed: false,
    });
    const onFeedbackSubmitted = vi.fn();

    render(
      <ImageCard
        imageUrl="http://img/1.png"
        iteration={1}
        isCompleted={false}
        onFeedbackSubmitted={onFeedbackSubmitted}
      />
    );

    await user.click(screen.getByRole("button", { name: /^like this style suggestion$/i }));

    expect(submitMock).toHaveBeenCalledWith("like", undefined, undefined);
    await waitFor(
      () => expect(onFeedbackSubmitted).toHaveBeenCalledWith("http://img/2.png", 2),
      { timeout: 2000 }
    );
  });
});
