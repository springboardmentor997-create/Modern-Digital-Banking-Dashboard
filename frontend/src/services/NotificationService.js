class NotificationService {
  constructor() {
    this.permission = null;
    this.init();
  }

  async init() {
    if ('Notification' in window) {
      this.permission = await this.requestPermission();
    }
  }

  async requestPermission() {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return Notification.permission;
  }

  showNotification(title, options = {}) {
    if (this.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }

  showBudgetAlert(budgetName, spent, limit) {
    const percentage = (spent / limit) * 100;
    if (percentage >= 80) {
      const title = percentage >= 100 ? '🚨 Budget Exceeded!' : '⚠️ Budget Warning';
      const body = percentage >= 100 
        ? `You've exceeded your ${budgetName} budget by ₹${(spent - limit).toFixed(2)}`
        : `You've used ${percentage.toFixed(0)}% of your ${budgetName} budget`;
      
      this.showNotification(title, { body, requireInteraction: true });
    }
  }

  showTransactionAlert(amount, type, description) {
    const title = type === 'income' ? '💰 Income Added' : '💸 Expense Added';
    this.showNotification(title, { body: `₹${amount} - ${description}` });
  }
}

export default new NotificationService();