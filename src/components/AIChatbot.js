"use client";
import React, { useState, useRef, useEffect } from 'react';
import styles from './AIChatbot.module.css';
import { PC_PARTS } from '@/lib/pcParts';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hi! I am your AI Tech Advisor. What kind of system are you building, or what component are you looking for?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateUnbiasedAdvice = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('cpu') || lowerInput.includes('processor')) {
      return "If you're focused on pure productivity and heavy multi-core tasks, the AMD Ryzen 9 7950X is arguably the best workstation CPU right now. However, if your primary goal is gaming and single-core speed, the Intel Core i9-14900K edges it out slightly. For budget builds, the Ryzen 5 7600X offers incredible value for the AM5 platform.";
    }
    if (lowerInput.includes('gpu') || lowerInput.includes('graphics card')) {
      return "For GPUs, Nvidia dominates the extreme high-end with the RTX 4090, but it's wildly expensive. If you want high-end performance at a slightly better value, the AMD Radeon RX 7900 XTX trades blows with the 4080 Super for less money. For a solid mid-range 1440p gaming setup, the RTX 4070 SUPER is currently the sweet spot.";
    }
    if (lowerInput.includes('ram') || lowerInput.includes('memory')) {
      return "DDR5 is the current standard. You'll want at least 32GB (2x16GB) running at 6000MHz with CL30 timings for optimal gaming performance on both Intel and AMD. Corsair Vengeance and G.Skill Trident are both highly reliable brands.";
    }
    if (lowerInput.includes('psu') || lowerInput.includes('power supply')) {
      return "Never skimp on the power supply. Always buy from a reputable brand (Corsair, Seasonic, EVGA) with at least an 80+ Gold rating. If you're running a 4070 or higher, I strongly advise a minimum of 750W. For a 4090, 1000W is the absolute safest baseline.";
    }
    if (lowerInput.includes('build a pc') || lowerInput.includes('setup')) {
      return "I recommend heading over to our 'Build a Setup' tool! It has a built-in AI compatibility engine that ensures you don't accidentally buy a CPU and motherboard with mismatching sockets, and it tracks power draw so you don't buy a weak PSU.";
    }

    return "That's an interesting question. While I'm still learning about that specific component, I highly recommend checking out independent benchmarks from channels like Gamers Nexus or Hardware Unboxed before making a purchase. Avoid relying purely on brand marketing.";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Realistic typing delay based on response length
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = generateUnbiasedAdvice(userMsg.text);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiResponse }]);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (isDismissed) return null;

  return (
    <div className={styles.chatbotWrapper}>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <span className={styles.statusDot}></span>
              <h4>AI Tech Advisor</h4>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Minimize Chat">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          
          <div className={styles.chatBody}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.message} ${msg.sender === 'ai' ? styles.aiMsg : styles.userMsg}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className={`${styles.message} ${styles.aiMsg} ${styles.typingIndicator}`}>
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInputArea}>
            <input 
              type="text" 
              placeholder="Ask me for unbiased advice..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className={styles.chatInput}
            />
            <button onClick={handleSend} className={styles.sendBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <div style={{ position: 'relative' }}>
          <button 
            className={styles.fab} 
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Tech Advisor"
          >
            <span className={styles.fabIcon}>🤖</span>
            <span className={styles.fabNotification}>1</span>
          </button>
          <button 
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss Chatbot permanently"
            style={{
              position: 'absolute',
              top: '-5px',
              left: '-5px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
