import { EventEmitter } from 'events';

export interface NotificationConfig {
  enabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    webhook: boolean;
  };
  webhookUrl?: string;
  emailConfig?: {
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
    fromEmail: string;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  category: 'job_discovered' | 'proposal_sent' | 'response_received' | 'interview_scheduled' | 'offer_received' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  actionRequired?: boolean;
  actionUrl?: string;
}

export interface SystemStatus {
  automationEngine: 'running' | 'stopped' | 'error';
  proposalGenerator: 'active' | 'inactive' | 'error';
  emailService: 'active' | 'inactive' | 'error';
  applicationService: 'active' | 'inactive' | 'error';
  lastHealthCheck: Date;
  errors: string[];
  warnings: string[];
}

export class RealTimeNotificationService extends EventEmitter {
  private config: NotificationConfig;
  private notifications: Map<string, Notification> = new Map();
  private systemStatus: SystemStatus;
  private subscribers: Map<string, WebSocket[]> = new Map();

  constructor(config: NotificationConfig) {
    super();
    this.config = config;
    this.systemStatus = {
      automationEngine: 'stopped',
      proposalGenerator: 'inactive',
      emailService: 'inactive',
      applicationService: 'inactive',
      lastHealthCheck: new Date(),
      errors: [],
      warnings: []
    };
    this.startHealthMonitoring();
  }

  /**
   * Send real-time notification
   */
  async sendNotification(
    userId: string,
    type: Notification['type'],
    category: Notification['category'],
    title: string,
    message: string,
    data?: any,
    options?: {
      priority?: Notification['priority'];
      actionRequired?: boolean;
      actionUrl?: string;
    }
  ): Promise<string> {
    const notification: Notification = {
      id: this.generateId(),
      type,
      category,
      title,
      message,
      data,
      timestamp: new Date(),
      read: false,
      priority: options?.priority || 'medium',
      userId,
      actionRequired: options?.actionRequired || false,
      actionUrl: options?.actionUrl
    };

    this.notifications.set(notification.id, notification);

    // Send via configured channels
    await this.deliverNotification(notification);

    // Emit event for real-time updates
    this.emit('notification', notification);

    return notification.id;
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    notifications: Array<{
      userId: string;
      type: Notification['type'];
      category: Notification['category'];
      title: string;
      message: string;
      data?: any;
    }>
  ): Promise<string[]> {
    const notificationIds: string[] = [];

    for (const notif of notifications) {
      const id = await this.sendNotification(
        notif.userId,
        notif.type,
        notif.category,
        notif.title,
        notif.message,
        notif.data
      );
      notificationIds.push(id);
    }

    return notificationIds;
  }

  /**
   * Update system status
   */
  updateSystemStatus(
    component: keyof Omit<SystemStatus, 'lastHealthCheck' | 'errors' | 'warnings'>,
    status: 'running' | 'stopped' | 'error' | 'active' | 'inactive',
    error?: string
  ): void {
    this.systemStatus[component] = status as any;
    this.systemStatus.lastHealthCheck = new Date();

    if (error) {
      this.systemStatus.errors.push(`${component}: ${error}`);
      // Keep only last 10 errors
      if (this.systemStatus.errors.length > 10) {
        this.systemStatus.errors = this.systemStatus.errors.slice(-10);
      }
    }

    // Send system notifications for critical issues
    if (status === 'error') {
      this.sendSystemNotification(
        'error',
        `${component} Error`,
        `System component ${component} has encountered an error: ${error}`,
        { component, error }
      );
    }

    this.emit('system_status_updated', this.systemStatus);
  }

  /**
   * Add warning to system status
   */
  addSystemWarning(warning: string): void {
    this.systemStatus.warnings.push(warning);
    // Keep only last 10 warnings
    if (this.systemStatus.warnings.length > 10) {
      this.systemStatus.warnings = this.systemStatus.warnings.slice(-10);
    }

    this.sendSystemNotification(
      'warning',
      'System Warning',
      warning,
      { warning }
    );
  }

  /**
   * Get notifications for user
   */
  getUserNotifications(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      category?: Notification['category'];
      limit?: number;
    }
  ): Notification[] {
    let notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);

    if (options?.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    if (options?.category) {
      notifications = notifications.filter(n => n.category === options.category);
    }

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options?.limit) {
      notifications = notifications.slice(0, options.limit);
    }

    return notifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.emit('notification_read', notification);
      return true;
    }
    return false;
  }

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead(userId: string): number {
    let count = 0;
    for (const notification of this.notifications.values()) {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        count++;
      }
    }
    this.emit('notifications_bulk_read', { userId, count });
    return count;
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): boolean {
    const deleted = this.notifications.delete(notificationId);
    if (deleted) {
      this.emit('notification_deleted', notificationId);
    }
    return deleted;
  }

  /**
   * Get system status
   */
  getSystemStatus(): SystemStatus {
    return { ...this.systemStatus };
  }

  /**
   * Subscribe to real-time notifications via WebSocket
   */
  subscribe(userId: string, ws: WebSocket): void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, []);
    }
    this.subscribers.get(userId)!.push(ws);

    // Send current unread notifications
    const unreadNotifications = this.getUserNotifications(userId, { unreadOnly: true });
    ws.send(JSON.stringify({
      type: 'initial_notifications',
      data: unreadNotifications
    }));

    // Send current system status
    ws.send(JSON.stringify({
      type: 'system_status',
      data: this.systemStatus
    }));

    // Handle WebSocket close
    ws.on('close', () => {
      this.unsubscribe(userId, ws);
    });
  }

  /**
   * Unsubscribe from notifications
   */
  unsubscribe(userId: string, ws: WebSocket): void {
    const userSockets = this.subscribers.get(userId);
    if (userSockets) {
      const index = userSockets.indexOf(ws);
      if (index > -1) {
        userSockets.splice(index, 1);
      }
      if (userSockets.length === 0) {
        this.subscribers.delete(userId);
      }
    }
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(userId: string): {
    total: number;
    unread: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
    todayCount: number;
  } {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.read).length,
      byCategory: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      todayCount: userNotifications.filter(n => n.timestamp >= today).length
    };

    userNotifications.forEach(n => {
      stats.byCategory[n.category] = (stats.byCategory[n.category] || 0) + 1;
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
    });

    return stats;
  }

  private async deliverNotification(notification: Notification): Promise<void> {
    const promises: Promise<void>[] = [];

    // In-app notification (WebSocket)
    if (this.config.channels.inApp) {
      promises.push(this.sendInAppNotification(notification));
    }

    // Email notification
    if (this.config.channels.email && this.shouldSendEmail(notification)) {
      promises.push(this.sendEmailNotification(notification));
    }

    // Push notification
    if (this.config.channels.push) {
      promises.push(this.sendPushNotification(notification));
    }

    // Webhook notification
    if (this.config.channels.webhook && this.config.webhookUrl) {
      promises.push(this.sendWebhookNotification(notification));
    }

    await Promise.allSettled(promises);
  }

  private async sendInAppNotification(notification: Notification): Promise<void> {
    const userSockets = this.subscribers.get(notification.userId) || [];
    const message = JSON.stringify({
      type: 'notification',
      data: notification
    });

    userSockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    if (!this.config.emailConfig) return;

    try {
      // Email sending logic would go here
      console.log(`Email notification sent: ${notification.title}`);
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // Push notification logic would go here
      console.log(`Push notification sent: ${notification.title}`);
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  private async sendWebhookNotification(notification: Notification): Promise<void> {
    if (!this.config.webhookUrl) return;

    try {
      await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'notification',
          data: notification
        })
      });
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
    }
  }

  private shouldSendEmail(notification: Notification): boolean {
    // Only send email for high priority or urgent notifications
    return notification.priority === 'high' || notification.priority === 'urgent';
  }

  private async sendSystemNotification(
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    // Send to all active users
    const activeUsers = Array.from(this.subscribers.keys());
    
    for (const userId of activeUsers) {
      await this.sendNotification(
        userId,
        type,
        'system',
        title,
        message,
        data,
        { priority: type === 'error' ? 'urgent' : 'high' }
      );
    }
  }

  private startHealthMonitoring(): void {
    // Monitor system health every 30 seconds
    setInterval(() => {
      this.performHealthCheck();
    }, 30 * 1000);
  }

  private performHealthCheck(): void {
    this.systemStatus.lastHealthCheck = new Date();

    // Check if components are responding
    const checks = [
      this.checkAutomationEngine(),
      this.checkProposalGenerator(),
      this.checkEmailService(),
      this.checkApplicationService()
    ];

    Promise.allSettled(checks).then(results => {
      results.forEach((result, index) => {
        const components = ['automationEngine', 'proposalGenerator', 'emailService', 'applicationService'];
        const component = components[index] as keyof SystemStatus;
        
        if (result.status === 'rejected') {
          this.updateSystemStatus(component, 'error', result.reason);
        }
      });
    });

    // Emit health check event
    this.emit('health_check', this.systemStatus);
  }

  private async checkAutomationEngine(): Promise<void> {
    // Health check logic for automation engine
    return Promise.resolve();
  }

  private async checkProposalGenerator(): Promise<void> {
    // Health check logic for proposal generator
    return Promise.resolve();
  }

  private async checkEmailService(): Promise<void> {
    // Health check logic for email service
    return Promise.resolve();
  }

  private async checkApplicationService(): Promise<void> {
    // Health check logic for application service
    return Promise.resolve();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Clean up old notifications (call this periodically)
   */
  cleanupOldNotifications(daysToKeep: number = 30): number {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, notification] of this.notifications.entries()) {
      if (notification.timestamp < cutoffDate) {
        this.notifications.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

export default RealTimeNotificationService;
