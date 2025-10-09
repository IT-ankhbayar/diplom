"use client";
import { useState } from "react";
import ImageUpload from "../components/Inputs/ImageUpload";
import Container from "../components/Container";
import Heading from "../components/Heading";

export default function VerifyPage() {
  const [image, setImage] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image[0]) return;
    await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationImage: image[0] })
    });
    setSubmitted(true);
  };

  return (
    <Container>
      <div className="max-w-lg mx-auto mt-12 bg-white rounded-xl shadow p-8 flex flex-col items-center">
        <Heading title="Иргэний үнэмлэхээ баталгаажуулна уу" subtitle="Зураг оруулж, баталгаажуулалтаа дуусгана уу" />
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6 mt-6">
          <ImageUpload value={image} onChange={setImage} />
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-600 transition disabled:opacity-50"
            disabled={image.length === 0 || submitted}
          >
            Баталгаажуулах
          </button>
        </form>
        {submitted && (
          <div className="mt-6 text-green-600 font-semibold">Таны зураг амжилттай илгээгдлээ. Админ баталгаажуулахыг хүлээнэ үү.</div>
        )}
      </div>
    </Container>
  );
}
