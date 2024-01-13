/* eslint-disable jsx-a11y/control-has-associated-label */
import { useCallback, useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader } from '@/Components/ui/sheet';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { StarIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectSelectedProject,
  updateProject,
} from '@/store/Slices/projectsSlice';
import { Project } from '../../db/entity';
import DebounceInput from '../Components/DebounceInput';
import { handleOpenInAbleton, handleOpenInFinder } from '../hooks/handlers';
import TagInput from '../Components/TagInput';

function ProjectView({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const dispatch = useDispatch();
  const project = useSelector(selectSelectedProject) as Project;
  const [isOpen, setIsOpen] = useState(open);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: { key: string }) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose]);

  const handleOpen = (b: boolean): void => {
    if (b) {
      return;
    }
    handleClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpen}>
      <SheetContent className="w-[100%] md:max-w-[60%] lg:max-w-[50%] xl:max-w-[45%] 2xl:max-w-[45%]  sm:max-w-[80%]">
        <SheetHeader>
          <DebounceInput
            value={project.title}
            onChange={(value: string) => {
              dispatch(updateProject({ ...project, title: value }));
            }}
            placeholder="Title..."
            className="w-11/12 p-0 border-none shadow-none text-2xl font-semibold focus:ring-0 focus:outline-none"
          />
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <span className="space-x-2 select-none">
              <Badge
                onClick={() => {
                  dispatch(
                    updateProject({ ...project, favorite: !project.favorite }),
                  );
                }}
                variant="outline"
                className="cursor-pointer"
              >
                {project.favorite ? (
                  <>
                    <StarSolidIcon className="h-4 w-4 mr-1" />
                    Remove from favorites
                  </>
                ) : (
                  <>
                    <StarIcon className="h-4 w-4 mr-1" />
                    Add to favorites
                  </>
                )}
              </Badge>
              <Badge
                onClick={() => {
                  dispatch(
                    updateProject({ ...project, hidden: !project.hidden }),
                  );
                }}
                variant="outline"
                className="cursor-pointer"
              >
                {project.hidden ? (
                  <>
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Unhide
                  </>
                ) : (
                  <>
                    <EyeSlashIcon className="h-4 w-4 mr-1" />
                    Hide
                  </>
                )}
              </Badge>
            </span>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">BPM</Label>
            <div className="col-span-3 flex">
              <DebounceInput
                type="number"
                value={project.bpm ?? ''}
                onChange={(value: string) => {
                  const bpm = parseInt(value, 10);
                  dispatch(updateProject({ ...project, bpm }));
                }}
                placeholder="BPM..."
                className="w-32"
              />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Genre</Label>
            <DebounceInput
              value={project.genre ?? ''}
              onChange={(value: string) => {
                const genre = value;
                dispatch(updateProject({ ...project, genre }));
              }}
              placeholder="Genre..."
              className="w-32"
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Tags</Label>
            <span className="space-x-2 col-span-3 -ml-1">
              <TagInput
                value={project.tagNames ?? []}
                onChange={(value: string[]) => {
                  dispatch(updateProject({ ...project, tagNames: value }));
                }}
                className="w-full bg-inherit focus:outline-none"
              />
            </span>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Path</Label>
            <p className="text-muted-foreground">{project.path}</p>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Last modified</Label>
            <p className="text-muted-foreground">
              {project.modifiedAt.toString()}
            </p>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Added</Label>
            <p className="text-muted-foreground">
              {project.createdAt.toString()}
            </p>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Open in</Label>
            <span className="space-x-2 select-none">
              <Badge
                onClick={() => handleOpenInAbleton(project.id)}
                className="cursor-pointer"
              >
                Ableton
              </Badge>
              <Badge
                onClick={() => handleOpenInFinder(project.id)}
                className="cursor-pointer"
                variant="secondary"
              >
                Finder
              </Badge>
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ProjectView;
