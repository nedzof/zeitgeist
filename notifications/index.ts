import Pusher from 'pusher'

export class NotificationService {
    private pusher: Pusher

    constructor() {
        this.pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID!,
            key: process.env.PUSHER_KEY!,
            secret: process.env.PUSHER_SECRET!,
            cluster: process.env.PUSHER_CLUSTER!,
            useTLS: true
        })
    }

    async notifyNewLock(postId: string, amount: number) {
        await this.pusher.trigger('locks', 'new-lock', {
            postId,
            amount,
            timestamp: new Date().toISOString()
        })
    }
} 