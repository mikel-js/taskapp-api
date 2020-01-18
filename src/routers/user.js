const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendByeEmail } = require('../emails/account')



router.get('/test', (req, res) => {
  res.send('testing')
})

// parse ung s postman n json. tpos ung incoming data nsa req nung app.post
router.use(express.json())

// app.post('/users', async (req, res)=> {
//   const user = new User(req.body)

//   try {
//     await user.save()
//     res.status(201).send(user)
//   } catch (e) {
//     res.status(400).send(e)
//   }
// })

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user: user, token: token })
  } catch (e) {
    res.status(400).send()
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send(e)
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send(e)
  }
})


// router.get('/users', auth, async (req, res) => {
//   try {
//     const users = await User.find({})
//     res.send(users)
//   } catch (e) {
//     res.status(500).send(e)
//   }
// })

// get user when only authenticated
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})


// updating user 
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update)
  })
  console.log(updates)
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid Updates!' })
  }

  try {
    // ieedit to pra mause ung schema(password) or ung middleware
    // 1st params ung ieedit, 2nd ung changes
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

    updates.forEach((update) => {
      req.user[update] = req.body[update]
    })

    await req.user.save()
    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    // merong _id sa auth kasi ksma un db. tpos me user don s const
    // const user = await User.findByIdAndDelete(req.user._id)

    // if (!user) {
    //   return res.status(404).send()
    // }
    await req.user.remove()
    sendByeEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send(e)
  }
})

const upload = multer({
  // disable sya pra maaccess yung buffer s baba
  // dest: 'avatars',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('File type not supported'))
    }
    cb(undefined, true)
  }
})
router.post('/users/me/avatar', upload.single('avatar'), auth, async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
  req.user.avatar = buffer
  // req.user.avatar = req.file.buffer
  await req.user.save()
  res.send()
}, (err, req, res, next) => {
  res.status(400).send({ error: err.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.status(200).send()
}, (err, req, res, next) => {
  res.status(400).send({ error: err.message })
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if(!user || !user.avatar) {
      throw new Error()
    }
    // Content type e header lng un. image/jpg e ano ung what type of data ung irreturn back
    res.set('Content-Type','image/png')
    res.send(user.avatar)
  } catch(e) {
    res.status(404).send()
  }
})

module.exports = router