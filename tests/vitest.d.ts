import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  interface Assertion<R = unknown>
    extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<typeof expect.stringContaining, unknown> {}
}
