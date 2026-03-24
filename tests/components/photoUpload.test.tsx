import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PhotoUpload } from "../../src/components/ui/photo-upload";

class MockFileReader {
  result: string | ArrayBuffer | null = null;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null =
    null;
  onerror:
    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
    | null = null;

  readAsDataURL(file: Blob) {
    this.result = `data:${file.type};base64,ZmFrZS1pbWFnZQ==`;
    this.onload?.call(this as unknown as FileReader, new ProgressEvent("load"));
  }
}

describe("PhotoUpload", () => {
  const originalFetch = globalThis.fetch;
  const originalFileReader = globalThis.FileReader;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.FileReader = originalFileReader;
    vi.restoreAllMocks();
  });

  it("uploads a selected image and reports the new photo URL", async () => {
    const onPhotosChange = vi.fn();

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        url: "/uploads/test-user/erasmus.png",
      }),
    } as Response);

    const { container } = render(
      <PhotoUpload photos={[]} onPhotosChange={onPhotosChange} />,
    );

    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();

    fireEvent.change(input as HTMLInputElement, {
      target: {
        files: [new File(["photo"], "erasmus.png", { type: "image/png" })],
      },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/upload",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    await waitFor(() => {
      expect(onPhotosChange).toHaveBeenCalledWith([
        "/uploads/test-user/erasmus.png",
      ]);
    });
  });

  it("shows a friendly message when the upload API returns 401", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: "Authentication required",
      }),
    } as Response);

    const { container } = render(
      <PhotoUpload photos={[]} onPhotosChange={() => undefined} />,
    );

    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();

    fireEvent.change(input as HTMLInputElement, {
      target: {
        files: [new File(["photo"], "erasmus.png", { type: "image/png" })],
      },
    });

    await expect(
      screen.findByText("Please sign in again to upload photos."),
    ).resolves.toBeInTheDocument();
  });

  it("keeps the empty upload state keyboard-accessible", () => {
    const { container } = render(
      <PhotoUpload photos={[]} onPhotosChange={() => undefined} />,
    );

    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();

    const clickSpy = vi.spyOn(input as HTMLInputElement, "click");

    fireEvent.keyDown(screen.getByRole("button", { name: "Select photos" }), {
      key: "Enter",
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
