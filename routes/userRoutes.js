import express from 'express'
import { validate, signUpSchema } from '../models/userModel.js'
import { login, register } from '../controllers/userController.js'

const router = express.Router()

// register
router.route('/register').post(validate(signUpSchema), register)

// login
router.route('/login').post(login)

export default router