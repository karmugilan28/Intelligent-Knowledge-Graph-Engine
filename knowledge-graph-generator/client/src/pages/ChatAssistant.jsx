import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Send, Bot, User, RefreshCw, Layers, Database, Compass } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';

// Inline helper to support **bolding** and `code` highlights
const renderInlineMarkdown = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-indigo-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[10px] font-mono px-1.5 py-0.5 rounded text-pink-400">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

// Dynamic Markdown Renderer for Premium UI
const MarkdownRenderer = ({ text }) => {
  if (!text) return null;

  // Split content by code blocks to separate formatted text from code syntax
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="flex flex-col gap-2 font-medium w-full text-left">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code content
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);
          
          return (
            <div key={index} className="my-2 bg-[var(--bg-secondary)]/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden font-mono text-[11px] text-[var(--text-primary)] w-full shadow-inner">
              <div className="bg-[var(--bg-secondary)]/80 px-4 py-2 border-b border-slate-950 text-[10px] font-bold uppercase text-[var(--text-secondary)] flex justify-between items-center select-none">
                <span>{lang || 'code'}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(code.trim())}
                  className="text-[9px] hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors focus:outline-none cursor-pointer"
                >
                  Copy Code
                </button>
              </div>
              <pre className="p-4 overflow-x-auto whitespace-pre">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        } else {
          // Split block by lines to parse headings, bullet lists, numbered lists
          const lines = part.split('\n');
          return (
            <div key={index} className="flex flex-col gap-1.5 w-full">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (!trimmed && line === '') return <div key={lIdx} className="h-1" />;

                // Headings
                if (trimmed.startsWith('### ')) {
                  return <h4 key={lIdx} className="text-xs font-black text-indigo-350 mt-2.5 mb-0.5">{renderInlineMarkdown(trimmed.slice(4))}</h4>;
                }
                if (trimmed.startsWith('## ')) {
                  return <h3 key={lIdx} className="text-sm font-black text-indigo-355 mt-3.5 mb-1">{renderInlineMarkdown(trimmed.slice(3))}</h3>;
                }
                if (trimmed.startsWith('# ')) {
                  return <h2 key={lIdx} className="text-base font-black text-indigo-360 mt-4.5 mb-1.5">{renderInlineMarkdown(trimmed.slice(2))}</h2>;
                }

                // Bullet Lists
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-2">
                      <span className="text-indigo-400 select-none mt-1">•</span>
                      <span className="flex-1">{renderInlineMarkdown(trimmed.slice(2))}</span>
                    </div>
                  );
                }

                // Numbered Lists
                if (/^\d+\.\s/.test(trimmed)) {
                  const match = trimmed.match(/^(\d+)\.\s(.*)/);
                  if (match) {
                    return (
                      <div key={lIdx} className="flex items-start gap-2 pl-2">
                        <span className="text-indigo-400 font-bold select-none">{match[1]}.</span>
                        <span className="flex-1">{renderInlineMarkdown(match[2])}</span>
                      </div>
                    );
                  }
                }

                // Standard paragraph
                return <p key={lIdx} className="leading-relaxed">{renderInlineMarkdown(line)}</p>;
              })}
            </div>
          );
        }
      })}
    </div>
  );
};

const ChatAssistant = () => {
  const { documentId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Explainability details for the last generated RAG response
  const [lastCitations, setLastCitations] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`/api/chat/${documentId}`);
      if (response.data.success) {
        setMessages(response.data.data.messages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const query = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistically push user message
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setLastCitations(null);

    try {
      const response = await axios.post(`/api/chat/${documentId}`, {
        question: query,
      });

      if (response.data.success) {
        const { answer, chunks, concepts } = response.data.data;
        setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
        
        // Populate citation cards
        setLastCitations({ chunks, concepts });
      }
    } catch (err) {
      console.error('RAG request failed:', err.message);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Apologies, I encountered an issue while retrieving document and graph contexts to answer your question.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell activeDocumentId={documentId}>
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-[calc(100vh-64px)] md:h-screen">
        {/* Left: Chat thread */}
        <div className="flex-1 flex flex-col overflow-hidden h-[60vh] md:h-full">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--text-secondary)]">
                <MessageSquare className="w-12 h-12 mb-3 text-[var(--text-tertiary)] animate-pulse" />
                <p className="text-sm font-bold">Graph-Aware Chat Assistant</p>
                <p className="text-xs max-w-[320px] mt-1">
                  Ask questions about formulas, proofs, or definitions in the document. The AI matches semantic chunks and checks prerequisites.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed border ${
                      msg.role === 'user'
                        ? 'bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-primary)] self-end rounded-tr-none'
                        : 'bg-indigo-950/20 border-indigo-900/30 text-indigo-100 self-start rounded-tl-none'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-[var(--text-secondary)]" />
                      ) : (
                        <Bot className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                      <span className="font-bold text-[10px] tracking-wider uppercase text-[var(--text-secondary)]">
                        {msg.role === 'user' ? 'Student' : 'Assistant'}
                      </span>
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-line font-medium">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer text={msg.content} />
                      )}
                    </div>
                  </div>
                ))}
                
                {sending && (
                  <div className="bg-indigo-950/10 border border-indigo-900/20 p-4 rounded-2xl text-xs text-indigo-300 self-start rounded-tl-none flex items-center gap-3 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Searching context vectors & graph relationships...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Form input bar */}
          <form onSubmit={handleSendMessage} className="p-4 glass border-t border-[var(--border-primary)] flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] transition-colors"
              placeholder="Ask anything about the text..."
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-[var(--border-primary)] text-white p-3 rounded-xl border border-indigo-500/40 disabled:border-[var(--border-primary)] flex items-center justify-center transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Explainable Citations Panel */}
        <div className="w-full md:w-[350px] glass border-t md:border-t-0 md:border-l border-[var(--border-primary)]/80 p-6 flex flex-col gap-5 overflow-y-auto max-h-[40vh] md:max-h-full">
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 border-b border-[var(--border-primary)] pb-3 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>RAG Reference Citations</span>
          </h3>

          {!lastCitations ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] py-10">
              <Compass className="w-10 h-10 mb-3 text-[var(--text-tertiary)]" />
              <p className="text-xs font-bold">No query selected</p>
              <p className="text-[10px] max-w-[200px] mt-0.5">
                Send a question to inspect the underlying semantic vectors and concept neighbors utilized in the response.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 text-xs">
              {/* Matching Concepts */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Matched Concepts</span>
                </span>
                <div className="flex flex-col gap-2">
                  {lastCitations.concepts.map((c) => (
                    <div
                      key={c.name}
                      className="bg-[var(--bg-secondary)]/60 border border-[var(--border-primary)] p-3 rounded-xl"
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-[var(--text-primary)]">{c.name}</span>
                        <span className="text-[10px] text-indigo-400">{(c.score * 100).toFixed(0)}% sim</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-1 line-clamp-2">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matching chunks */}
              <div className="flex flex-col gap-2 border-t border-[var(--border-primary)] pt-4">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-pink-400" />
                  <span>Source Text Chunks</span>
                </span>
                <div className="flex flex-col gap-2">
                  {lastCitations.chunks.map((ch) => (
                    <div
                      key={ch.chunkNumber}
                      className="bg-[var(--bg-secondary)]/60 border border-[var(--border-primary)] p-2.5 rounded-xl flex justify-between items-center"
                    >
                      <span className="text-[var(--text-primary)] font-semibold">Chunk #{ch.chunkNumber}</span>
                      <span className="text-[10px] text-pink-400 font-bold">{(ch.score * 100).toFixed(0)}% similarity</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default ChatAssistant;
