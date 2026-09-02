import { useEffect, useRef } from 'react';
import { CloseIcon, SparkIcon } from '../../../shared/Icons';
import type { SessionSummary } from '../chat.types';
import type { SummaryStatus } from '../hooks/useSessionSummary';

interface SessionSummaryModalProps {
  status: SummaryStatus;
  summary: SessionSummary | null;
  error: string;
  onClose: () => void;
  onRetry: () => void;
  onNewSession: () => void;
}

function SessionSummaryModal({
  status,
  summary,
  error,
  onClose,
  onRetry,
  onNewSession,
}: SessionSummaryModalProps) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) {
          event.preventDefault();
          dialogRef.current.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [onClose, status]);

  return (
    <div className="summary-backdrop">
      <section
        ref={dialogRef}
        className="summary-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
        tabIndex={-1}
      >
        <header className="summary-header">
          <div>
            <p className="eyebrow">SESSION COMPLETE</p>
            <h2 id="summary-title">本次练习总结</h2>
          </div>
          <button
            className="icon-button summary-close"
            type="button"
            aria-label="关闭总结"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        {status === 'loading' && (
          <div className="summary-state" role="status">
            <span className="summary-loader">
              <SparkIcon size={25} />
            </span>
            <h3>正在回顾你的表达…</h3>
            <p>SpeakMentor 正在提炼最值得保留和改进的内容。</p>
          </div>
        )}

        {status === 'error' && (
          <div className="summary-state">
            <h3>暂时无法生成总结</h3>
            <p>{error}</p>
            <button className="start-button" type="button" onClick={onRetry}>
              重新生成
            </button>
          </div>
        )}

        {status === 'success' && summary && (
          <div className="summary-content">
            <p className="summary-topic">主题 · {summary.topic}</p>

            <section>
              <h3>你做得好的地方</h3>
              <ul>
                {summary.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3>最值得改进的 3 点</h3>
              <ol>
                {summary.improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>

            <section>
              <h3>更自然的表达</h3>
              <div className="expression-list">
                {summary.naturalExpressions.map((item) => (
                  <blockquote key={item}>{item}</blockquote>
                ))}
              </div>
            </section>

            <section className="next-practice">
              <h3>下一次练习</h3>
              <p>{summary.nextPracticeSuggestion}</p>
            </section>
          </div>
        )}

        {status === 'success' && (
          <footer className="summary-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              查看对话
            </button>
            <button className="start-button" type="button" onClick={onNewSession}>
              开始新会话
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}

export default SessionSummaryModal;
