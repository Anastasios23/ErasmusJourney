import { GetServerSideProps } from "next";

// Redirect old accommodation-detail URLs to new accommodation URLs
export default function AccommodationDetailRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { id } = params!;

  return {
    redirect: {
      destination: `/accommodation/${id}`,
      permanent: true, // 301 redirect for SEO
    },
  };
};
