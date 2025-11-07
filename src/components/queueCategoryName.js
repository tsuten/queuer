"use client";

import { useState } from "react";
import { renameCategory } from "../utils/electronDb";

export default function QueueCategoryName({ category }) {
    const [categoryName, setCategoryName] = useState(category.name);

    const handleRenameCategory = async (newName) => {
        const result = await renameCategory(category.id, newName);
        if (result.success) {
            setCategoryName(newName);
        } else {
            setCategoryName(category.name);
        }
    }

    return (
        <div>
            <input className="text-xl font-bold focus:outline-1 mr-2" type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} onBlur={() => handleRenameCategory(categoryName)} />
        </div>
    )
}