"use client";

import Image from "next/image";
import Queue from "../components/queue";
import DBTest from "../components/dbtest";
import { useState, useEffect } from "react";
import { getCategories, addCategory } from "../actions/queueActions";
import { ActionBar, Button, Checkbox, Portal, Box } from "@chakra-ui/react"
import { Trash2, Share, Plus, X } from "lucide-react"
import { Input } from "@chakra-ui/react"
import { NumberInput } from "@chakra-ui/react"
import { ColorPicker } from "@chakra-ui/react"
import { IconButton } from "@chakra-ui/react"

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryInput, setCategoryInput] = useState("");
  const [popLimitInput, setPopLimitInput] = useState(5);
  const [showCategoryActionBar, setShowCategoryActionBar] = useState(false)
  const [colorInput, setColorInput] = useState("#000000");

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

  useEffect(() => {
    console.log(colorInput);
    console.log(popLimitInput);
    console.log(categoryInput);
  }, [colorInput, popLimitInput, categoryInput]);

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
        {/* <div className="flex flex-wrap items-center justify-center gap-3">
          <input className="border border-gray-300 rounded-md p-2 min-w-[200px]" type="text" placeholder="Category Name" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} />
          <input type="color" className="h-10 w-16 rounded-md cursor-pointer border border-gray-300" defaultValue="#000000" />
          <button onClick={handleAddCategory} className="bg-blue-500 text-white px-3 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors">Create New Category</button>
        </div> */}
        {!showCategoryActionBar && (
        <Button variant="outline" size="sm" onClick={() => setShowCategoryActionBar(true)}>
          <Plus />
          Create New Category
        </Button>
        )}
      <ActionBar.Root open={showCategoryActionBar}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content position="relative">
              <IconButton 
                aria-label="Close" 
                rounded="full" 
                onClick={() => setShowCategoryActionBar(false)} 
                size="xs" 
                cursor="pointer"
                position="absolute"
                top={-3}
                right={-3}
                zIndex={10}
                bgColor="red.600"
              >
                <X />
              </IconButton>
              
              <Input placeholder="Category Name" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} />
              <NumberInput.Root defaultValue={popLimitInput} min={1} max={10} onValueChange={(e) => setPopLimitInput(e.value)}>
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
                <NumberInput.Scrubber />
                <NumberInput.Input />
              </NumberInput.Root>

              <ColorPicker.Root onValueChange={(e) => setColorInput(e.value)}>
                <ColorPicker.HiddenInput />
                <ColorPicker.Control>
                  <ColorPicker.Trigger cursor="pointer" />
                </ColorPicker.Control>
                <ColorPicker.Positioner>
                  <ColorPicker.Content>
                    <ColorPicker.Area />
                    <ColorPicker.Input />
                  </ColorPicker.Content>
                </ColorPicker.Positioner>
              </ColorPicker.Root>

              <ActionBar.Separator />

              <Button variant="outline" size="sm" onClick={handleAddCategory}>
                <Plus />
                Create New Category
              </Button>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
      </main>
    </div>
  );
}
