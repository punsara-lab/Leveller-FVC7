// Professional Notification System with Security

class NotificationManager {
  private static instance: NotificationManager;
  private isSupported = false;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.initializeNotifications();
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private async initializeNotifications() {
    // Check if notifications are supported
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    
    if (this.isSupported) {
      this.permission = Notification.permission;
      
      // Register service worker for background notifications
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered for notifications');
        } catch (error) {
          console.warn('Service Worker registration failed:', error);
        }
      }
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        this.scheduleDefaultNotifications();
        return true;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }

    return false;
  }

  public showNotification(title: string, options?: NotificationOptions) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'leveller-notification',
      requireInteraction: false,
      ...options
    };

    try {
      new Notification(title, defaultOptions);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  public scheduleMorningNotification() {
    if (this.permission !== 'granted') return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0); // 8:00 AM

    const timeUntilMorning = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification('Good Morning! 🌅', {
        body: 'Ready to level up today? Check your daily missions!',
        data: { type: 'morning-greeting', timestamp: Date.now() }
      });
      
      // Schedule next day
      this.scheduleMorningNotification();
    }, timeUntilMorning);
  }

  private scheduleDefaultNotifications() {
    // Schedule morning notification
    this.scheduleMorningNotification();

    // Schedule reminder notifications
    this.scheduleReminderNotifications();
  }

  private scheduleReminderNotifications() {
    // Evening reminder at 7 PM
    const now = new Date();
    const evening = new Date(now);
    evening.setHours(19, 0, 0, 0);
    
    if (evening.getTime() <= now.getTime()) {
      evening.setDate(evening.getDate() + 1);
    }

    const timeUntilEvening = evening.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification('Evening Check-in 🎯', {
        body: 'How did your day go? Review your progress!',
        data: { type: 'evening-reminder', timestamp: Date.now() }
      });
      
      // Reschedule for next day
      this.scheduleReminderNotifications();
    }, timeUntilEvening);
  }

  public getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  public isNotificationSupported(): boolean {
    return this.isSupported;
  }
}

// Enhanced Security Features
export class SecurityManager {
  private static readonly SECURITY_VERSION = '2024.1';
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  private static sessionStartTime = Date.now();
  private static lastActivity = Date.now();

  public static initializeSecurity() {
    // Monitor user activity
    this.trackUserActivity();
    
    // Check session validity
    setInterval(() => {
      this.validateSession();
    }, 60000); // Check every minute

    console.log(`Security System v${this.SECURITY_VERSION} initialized`);
  }

  private static trackUserActivity() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivity = Date.now();
      }, { passive: true });
    });
  }

  private static validateSession() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    
    if (timeSinceLastActivity > this.SESSION_TIMEOUT) {
      this.handleSessionTimeout();
    }
  }

  private static handleSessionTimeout() {
    console.log('Session timeout detected');
    // Could implement auto-logout or warning here
    NotificationManager.getInstance().showNotification('Session Timeout', {
      body: 'Please refresh the page to continue using LEVELLER',
      requireInteraction: true
    });
  }

  public static getSecurityInfo() {
    return {
      version: this.SECURITY_VERSION,
      sessionDuration: Date.now() - this.sessionStartTime,
      lastActivity: this.lastActivity,
      isSecure: location.protocol === 'https:'
    };
  }
}

// Enhanced Algorithm System
export class AlgorithmManager {
  private static readonly ALGORITHM_VERSION = '2024.2';
  
  public static calculateOptimalStudyTime(userLevel: number, previousSessions: number[]): number {
    // Advanced algorithm for optimal study duration
    const baseTime = 25; // Pomodoro base
    const levelMultiplier = Math.log(userLevel + 1) * 0.1;
    const consistencyBonus = this.calculateConsistencyBonus(previousSessions);
    
    return Math.round(baseTime * (1 + levelMultiplier + consistencyBonus));
  }

  private static calculateConsistencyBonus(sessions: number[]): number {
    if (sessions.length < 3) return 0;
    
    const recentSessions = sessions.slice(-7); // Last 7 days
    const average = recentSessions.reduce((a, b) => a + b, 0) / recentSessions.length;
    const variance = recentSessions.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / recentSessions.length;
    
    // Lower variance = higher consistency = bonus
    return 1 / (1 + variance * 0.01);
  }

  public static predictLevelUpTime(currentXP: number, dailyAverage: number, targetLevel: number): number {
    const xpNeeded = this.calculateXPForLevel(targetLevel) - currentXP;
    return Math.ceil(xpNeeded / Math.max(dailyAverage, 1));
  }

  private static calculateXPForLevel(level: number): number {
    // Exponential XP curve with diminishing returns
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  public static getAlgorithmInfo() {
    return {
      version: this.ALGORITHM_VERSION,
      features: [
        'Adaptive Study Time Optimization',
        'Consistency Bonus Calculation',
        'Predictive Level Analysis',
        'Performance Trend Detection'
      ]
    };
  }
}

export default NotificationManager;