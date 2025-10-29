"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file && !text) {
      setMessage("テキストを入力するか、ファイルを選択してください。");
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    if (text) {
      formData.append("text", text);
    }

    const res = await fetch("http://localhost:8000/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    const filename_info = data.filename ? ` → ${data.filename}` : "";
    setMessage(data.message + filename_info);
  };

  return (
    <div>
      <h1>問題アップロード</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="問題のテキストを入力"
        rows={10}
        className="w-full p-2 border rounded"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button type="button" onClick={handleUpload}>
        アップロード
      </button>


      {message && <p>{message}</p>}
    </div>
  );
}
