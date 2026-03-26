import { describe, expect, it } from "vitest";

import { getServerSideProps } from "../../pages/course-matching-experiences";

describe("course matching experiences redirect", () => {
  it("redirects legacy course discovery traffic to destination discovery", async () => {
    const result = await getServerSideProps({} as any);

    expect(result).toEqual({
      redirect: {
        destination: "/destinations?focus=courses",
        permanent: false,
      },
    });
  });
});
