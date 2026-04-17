import Head from "next/head";
import Header from "../components/Header";
import Footer from "../src/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Erasmus Journey</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-white">
        <section className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight">
              Privacy Policy
            </h1>
            <div className="mt-8 space-y-6 max-w-3xl text-base md:text-lg text-gray-600 leading-8">
              <p>
                Data we collect: When you register, we collect your university
                email address and name. When you submit an Erasmus experience,
                we collect the information you provide in the form.
              </p>
              <p>
                How we use your data: Your submitted data is reviewed by a
                moderator before publishing. Approved submissions are published
                anonymously - your name and email are never shown publicly. Your
                data is linked only to your home university.
              </p>
              <p>
                Your rights: You may request deletion of your account and
                submitted data at any time by emailing{" "}
                anastasiosandreou1@gmail.com. This platform is operated in
                compliance with GDPR.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
