import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Dog } from '@/types/dog';
import type { Rescue } from '@/hooks/useRescues';
import type { DogFormData, RescueFormData } from '../Admin.types';
import { initialFormData, initialRescueFormData } from '../Admin.types';
import {
  createOpenDialogHandler,
  createFileChangeHandler,
  createClearImageHandler,
  handleDogSubmit,
  handleDogDelete,
} from './AdminDogHandlers';
import {
  createOpenRescueDialogHandler,
  handleRescueSubmit,
  handleRescueDelete,
} from './AdminRescueHandlers';

export function useAdminState(rescues: Rescue[]) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [formData, setFormData] = useState<DogFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Rescue state
  const [isRescueDialogOpen, setIsRescueDialogOpen] = useState(false);
  const [editingRescue, setEditingRescue] = useState<Rescue | null>(null);
  const [rescueFormData, setRescueFormData] = useState<RescueFormData>(initialRescueFormData);
  const [isRescueSubmitting, setIsRescueSubmitting] = useState(false);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dogs'] });
    queryClient.invalidateQueries({ queryKey: ['rescues'] });
  }, [queryClient]);

  const setDogState = useCallback((updates: {
    isDialogOpen?: boolean;
    editingDog?: Dog | null;
    formData?: DogFormData;
    imageFile?: File | null;
    imagePreview?: string | null;
    isSubmitting?: boolean;
  }) => {
    if (updates.isDialogOpen !== undefined) setIsDialogOpen(updates.isDialogOpen);
    if (updates.editingDog !== undefined) setEditingDog(updates.editingDog);
    if (updates.formData !== undefined) setFormData(updates.formData);
    if (updates.imageFile !== undefined) setImageFile(updates.imageFile);
    if (updates.imagePreview !== undefined) setImagePreview(updates.imagePreview);
    if (updates.isSubmitting !== undefined) setIsSubmitting(updates.isSubmitting);
  }, []);

  const setRescueState = useCallback((updates: {
    isRescueDialogOpen?: boolean;
    editingRescue?: Rescue | null;
    rescueFormData?: RescueFormData;
    isRescueSubmitting?: boolean;
  }) => {
    if (updates.isRescueDialogOpen !== undefined) setIsRescueDialogOpen(updates.isRescueDialogOpen);
    if (updates.editingRescue !== undefined) setEditingRescue(updates.editingRescue);
    if (updates.rescueFormData !== undefined) setRescueFormData(updates.rescueFormData);
    if (updates.isRescueSubmitting !== undefined) setIsRescueSubmitting(updates.isRescueSubmitting);
  }, []);

  const handleOpenDialog = createOpenDialogHandler(rescues, setDogState);
  const handleFileChange = createFileChangeHandler(setDogState, toast);
  const handleClearImage = createClearImageHandler(editingDog, fileInputRef, setDogState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleDogSubmit(formData, imageFile, editingDog, toast, setDogState, refreshData);
  };

  const handleDelete = async (dogId: string) => {
    await handleDogDelete(dogId, toast, refreshData);
  };

  const handleOpenRescueDialog = createOpenRescueDialogHandler(setRescueState);

  const handleRescueSubmitClick = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRescueSubmit(rescueFormData, editingRescue, toast, setRescueState, refreshData);
  };

  const handleRescueDeleteClick = async (rescueId: string) => {
    await handleRescueDelete(rescueId, toast, refreshData);
  };

  return {
    // Dog state
    isDialogOpen,
    editingDog,
    formData,
    setFormData,
    isSubmitting,
    imageFile,
    imagePreview,
    fileInputRef,
    setIsDialogOpen,
    
    // Dog handlers
    handleOpenDialog,
    handleFileChange,
    handleClearImage,
    handleSubmit,
    handleDelete,
    
    // Rescue state
    isRescueDialogOpen,
    editingRescue,
    rescueFormData,
    setRescueFormData,
    isRescueSubmitting,
    setIsRescueDialogOpen,
    
    // Rescue handlers
    handleOpenRescueDialog,
    handleRescueSubmit: handleRescueSubmitClick,
    handleRescueDelete: handleRescueDeleteClick,
  };
}
