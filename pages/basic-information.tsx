import { useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";

export default function BasicInformation() {
  const [testData, setTestData] = useState("test");

  return (
    <>
      <Head>
        <title>Basic Information - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Complete your personal and academic information for your Erasmus application"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Basic Information
              </h1>
              <p className="text-gray-600">
                Complete your personal and academic information for your Erasmus
                application.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Test Page</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is a test version of the Basic Information page.</p>
                <p>Current test data: {testData}</p>
                <Button onClick={() => setTestData("updated!")}>
                  Test Button
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
