/**
 * Maintenance Mode Utilities
 * 
 * This file provides utilities for managing maintenance mode across the application.
 * Includes safeguards to prevent accidental activation and ensure smooth user experience.
 */

// Constants
export const MAINTENANCE_BYPASS_KEY = 'maintenance_bypass';
export const MAINTENANCE_MODE_KEY = 'maintenance_mode';
export const MAINTENANCE_LAST_STATE = 'maintenance_last_state';

// Environment detection
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

/**
 * Check if maintenance mode is active
 * @returns boolean indicating if maintenance mode is active
 */
export function isMaintenanceMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check if maintenance mode is manually enabled
    const maintenanceMode = localStorage.getItem(MAINTENANCE_MODE_KEY);
    if (maintenanceMode === 'true') return true;
    
    // Check if there's a valid bypass token
    const bypass = localStorage.getItem(MAINTENANCE_BYPASS_KEY);
    return bypass !== 'true';
  } catch (error) {
    // If localStorage access fails, default to not in maintenance mode
    console.error('Error checking maintenance mode:', error);
    return false;
  }
}

/**
 * Enable maintenance mode
 * @param force If true, enables maintenance mode even in production (use with caution)
 * @returns boolean indicating if maintenance mode was successfully enabled
 */
export function enableMaintenanceMode(force: boolean = false): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Store the current state before enabling maintenance mode
    const currentPath = window.location.pathname;
    if (currentPath !== '/maintenance') {
      localStorage.setItem(MAINTENANCE_LAST_STATE, currentPath);
    }
    
    // Safety check for production environments
    if (isProduction && !force) {
      console.warn('Attempted to enable maintenance mode in production without force flag');
      return false;
    }
    
    localStorage.setItem(MAINTENANCE_MODE_KEY, 'true');
    // Clear any existing bypass
    localStorage.removeItem(MAINTENANCE_BYPASS_KEY);
    return true;
  } catch (error) {
    console.error('Error enabling maintenance mode:', error);
    return false;
  }
}

/**
 * Disable maintenance mode
 * @returns boolean indicating if maintenance mode was successfully disabled
 */
export function disableMaintenanceMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(MAINTENANCE_MODE_KEY);
    // Set bypass to true to prevent automatic redirects
    localStorage.setItem(MAINTENANCE_BYPASS_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Error disabling maintenance mode:', error);
    return false;
  }
}

/**
 * Clear all maintenance-related storage
 * @returns boolean indicating if maintenance state was successfully cleared
 */
export function clearMaintenanceState(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(MAINTENANCE_MODE_KEY);
    localStorage.removeItem(MAINTENANCE_BYPASS_KEY);
    localStorage.removeItem(MAINTENANCE_LAST_STATE);
    return true;
  } catch (error) {
    console.error('Error clearing maintenance state:', error);
    return false;
  }
}

/**
 * Redirect to maintenance page
 * @param saveCurrentPath If true, saves the current path to return to later
 */
export function redirectToMaintenance(saveCurrentPath: boolean = true): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Save current path if not already on maintenance page
    if (saveCurrentPath && window.location.pathname !== '/maintenance') {
      localStorage.setItem(MAINTENANCE_LAST_STATE, window.location.pathname);
    }
    
    // Only redirect if we're not already on the maintenance page
    if (window.location.pathname !== '/maintenance') {
      window.location.href = '/maintenance';
    }
  } catch (error) {
    console.error('Error redirecting to maintenance page:', error);
  }
}

/**
 * Redirect from maintenance page to home or last visited page
 */
export function redirectFromMaintenance(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Set bypass to true
    localStorage.setItem(MAINTENANCE_BYPASS_KEY, 'true');
    
    // Check if we have a saved path to return to
    const lastPath = localStorage.getItem(MAINTENANCE_LAST_STATE);
    if (lastPath && lastPath !== '/maintenance') {
      window.location.href = `${lastPath}?bypass=true`;
    } else {
      window.location.href = '/?bypass=true';
    }
  } catch (error) {
    console.error('Error redirecting from maintenance page:', error);
    // Fallback to home page if there's an error
    window.location.href = '/?bypass=true';
  }
}
