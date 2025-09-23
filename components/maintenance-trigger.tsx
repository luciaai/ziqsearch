"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  enableMaintenanceMode,
  disableMaintenanceMode,
  isMaintenanceMode,
  redirectToMaintenance,
  clearMaintenanceState
} from '@/lib/maintenance';

interface MaintenanceTriggerProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default';
  className?: string;
}

export function MaintenanceTrigger({ 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: MaintenanceTriggerProps) {
  const [inMaintenanceMode, setInMaintenanceMode] = useState(false);
  
  // Check current maintenance mode status
  useEffect(() => {
    setInMaintenanceMode(isMaintenanceMode());
  }, []);
  
  const handleToggleMaintenance = () => {
    if (inMaintenanceMode) {
      const success = disableMaintenanceMode();
      if (success) {
        toast.success('Maintenance mode disabled', {
          description: 'You can now access all features of the application.'
        });
        setInMaintenanceMode(false);
      } else {
        toast.error('Failed to disable maintenance mode', {
          description: 'Please try again or clear maintenance state.'
        });
      }
    } else {
      // Confirm before enabling in production
      const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
      
      if (isProduction) {
        if (!confirm('Are you sure you want to enable maintenance mode in production?')) {
          return;
        }
      }
      
      const success = enableMaintenanceMode(isProduction);
      if (success) {
        toast.warning('Maintenance mode enabled', {
          description: 'You will be redirected to the maintenance page.',
          action: {
            label: 'Go Now',
            onClick: () => redirectToMaintenance()
          }
        });
        
        setInMaintenanceMode(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          redirectToMaintenance();
        }, 3000);
      } else {
        toast.error('Failed to enable maintenance mode', {
          description: 'Please try again.'
        });
      }
    }
  };
  
  const handleClearState = () => {
    const success = clearMaintenanceState();
    if (success) {
      toast.info('Maintenance state cleared', {
        description: 'All maintenance settings have been reset.'
      });
      setInMaintenanceMode(false);
    } else {
      toast.error('Failed to clear maintenance state', {
        description: 'Please try again or refresh the page.'
      });
    }
  };
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Button 
        variant={variant} 
        size={size}
        onClick={handleToggleMaintenance}
        className={inMaintenanceMode ? "bg-green-600 hover:bg-green-700 text-white" : ""}
      >
        {inMaintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClearState}
        className="text-xs"
      >
        Reset Maintenance State
      </Button>
    </div>
  );
}
