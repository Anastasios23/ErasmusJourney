import { describe, expect, it } from "vitest";

import { getServerSideProps } from "../../pages/accommodation/index";

describe("accommodation index redirect", () => {
  it("redirects legacy accommodation entry traffic to destination discovery", async () => {
    const result = await getServerSideProps({} as any);

    expect(result).toEqual({
      redirect: {
        destination: "/destinations?focus=accommodation",
        permanent: false,
      },
    });
  });
});
