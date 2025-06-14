'use client';

import type { UIMessage } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ChangeEvent,
  memo,
  type DragEvent,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { ArrowUpIcon, CornerDownRightIcon, Paperclip, PaperclipIcon, StopCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { SuggestedActions } from './suggested-actions';
import type { UseChatHelpers } from '@ai-sdk/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import Image from 'next/image';
import { usePdfStore } from '@/store/usePdfStore';

type Attachment = {
  file: File;
  preview?: string;
};

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  append: UseChatHelpers['append'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { width } = useWindowSize();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { selectedText, clearSelectedText } = usePdfStore();

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_FILE_TYPES = [
    'image/*',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/rtf',
    'text/csv',
    'application/json',
  ];

  const ALLOWED_EXTENSIONS = [
    '.md',
    '.markdown',
    '.txt',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.rtf',
    '.csv',
    '.json',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.svg'
  ];

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (!chatId) {
      setInput('');
      setAttachments([]);
      setLocalStorageInput('');
      if (textareaRef.current) {
        textareaRef.current.value = '';
        resetHeight();
      }
    }
  }, [chatId, setInput, setLocalStorageInput]);

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        240
      )}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '44px';
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File ${file.name} is too large. Maximum file size is 50MB.`);
      return false;
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.includes(extension || '');

    // Check MIME type
    const isAllowedType = ALLOWED_FILE_TYPES.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });

    // For markdown files, we need to be more lenient as browsers might not set the correct MIME type
    const isMarkdown = extension === '.md' || extension === '.markdown';

    if (!isAllowedType && !isMarkdown && !hasValidExtension) {
      toast.error(`File type ${file.type} is not supported. Please upload images, documents (PDF, DOC, DOCX, MD, TXT, RTF), spreadsheets (XLS, XLSX), presentations (PPT, PPTX), or data files (CSV, JSON).`);
      return false;
    }

    return true;
  };

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(validateFile);
    
    const newAttachments = await Promise.all(
      validFiles.map(async (file) => {
        let preview;
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
        }
        return { file, preview };
      })
    );

    setAttachments((current) => [...current, ...newAttachments]);
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      await processFiles(files);
    },
    [],
  );

  const handleRemoveFile = (index: number) => {
    setAttachments((current) => {
      const newAttachments = [...current];
      const removed = newAttachments.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newAttachments;
    });
  };

  const submitForm = useCallback(() => {
    // Set active chat ID immediately when submitting
    // setActiveChatId(chatId);

    handleSubmit(undefined, {
      experimental_attachments: attachments.map((attachment) => ({
        url: attachment.preview || '',
        name: attachment.file.name,
        contentType: attachment.file.type,
      })),
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
  ]);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await processFiles(files);
  };


  return (
    <div className="w-full flex flex-col gap-4">
      {messages.length === 0 && attachments.length === 0 && !selectedText && (
        <SuggestedActions append={append} chatId={chatId} />
      )}

      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        multiple
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <div 
        className={cx(
          'border border-input rounded-3xl p-2',
          isDragging && 'border-primary bg-muted/50'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-3xl pointer-events-none">
            <div className="text-center">
              <PaperclipIcon className="size-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Drop files here</p>
            </div>
          </div>
        )}
        {selectedText && (
          <div className="flex flex-col w-full rounded-lg border border-muted bg-muted/40 px-4 py-2 mb-3 text-sm text-foreground/90 gap-2 overflow-hidden group">
            <div className="flex items-center gap-3 min-w-0">
              <CornerDownRightIcon className="size-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate font-medium" title={selectedText.text}>{selectedText.text}</span>
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {selectedText.documentName}
              </span>
              <button
                onClick={clearSelectedText}
                className="ml-auto hover:bg-muted/80 rounded-full p-1.5 flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Remove selected text"
                type="button"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
        {attachments.length > 0 && (
          <div
            data-testid="attachments-preview"
            className="flex flex-wrap gap-2 pb-2"
          >
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              >
                {attachment.file.type.startsWith('image/') ? (
                  <div className="w-8 h-8 rounded-md overflow-hidden">
                    <Image
                      src={attachment.preview || ''}
                      alt={attachment.file.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <PaperclipIcon className="size-4" />
                )}
                <span className="max-w-[120px] truncate">{attachment.file.name}</span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="hover:bg-secondary/50 rounded-full p-1"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Textarea
          data-testid="multimodal-input"
          ref={textareaRef}
          placeholder="Ask me anything..."
          value={input}
          onChange={handleInput}
          className={cx(
            'min-h-[44px] max-h-[240px] text-primary resize-none rounded-3xl !text-base bg-background border-none p-2 pr-20 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
            className,
          )}
          rows={1}
          autoFocus
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();

              if (status !== 'ready') {
                toast.error('Please wait for the model to finish its response!');
              } else {
                submitForm();
              }
            }
          }}
        />
        <div className='flex items-center gap-2 justify-between'>
          <Tooltip>
            <TooltipTrigger asChild disabled={false}>
              <label
                htmlFor="file-upload"
                className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl"
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Paperclip className="text-primary size-5" />
              </label>
            </TooltipTrigger>
            <TooltipContent side="top" className='text-xs'>
              Attach files
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild disabled={false}>
              {status === 'submitted' ? (
                <Button
                  data-testid="stop-button"
                  className="rounded-full p-1.5 h-8 w-8 border"
                  onClick={(event) => {
                    event.preventDefault();
                    stop();
                    setMessages((messages) => messages);
                  }}
                >
                  <StopCircle size={16} />
                </Button>
              ) : (
                <Button
                  data-testid="send-button"
                  className="rounded-full p-1.5 h-8 w-8 border"
                  onClick={(event) => {
                    event.preventDefault();
                    submitForm();
                  }}
                  disabled={input.length === 0 && attachments.length === 0}
                >
                  <ArrowUpIcon size={16} />
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent side="top" className='text-xs'>
              {status === 'submitted' ? "Stop generation" : "Send message"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    if (prevProps.chatId !== nextProps.chatId) return false;
    return true;
  },
);
