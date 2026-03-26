import type { GetServerSideProps } from "next";

export default function CourseMatchingExperiencesRedirectPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/destinations?focus=courses",
      permanent: false,
    },
  };
};
