import { Router } from 'express';
import { z } from 'zod';
import { store } from '../../store.js';
import { validate } from '../../lib/validate.js';
import { ApiError, asyncH } from '../../lib/errors.js';
import { hashPassword, verifyPassword } from '../../lib/passwords.js';
import { signToken, authRequired, publicUser } from '../../lib/auth.js';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır').max(60),
  email: z.string().email('Düzgün e-poçt daxil edin').max(120),
  password: z
    .string()
    .min(8, 'Şifrə ən azı 8 simvol olmalıdır')
    .regex(/\d/, 'Şifrədə ən azı bir rəqəm olmalıdır')
});

const loginSchema = z.object({
  email: z.string().email('Düzgün e-poçt daxil edin'),
  password: z.string().min(1, 'Şifrə tələb olunur')
});

authRouter.post(
  '/register',
  validate(registerSchema),
  asyncH(async (req, res) => {
    const { name, email, password } = req.body;
    if (store.findUserByEmail(email)) {
      throw ApiError.conflict('Bu e-poçt artıq qeydiyyatdan keçib');
    }
    const user = {
      id: store.id('u'),
      name,
      email,
      passwordHash: hashPassword(password),
      role: 'user',
      avatarHue: Math.floor(Math.random() * 360),
      joinedAt: new Date().toISOString()
    };
    store.users.set(user.id, user);
    store.persist();
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  })
);

authRouter.post(
  '/login',
  validate(loginSchema),
  asyncH(async (req, res) => {
    const { email, password } = req.body;
    const user = store.findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw ApiError.unauthorized('E-poçt və ya şifrə yanlışdır');
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

authRouter.get('/me', authRequired, (req, res) => {
  res.json({ user: publicUser(req.user) });
});
