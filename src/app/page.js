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
      <main className="flex min-h-screen w-full flex-col items-center justify-between py-24 px-6 md:px-12">
        <div className="flex flex-col items-center justify-center w-full max-w-7xl gap-10">
          <h1 className="text-4xl font-bold">Queuer</h1>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <div className="flex flex-wrap items-center justify-center gap-3">
          <input className="border border-gray-300 rounded-md p-2 min-w-[200px]" type="text" placeholder="Category Name" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} />
          <input type="color" className="h-10 w-16 rounded-md cursor-pointer border border-gray-300" defaultValue="#000000" />
          <button onClick={handleAddCategory} className="bg-blue-500 text-white px-3 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors">Create New Category</button>
        </div>
      </main>
    </div>
  );
}
