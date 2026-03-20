import { eq, and, isNull, desc } from "drizzle-orm";
import webpush from "web-push";
import { db } from "../../db/index";
import { notifications } from "../../db/schema";

// SSE connections map: Map<userId, Set<Response>>
export const sseConnections = new Map<string, Set<any>>();

// Push subscriptions in-memory MVP store: Map<userId, PushSubscription[]>
export const pushSubscriptions = new Map<string, webpush.PushSubscription[]>();

// VAPID keys — only configure web-push when valid keys are present
let vapidConfigured = false;
try {
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (vapidPublic && vapidPrivate) {
    webpush.setVapidDetails(
      "mailto:admin@focusquest.app",
      vapidPublic,
      vapidPrivate,
    );
    vapidConfigured = true;
  } else {
    console.warn(
      "[notifications] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — web push disabled",
    );
  }
} catch (err) {
  console.warn(
    "[notifications] Failed to configure VAPID keys — web push disabled:",
    err,
  );
}

export type NotificationType =
  | "badge_earned"
  | "streak_reminder"
  | "level_up"
  | "institution_invite"
  | "quest_completed";

export class NotificationsService {
  async create(userId: string, type: NotificationType, payload: any) {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        payload,
        readAt: null,
      })
      .returning();

    // Emit via SSE if user has active connection
    this.emitSSE(userId, notification);

    // Emit via Web Push if user has subscription
    this.emitPush(userId, notification);

    return notification;
  }

  private emitSSE(userId: string, notification: any) {
    const connections = sseConnections.get(userId);
    if (!connections) return;
    const data = `data: ${JSON.stringify(notification)}\n\n`;
    connections.forEach((reply) => {
      try {
        reply.raw.write(data);
      } catch (err) {
        console.error("Failed to emit SSE to client", err);
      }
    });
  }

  private emitPush(userId: string, notification: any) {
    if (!vapidConfigured) return;
    const subs = pushSubscriptions.get(userId);
    if (!subs) return;

    const payload = JSON.stringify({
      title: "Nova Notificação",
      body: `Você tem uma nova notificação do tipo: ${notification.type}`,
      data: notification,
    });

    subs.forEach(async (sub, index) => {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err: any) {
        console.error("Failed to send web push notification", err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid
          subs.splice(index, 1);
        }
      }
    });
  }

  async list(userId: string, unreadOnly = false) {
    const query = db
      .select()
      .from(notifications)
      .where(
        unreadOnly
          ? and(eq(notifications.userId, userId), isNull(notifications.readAt))
          : eq(notifications.userId, userId),
      )
      .orderBy(desc(notifications.createdAt));

    return query;
  }

  async markRead(userId: string, notificationId: string) {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId),
        ),
      );
  }

  async markAllRead(userId: string) {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt)),
      );
  }

  async delete(userId: string, notificationId: string) {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId),
        ),
      );
  }
}

export const notificationsService = new NotificationsService();
