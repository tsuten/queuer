"use client";

import Image from "next/image";
import Queue from "../components/queue";
import DBTest from "../components/dbtest";
import { useState, useEffect } from "react";
import { getCategories, addCategory } from "../actions/queueActions";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryInput, setCategoryInput] = useState("");

  const handleAddCategory = async () => {
    const result = await addCategory({ name: categoryInput, popLimit: 5 });
    if (result.success) {
      setCategories([...categories, result.data]);
      setCategoryInput("");
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success && result.data) {
          setCategories(result.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <main className="flex min-h-screen w-full flex-col items-center justify-between py-32 px-16">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">Queuer</h1>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="flex flex-row items-start justify-center gap-4">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <Queue key={category.id} category={category} />
                ))
              ) : (
                <div>No categories found</div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-row items-center justify-center">
          <input className="border-2 border-gray-300 rounded-md p-2 m-2" type="text" placeholder="Category Name" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} />
          <input type="color" className="rounded-4xl cursor-pointer" defaultValue="#000000" />
          <button onClick={handleAddCategory} className="bg-blue-500 text-white px-2 py-1 rounded-md cursor-pointer">Create New Category</button>
        </div>
      </main>
    </div>
  );
}
