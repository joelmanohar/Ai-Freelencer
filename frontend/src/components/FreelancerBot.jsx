import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Bot, X } from 'lucide-react';
import { aiChatApi } from '../api/client';

const welcomeMessage = {
  role: 'assistant',
  content: "Hi! I’m your FreelanceHub AI assistant. I can help with projects, proposals, hiring, profiles, payments, and getting started. What would you like to work on?"
};

const quickQuestions = [
  'How do I write a strong proposal?',
  'How can I find the right freelancer?'
];

export default function FreelancerBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, open]);

  async function sendMessage(text = draft) {
    const content = text.trim();
    if (!content || busy || content.length > 1000) return;

    const previousMessages = messages.slice(-10).map(({ role, content: message }) => ({ role, content: message }));
    setMessages(current => [...current, { role: 'user', content }]);
    setDraft('');
    setBusy(true);

    try {
      const response = await aiChatApi.ask(content, previousMessages);
      setMessages(current => [...current, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      const message = error.response?.data?.message || 'Sorry, I could not reach the assistant. Please try again in a moment.';
      setMessages(current => [...current, { role: 'assistant', content: message, error: true }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`freelancer-bot ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="freelancer-bot__panel" aria-label="Freelancer help chat">
          <header className="freelancer-bot__header">
            <div className="freelancer-bot__identity">
              <span className="freelancer-bot__avatar" aria-hidden="true"><Bot size={21} strokeWidth={1.8} /></span>
              <span>
                <strong>FreelanceHub AI</strong>
                <small><i /> Online · Freelancer support</small>
              </span>
            </div>
            <button className="freelancer-bot__close" type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={19} />
            </button>
          </header>

          <div className="freelancer-bot__messages" role="log" aria-live="polite" aria-relevant="additions text">
            {messages.map((message, index) => (
              <div className={`freelancer-bot__message freelancer-bot__message--${message.role}${message.error ? ' has-error' : ''}`} key={`${index}-${message.role}`}>
                {message.content}
              </div>
            ))}
            {messages.length === 1 && !busy && (
              <div className="freelancer-bot__suggestions">
                {quickQuestions.map(question => (
                  <button key={question} type="button" onClick={() => sendMessage(question)}>{question}</button>
                ))}
              </div>
            )}
            {busy && <div className="freelancer-bot__typing"><span /><span /><span /><span className="sr-only">Assistant is typing</span></div>}
            <div ref={bottomRef} />
          </div>

          <form className="freelancer-bot__form" onSubmit={event => { event.preventDefault(); sendMessage(); }}>
            <label className="sr-only" htmlFor="freelancer-bot-input">Ask a freelancer question</label>
            <textarea
              id="freelancer-bot-input"
              value={draft}
              onChange={event => setDraft(event.target.value.slice(0, 1000))}
              placeholder="Ask anything about freelancing..."
              maxLength={1000}
              disabled={busy}
              rows={1}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button type="submit" aria-label="Send message" disabled={busy || !draft.trim()}>
              <ArrowUp size={18} />
            </button>
          </form>
          <p className="freelancer-bot__privacy">AI responses may be inaccurate. Don’t share passwords or payment details.</p>
        </section>
      )}

      <button
        className="freelancer-bot__launcher"
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label={open ? 'Close FreelanceHub AI' : 'Open FreelanceHub AI'}
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <span className="freelancer-bot__orb" aria-hidden="true"><Bot size={27} strokeWidth={1.8} /></span>}
      </button>
    </div>
  );
}
