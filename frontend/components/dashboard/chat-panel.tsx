'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Sparkles } from 'lucide-react';

import type { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

type ChatPanelProps = {
  messages: Message[];
  loading: boolean;
  onSubmit: (query: string) => void;
};

function TypingAnswer({ content }: { content: string }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const id = setInterval(() => {
      setVisibleCount((count) => {
        if (count >= content.length) {
          clearInterval(id);
          return count;
        }
        return count + 2;
      });
    }, 12);

    return () => clearInterval(id);
  }, [content]);

  return <p className='whitespace-pre-wrap text-sm leading-relaxed'>{content.slice(0, visibleCount)}</p>;
}

export function ChatPanel({ messages, loading, onSubmit }: ChatPanelProps) {
  const [query, setQuery] = useState('');

  const latestHint = useMemo(() => {
    if (!messages.length) {
      return 'Ask a question about your uploaded PDFs.';
    }
    return 'Ask follow-up questions to keep exploring your documents.';
  }, [messages]);

  function handleSend() {
    if (!query.trim() || loading) {
      return;
    }
    onSubmit(query.trim());
    setQuery('');
  }

  return (
    <Card className='flex h-[calc(100vh-2rem)] flex-col p-4'>
      <div className='flex items-center gap-2 pb-4'>
        <Sparkles className='h-4 w-4 text-primary' />
        <h2 className='text-lg font-semibold'>DocuSense</h2>
      </div>

      <ScrollArea className='flex-1'>
        <div className='space-y-4 pr-2'>
          {!messages.length ? (
            <div className='rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground'>
              {latestHint}
            </div>
          ) : null}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                message.role === 'user'
                  ? 'ml-auto max-w-[82%] rounded-2xl bg-primary/20 p-4'
                  : 'mr-auto max-w-[82%] rounded-2xl border border-border bg-card/50 p-4'
              }
            >
              {message.role === 'assistant' ? (
                <TypingAnswer content={message.content} />
              ) : (
                <p className='whitespace-pre-wrap text-sm leading-relaxed'>{message.content}</p>
              )}
            </motion.div>
          ))}

          {loading ? (
            <div className='space-y-2'>
              <Skeleton className='h-5 w-4/5' />
              <Skeleton className='h-5 w-3/5' />
            </div>
          ) : null}
        </div>
      </ScrollArea>

      <div className='pt-4'>
        <div className='relative'>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Ask anything about your documents...'
            className='pr-14'
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type='button'
            size='icon'
            className='absolute bottom-3 right-3'
            disabled={loading}
            onClick={handleSend}
          >
            <ArrowUp className='h-4 w-4' />
          </Button>
        </div>
        <p className='mt-2 text-xs text-muted-foreground'>{latestHint}</p>
      </div>
    </Card>
  );
}
