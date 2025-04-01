/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

// eslint-disable-next-line react/function-component-definition
const TagInput = ({
  value,
  onChange,
  className = '',
  placeholder = '',
  maxTags,
  variant = 'default',
}: {
  value: string[];
  onChange: (e: any) => void;
  className?: string;
  placeholder?: string;
  maxTags?: number;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}) => {
  const [tags, setTags] = useState(value);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [editInputValue]);

  const saveTags = useCallback(
    (newTags: string[]) => {
      setTags(newTags);
      onChange(newTags);
    },
    [setTags, onChange],
  );

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    saveTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = useCallback(() => {
    if (inputValue && !tags.includes(inputValue)) {
      saveTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  }, [inputValue, tags, saveTags]);

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  const handleEditInputConfirm = useCallback(() => {
    const newTags = [...tags];
    newTags[editInputIndex] = editInputValue;

    saveTags(newTags);
    setEditInputIndex(-1);
    setEditInputValue('');
  }, [editInputIndex, editInputValue, tags, saveTags]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (inputValue) handleInputConfirm();
        else if (editInputValue) handleEditInputConfirm();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [handleInputConfirm, handleEditInputConfirm, inputValue, editInputValue]);

  return (
    <div className={cn('flex flex-wrap', className)}>
      {tags.map((tag, index) => {
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={tag}
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              className="px-2.5 py-0.5 m-1 w-36 h-5 text-xs font-semibold transition-colors"
            />
          );
        }
        const isLongTag = tag.length > 20;
        const tagElem = (
          <Badge
            key={tag}
            variant={variant}
            className="m-1 select-none cursor-text"
          >
            <span
              onDoubleClick={(e) => {
                setEditInputIndex(index);
                setEditInputValue(tag);
                e.preventDefault();
              }}
              className="truncate max-w-[102px]"
            >
              {tag}
            </span>
            <button type="button" onClick={() => handleClose(tag)}>
              <XMarkIcon className="w-4 h-4 ml-1" />
            </button>
          </Badge>
        );
        return isLongTag ? (
          <TooltipProvider key={tag}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{tagElem}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tag}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          tagElem
        );
      })}
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          className="px-2.5 py-0.5 m-1 mb-1.5 w-32 h-5 text-xs font-semibold transition-colors"
        />
      ) : maxTags && tags.length >= maxTags ? null : (
        <Badge
          variant="outline"
          className="border-dashed m-1 select-none cursor-text"
          onClick={showInput}
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          {placeholder || 'Add Tag'}
        </Badge>
      )}
    </div>
  );
};

export default TagInput;
