import { useState } from "react";

export default function QueuePushInput({ onPush }) {
    const [input, setInput] = useState("");

    const handlePush = () => {
        if (!input.trim()) return; // 空の入力を防ぐ
        onPush(input);
        setInput("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handlePush();
        }
    };

    return (
        <div className="">
            <input 
                type="text" 
                placeholder="Enter item" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-2 border-gray-300 rounded-md p-2 m-2" 
            />
            <button 
                onClick={handlePush} 
                className="bg-blue-500 text-white px-2 py-1 rounded-md cursor-pointer"
            >
                Push
            </button>
        </div>
    );
}
