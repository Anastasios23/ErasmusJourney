import { describe, expect, it } from "vitest";

import { getServerSideProps } from "../../pages/accommodation/[id]";

describe("accommodation detail redirect", () => {
  it("redirects retired accommodation detail traffic to destination discovery", async () => {
    const result = await getServerSideProps({} as any);

    expect(result).toEqual({
      redirect: {
        destination: "/destinations?focus=accommodation",
        permanent: false,
      },
    });
  });
});
