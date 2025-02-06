import { Pool } from 'pg'
import { Post, Lock, PostWithLocks, Reply } from '../../types'

export class DatabaseService {
    private pool: Pool

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        })
    }

    async createPost(id: string, content: string): Promise<Post> {
        const result = await this.pool.query(
            'INSERT INTO posts (id, content) VALUES ($1, $2) RETURNING *',
            [id, content]
        )
        return result.rows[0]
    }

    async createLock(
        id: string,
        postId: string,
        amount: number,
        unlockTxId: string
    ): Promise<Lock> {
        const lockUntil = new Date(Date.now() + 10 * 60 * 1000)
        const result = await this.pool.query(
            'INSERT INTO locks (id, post_id, amount, lock_until, unlock_tx_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, postId, amount, lockUntil, unlockTxId]
        )
        return result.rows[0]
    }

    async getTopPosts(limit = 50): Promise<Post[]> {
        const result = await this.pool.query(`
            SELECT 
                p.*,
                COALESCE(SUM(l.amount), 0) as total_locked,
                COUNT(DISTINCT l.id) as lock_count,
                MAX(l.created_at) as last_locked_at
            FROM posts p
            LEFT JOIN locks l ON p.id = l.post_id AND l.lock_until > NOW()
            GROUP BY p.id
            ORDER BY total_locked DESC, created_at DESC
            LIMIT $1
        `, [limit])
        return result.rows
    }

    async getPostWithLocks(id: string): Promise<PostWithLocks | null> {
        const post = await this.pool.query(`
            SELECT 
                p.*,
                COALESCE(SUM(l.amount), 0) as total_locked,
                COUNT(DISTINCT l.id) as lock_count
            FROM posts p
            LEFT JOIN locks l ON p.id = l.post_id AND l.lock_until > NOW()
            WHERE p.id = $1
            GROUP BY p.id
        `, [id])

        if (post.rows.length === 0) {
            return null
        }

        const locks = await this.pool.query(`
            SELECT *
            FROM locks
            WHERE post_id = $1 AND lock_until > NOW()
            ORDER BY amount DESC
        `, [id])

        return {
            ...post.rows[0],
            locks: locks.rows
        }
    }

    async getLocks(postId: string): Promise<Lock[]> {
        const result = await this.pool.query(`
            SELECT *
            FROM locks
            WHERE post_id = $1 AND lock_until > NOW()
            ORDER BY amount DESC
        `, [postId])
        return result.rows
    }

    async createReply(id: string, postId: string, content: string): Promise<Reply> {
        const result = await this.pool.query(
            'INSERT INTO replies (id, post_id, content) VALUES ($1, $2, $3) RETURNING *',
            [id, postId, content]
        )
        return result.rows[0]
    }

    async getReplies(postId: string): Promise<Reply[]> {
        const result = await this.pool.query(`
            SELECT *
            FROM replies
            WHERE post_id = $1
            ORDER BY created_at DESC
        `, [postId])
        return result.rows
    }
}

export const db = new DatabaseService() 