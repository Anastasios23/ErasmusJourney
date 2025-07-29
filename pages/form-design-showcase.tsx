import Head from "next/head";
import Header from "../components/Header";
import { FormDesignDemo } from "../src/components/demos/FormDesignDemo";

export default function FormDesignShowcase() {
  return (
    <>
      <Head>
        <title>Form Design Improvements - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Showcase of enhanced form design with improved visual cues, error handling, and mobile optimization."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="py-8">
          <FormDesignDemo />
        </div>
      </div>
    </>
  );
}
