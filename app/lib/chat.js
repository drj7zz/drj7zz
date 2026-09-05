import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
export const CHAT_COOKIE = 'drj_chat_token';

export function chatConfigured() {
  return Boolean(JWT_SECRET);
}

export function hashPassword(password) {
  return bcrypt.hashSync(String(password), 10);
}

export function verifyPassword(password, hash) {
  try {
    return bcrypt.compareSync(String(password), String(hash));
  } catch (_err) {
    return false;
  }
}

/**
 * Sign a chat session token. role is 'user' or 'admin'.
 * remember=true → 30 days, otherwise a session cookie (browser close).
 */
export function createChatToken(username, role) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ username, role: role || 'user', kind: 'chat' }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyChatToken(token) {
  if (!JWT_SECRET) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.kind !== 'chat') return null;
    return payload;
  } catch (_err) {
    return null;
  }
}

export async function getChatSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CHAT_COOKIE)?.value;
  if (!token) return null;
  return verifyChatToken(token);
}

// In-memory fallback stores when MongoDB is unreachable
if (!global._memoryChatUsers) {
  global._memoryChatUsers = [];
}
if (!global._memoryChatMessages) {
  global._memoryChatMessages = [];
}

export function getChatStores(db) {
  if (db) {
    return {
      source: 'mongodb',
      users: db.collection('chat_users'),
      messages: db.collection('chat_messages')
    };
  }

  // Fallback in-memory collection emulator
  const users = {
    async findOne({ username }) {
      return global._memoryChatUsers.find(u => u.username === username) || null;
    },
    async insertOne(doc) {
      global._memoryChatUsers.push(doc);
      return { insertedId: doc.username };
    },
    async updateOne({ username }, update, options) {
      let existing = global._memoryChatUsers.find(u => u.username === username);
      if (!existing && options?.upsert) {
        existing = { username, createdAt: new Date() };
        global._memoryChatUsers.push(existing);
      }
      if (existing && update?.$set) {
        Object.assign(existing, update.$set);
      }
      return { acknowledged: true };
    }
  };

  const messages = {
    find(query) {
      return {
        sort() {
          return {
            limit() {
              return {
                async toArray() {
                  let list = global._memoryChatMessages;
                  if (query?.username) {
                    list = list.filter(m => m.username === query.username);
                  }
                  return [...list].sort((a, b) => new Date(a.at) - new Date(b.at));
                }
              };
            }
          };
        }
      };
    },
    async insertOne(doc) {
      const savedDoc = { ...doc, _id: String(Date.now() + Math.random()) };
      global._memoryChatMessages.push(savedDoc);
      return { insertedId: savedDoc._id };
    },
    aggregate() {
      return {
        async toArray() {
          const map = new Map();
          for (const m of global._memoryChatMessages) {
            const list = map.get(m.username) || [];
            list.push(m);
            map.set(m.username, list);
          }
          const results = [];
          for (const [uname, list] of map.entries()) {
            list.sort((a, b) => new Date(b.at) - new Date(a.at));
            results.push({
              _id: uname,
              last: list[0],
              count: list.length
            });
          }
          results.sort((a, b) => new Date(b.last.at) - new Date(a.last.at));
          return results;
        }
      };
    },
    async deleteMany(filter) {
      if (filter?.username) {
        global._memoryChatMessages = global._memoryChatMessages.filter(m => m.username !== filter.username);
      } else {
        global._memoryChatMessages = [];
      }
      return { acknowledged: true };
    }
  };

  return { source: 'memory', users, messages };
}
