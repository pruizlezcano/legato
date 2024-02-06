import { Input } from '@/Components/ui/input';
import React, { ChangeEvent, useRef } from 'react';
import { cn } from '@/utils';
import { Card, CardContent } from '@/Components/ui/card';
import { InboxArrowDownIcon } from '@heroicons/react/24/outline';

interface DropzoneProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange'
  > {
  classNameWrapper?: string;
  className?: string;
  dropMessage: string;
  handleOnDrop: (acceptedFiles: FileList | null) => void;
  handleOnDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  fileType?: string;
  multiple: boolean;
}

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  (
    {
      className,
      classNameWrapper,
      dropMessage,
      handleOnDrop,
      handleOnDragOver,
      fileType,
      multiple,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    // Function to handle drag over event
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (handleOnDragOver) {
        handleOnDragOver(e);
      }
    };

    // Function to handle drop event
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const { files } = e.dataTransfer;
      if (inputRef.current) {
        inputRef.current.files = files;
        handleOnDrop(files);
      }
    };

    // Function to simulate a click on the file input element
    const handleButtonClick = () => {
      if (inputRef.current) {
        inputRef.current.click();
      }
    };
    return (
      <Card
        ref={ref}
        className={cn(
          `border-2 border-dashed bg-muted hover:cursor-pointer hover:border-muted-foreground/50`,
          classNameWrapper,
        )}
      >
        <CardContent
          className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="flex items-center justify-center text-muted-foreground">
            <span className="font-medium flex">
              <InboxArrowDownIcon className="h-4 w-4 mr-2" />
              {dropMessage}
            </span>
            <Input
              {...props}
              value={undefined}
              ref={inputRef}
              type="file"
              accept={fileType}
              className={cn('hidden', className)}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleOnDrop(e.target.files)
              }
              multiple={multiple}
            />
          </div>
        </CardContent>
      </Card>
    );
  },
);

export default Dropzone;
