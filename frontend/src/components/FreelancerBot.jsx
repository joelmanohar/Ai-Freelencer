import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { aiChatApi } from '../api/client';

const welcomeMessage = {
  role: 'assistant',
  content: "Hi! I'm your FreelanceHub guide. Ask me about finding projects, proposals, hiring, profiles, or payments."
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
              <span className="freelancer-bot__avatar"><img src="/freelancer-bot.png" alt="" /></span>
              <span>
                <strong>FreelanceHub Guide</strong>
                <small><i /> Here to help with freelancing</small>
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
            <input
              id="freelancer-bot-input"
              value={draft}
              onChange={event => setDraft(event.target.value.slice(0, 1000))}
              placeholder="Ask about freelancing..."
              maxLength={1000}
              disabled={busy}
            />
            <button type="submit" aria-label="Send message" disabled={busy || !draft.trim()}>
              <Send size={17} />
            </button>
          </form>
          <p className="freelancer-bot__privacy">Replies use OpenRouter’s NVIDIA free model. Avoid sharing passwords, payment details, or private information.</p>
        </section>
      )}

      <button
        className="freelancer-bot__launcher"
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label={open ? 'Close FreelanceHub chat' : 'Open FreelanceHub chat'}
        aria-expanded={open}
      >
        {open ? <X size={23} /> : <>
          <img src="/freelancer-bot.png" alt="" />
          <span className="freelancer-bot__sparkle"><Sparkles size={13} /></span>
        </>}
      </button>
    </div>
  );
}
