import type { GetServerSideProps } from "next";

export default function AccommodationDetailRedirectPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/destinations?focus=accommodation",
      permanent: false,
    },
  };
};
