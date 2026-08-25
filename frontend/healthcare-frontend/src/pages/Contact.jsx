import React, { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Contact Us</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4">
        <input name="name" placeholder="Your Name" onChange={handleChange} className="border p-2 w-full rounded" />
        <input name="email" type="email" placeholder="Your Email" onChange={handleChange} className="border p-2 w-full rounded" />
        <textarea name="message" placeholder="Your Message" onChange={handleChange} className="border p-2 w-full rounded h-24" />
        <button className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700">Send Message</button>
      </form>
    </div>
  );
}
