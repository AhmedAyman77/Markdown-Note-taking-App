import { Router } from 'express';
import { userLogin, userRegister, deleteUser } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.post('/register', userRegister);
userRouter.post('/login', userLogin);
userRouter.delete('/:id', deleteUser);

export default userRouter;