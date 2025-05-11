import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, addMessage } from '../slices/chatbotSlice';

export default function Chatbot() {
    const dispatch = useDispatch();
    const { messages } = useSelector(state => state.chatbot);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            dispatch(addMessage({ from: 'user', text: input }));
            dispatch(sendMessage(input));
            setInput('');
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded p-4">
            <div className="h-48 overflow-y-auto mb-2">
                {messages.map((msg, i) => (
                    <div key={i} className={`mb-1 ${msg.from === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block px-2 py-1 rounded ${msg.from === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>{msg.text}</span>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input className="input flex-1" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about appointments..." />
                <button className="btn-primary" onClick={handleSend}>Send</button>
            </div>
        </div>
    );
}