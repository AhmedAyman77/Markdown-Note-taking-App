import { Router } from 'express';
import { userLogin, userRegister } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.post('/register', userRegister);
userRouter.post('/login', userLogin);

export default userRouter;