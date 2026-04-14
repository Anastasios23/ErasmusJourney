-- Add UNPUBLISHED audit action for admin unpublish control.
ALTER TYPE "ReviewActionType" ADD VALUE IF NOT EXISTS 'UNPUBLISHED';
