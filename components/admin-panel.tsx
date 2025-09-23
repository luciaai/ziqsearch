"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MaintenanceTrigger } from '@/components/maintenance-trigger';
import { Gear, Shield } from '@phosphor-icons/react';

export function AdminPanel() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" title="Admin Panel">
          <Shield size={20} weight="fill" className="text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Admin Panel</DialogTitle>
          <DialogDescription>
            Access administrative functions and settings
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="maintenance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="maintenance" className="py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Maintenance Mode</h3>
              <p className="text-sm text-muted-foreground">
                Enable or disable maintenance mode for the application. When enabled, 
                users will be redirected to the maintenance page.
              </p>
              <MaintenanceTrigger className="mt-4" />
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Admin Settings</h3>
              <p className="text-sm text-muted-foreground">
                Additional administrative settings will appear here.
              </p>
              <Button variant="outline" className="w-full" disabled>
                <Gear size={16} className="mr-2" />
                More Settings Coming Soon
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
